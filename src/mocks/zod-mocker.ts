import { en, Faker, faker } from '@faker-js/faker';
import {
  z,
  ZodArray,
  ZodBoolean,
  ZodDefault,
  ZodEmail,
  ZodEnum,
  ZodISODateTime,
  ZodLiteral,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  type ZodRawShape,
  ZodReadonly,
  ZodRecord,
  ZodString,
  ZodType,
  ZodUnion,
  ZodURL,
  ZodUUID,
} from 'zod/v4';
import { $ZodType } from 'zod/v4/core';

// Helper type for checking if a type can be null
type IsNullable<T> = null extends T ? true : false;
// Helper type for checking if a type can be undefined
type IsOptional<T> = undefined extends T ? true : false;

// Helper type for deep partial objects (makes all properties optional recursively)
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: T[P] extends (infer U)[]
        ? DeepPartial<U>[]
        : DeepPartial<T[P]>;
    }
  : T;

// Helper type for check if a type is an object (but not an array or a function)
type IsObject<T> = T extends object
  ? T extends unknown[]
    ? false
    : T extends () => unknown
      ? false
      : true
  : false;

// Main type for retrieving nullable fields
type ExtractNullableFields<T, Path extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? IsObject<T[K]> extends true
        // If the field is an object, we process it recursively
          ? ExtractNullableFields<T[K], Path extends '' ? `${K}` : `${Path}.${K}`>
        // If a field can be null, add its path
          : IsNullable<T[K]> extends true
            ? Path extends ''
              ? K
              : `${Path}.${K}`
            : never
        : never
    }[keyof T]
  : never;

// Main type for retrieving optional fields
type ExtractOptionalFields<T, Path extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? IsObject<T[K]> extends true
        // If the field is an object, we process it recursively
          ? ExtractOptionalFields<T[K], Path extends '' ? `${K}` : `${Path}.${K}`>
        // If a field can be undefined, add its path
          : IsOptional<T[K]> extends true
            ? Path extends ''
              ? K
              : `${Path}.${K}`
            : never
        : never
    }[keyof T]
  : never;

const deleteUndefinedEntries = <O extends Record<string, unknown>>(
  obj: O,
): Partial<O> => {
  const keysToRemove: string[] = [];
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined) {
      keysToRemove.push(key);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      deleteUndefinedEntries(obj[key] as Record<string, unknown>);
    }
  });
  keysToRemove.forEach((key) => {
    delete obj[key];
  });
  return obj;
};

/**
 * Recursively merge supplied object values into the generated mock data
 */
const deepMerge = <T>(target: T, source: DeepPartial<T>): T => {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = (result as Record<string, unknown>)[key];

      if (sourceValue !== undefined) {
        if (
          typeof sourceValue === 'object'
          && sourceValue !== null
          && !Array.isArray(sourceValue)
          && typeof targetValue === 'object'
          && targetValue !== null
          && !Array.isArray(targetValue)
        ) {
          // Recursively merge nested objects
          (result as Record<string, unknown>)[key] = deepMerge(
            targetValue,
            sourceValue,
          );
        } else {
          // Direct override for primitives, arrays, and null values
          (result as Record<string, unknown>)[key] = sourceValue;
        }
      }
    }
  }

  return result;
};

/**
 * Configuration options for the ZodMocker class
 */
export interface ZodMockerConfig {
  /** Seed for reproducible random data generation */
  seed?: number;
  /** Custom generators for specific schema types */
  customGenerators?: Map<string, (_faker: Faker) => unknown>;
  /** Chance of null values */
  nullChance?: number;
  /** Chance of undefined values */
  undefinedChance?: number;
  /** Chance of default values */
  defaultChance?: number;
  /** Default lengths for string, array, and record types */
  lengths?: Partial<Record<'string' | 'array' | 'record', Record<'min' | 'max', number>>>;
}

export const createZodMocker = (
  config: ZodMockerConfig = {},
) => {
  const defaultConfig = {
    nullChance: 0.3,
    undefinedChance: 0.3,
    defaultChance: 0.3,
    lengths: {
      string: { min: 5, max: 20 },
      array: { min: 1, max: 5 },
      record: { min: 1, max: 5 },
    },
  };

  if (config.nullChance
    && (config.nullChance < 0 || config.nullChance > 1)
  ) {
    throw new Error('nullChance must be a number between 0 and 1');
  }

  if (config.undefinedChance
    && (config.undefinedChance < 0 || config.undefinedChance > 1)
  ) {
    throw new Error('undefinedChance must be a number between 0 and 1');
  }

  if (config.defaultChance
    && (config.defaultChance < 0 || config.defaultChance > 1)
  ) {
    throw new Error('defaultChance must be a number between 0 and 1');
  }

  const finalConfig = { ...defaultConfig, ...config };

  return class ZodMocker<
    Schema extends $ZodType,
    NullableKey = ExtractNullableFields<z.infer<Schema>>,
    OptionalKey = ExtractOptionalFields<z.infer<Schema>>,
  > {
    private readonly config: ZodMockerConfig;
    private readonly faker: Faker;
    private readonly customGenerators: Map<string, (_faker: Faker) => unknown>;
    private readonly schema: Schema;
    private explicitlyWithNull: NullableKey[] = [];
    private explicitlyWithNotNull: NullableKey[] = [];
    private explicitlyDefined: OptionalKey[] = [];
    private explicitlyNotDefined: OptionalKey[] = [];
    private suppliedObject: DeepPartial<z.infer<Schema>> | null = null;

    constructor(schema: Schema) {
      this.config = finalConfig;
      this.customGenerators = config.customGenerators ?? new Map();
      this.schema = schema;
      this.faker = faker;

      if (finalConfig.seed !== undefined) {
        this.faker = new Faker({ locale: en, seed: finalConfig.seed });
      }
    }

    /**
     * A set of fields whose values must be null
     * @param nullableFieldPaths - A set of fields whose type can be null
     */
    public setNulls(
      nullableFieldPaths: NullableKey[],
    ) {
      const duplicates = nullableFieldPaths.filter((path) =>
        this.explicitlyWithNotNull.includes(path),
      );
      if (duplicates.length > 0) {
        throw new Error(`Cannot set nulls for fields: [${duplicates.join(', ')}] because it is explicitly set to not null`);
      }

      const undefinedFields = nullableFieldPaths.filter((path) =>
        this.explicitlyNotDefined.includes(path as unknown as OptionalKey),
      );
      if (undefinedFields.length > 0) {
        throw new Error(`Cannot set nulls for fields: [${undefinedFields.join(', ')}] because it is explicitly set to undefined`);
      }

      this.explicitlyWithNull = nullableFieldPaths;
      return this;
    }

    /**
     * A set of fields whose values must not be null
     * @param nullableFieldPaths - A set of fields whose type can be null
     */
    public setNotNulls(
      nullableFieldPaths: NullableKey[],
    ) {
      const duplicates = nullableFieldPaths.filter((path) =>
        this.explicitlyWithNull.includes(path),
      );
      if (duplicates.length > 0) {
        throw new Error(`Cannot set not nulls for fields: [${duplicates.join(', ')}] because it is explicitly set to null`);
      }

      const undefinedFields = nullableFieldPaths.filter((path) =>
        this.explicitlyNotDefined.includes(path as unknown as OptionalKey),
      );
      if (undefinedFields.length > 0) {
        throw new Error(`Cannot set not nulls for fields: [${undefinedFields.join(', ')}] because it is explicitly set to undefined`);
      }

      this.explicitlyWithNotNull = nullableFieldPaths;
      return this;
    }

    /**
     * Sets a set of fields that should be present in the object
     * @param optionalFieldPaths - A set of fields whose type can be undefined
     */
    public setDefined(
      optionalFieldPaths: OptionalKey[],
    ) {
      const duplicates = optionalFieldPaths.filter((path) =>
        this.explicitlyNotDefined.includes(path),
      );
      if (duplicates.length > 0) {
        throw new Error(`Cannot set not undefined for fields: [${duplicates.join(', ')}] because it is explicitly set to not undefined`);
      }
      this.explicitlyDefined = optionalFieldPaths;
      return this;
    }

    /**
     * Sets a set of fields that should not be present in the object
     * @param optionalFieldPaths - A set of fields whose type can be undefined
     */
    public setUndefined(
      optionalFieldPaths: OptionalKey[],
    ) {
      const duplicates = optionalFieldPaths.filter((path) =>
        this.explicitlyDefined.includes(path),
      );
      if (duplicates.length > 0) {
        throw new Error(`Cannot set undefined for fields: [${duplicates.join(', ')}] because it is explicitly set to undefined`);
      }
      this.explicitlyNotDefined = optionalFieldPaths;
      return this;
    }

    /**
     * Reset faker seed for reproducible results
     * @param seed - New seed value
     */
    public setSeed(seed: number): void {
      this.faker.seed(seed);
    }

    /**
     * Supply specific values as a partial object that will be merged into the generated mock data
     * @param suppliedObject - Deep partial object with values to override in the generated data
     * @example
     * // For schema: z.object({ user: z.object({ name: z.string(), age: z.number() }) })
     * supply({ user: { name: 'John' } }) // age will be generated automatically
     */
    public supply(suppliedObject: DeepPartial<z.infer<Schema>>) {
      this.suppliedObject = suppliedObject;
      return this;
    }

    /**
     * Generate mock data based on the provided Zod schema
     * @returns Mock data that conforms to the schema type
     */
    public mock(): z.infer<Schema> {
      let result = this.generateMockData(this.schema) as z.infer<Schema>;

      // Apply supplied object values after generation
      if (this.suppliedObject) {
        result = deepMerge(result, this.suppliedObject);
      }

      if (typeof result === 'object' && result !== null) {
        return deleteUndefinedEntries(
          result as Record<string, unknown>,
        ) as z.infer<Schema>;
      }
      return result;
    }

    /**
     * Generate multiple mock instances
     * @param count - Number of instances to generate
     * @returns Array of mock data instances
     */
    public mockMany(count: number): z.infer<Schema>[] {
      return Array.from({ length: count }, () => this.mock());
    }

    /**
     * Generate mock data and validate it against the schema
     * @returns Validated mock data
     * @throws ZodError if generated data doesn't match schema
     */
    public mockAndValidate(): Schema['_zod']['output'] {
      const mockData = this.mock();
      return (this.schema as unknown as ZodType).parse(mockData);
    }

    /**
     * Internal method to generate mock data based on a schema type
     */
    private generateMockData<ZT extends $ZodType>(schema: ZT, path = ''): ZT['_zod']['output'] {
      if (schema instanceof ZodType) {
        const schemaMeta = schema.meta();

        if (schemaMeta && typeof schemaMeta === 'object' && 'customGenerator' in schemaMeta
          && typeof schemaMeta.customGenerator === 'string'
        ) {
          const customGenerator = this.customGenerators.get(
            schemaMeta.customGenerator,
          );
          if (customGenerator) {
            return customGenerator(this.faker);
          }
          throw new Error(`${schemaMeta.customGenerator} does not exist in custom generators`);
        }
      }

      if (schema instanceof ZodReadonly) {
        return this.generateMockData(schema.unwrap());
      }

      if (schema instanceof ZodEmail) {
        return this.faker.internet.email();
      }

      if (schema instanceof ZodURL) {
        return this.faker.internet.url();
      }

      if (schema instanceof ZodUUID) {
        return this.faker.string.uuid();
      }

      if (schema instanceof ZodString) {
        return this.generateString(schema as ZodString);
      }

      if (schema instanceof ZodNumber) {
        return this.generateNumber(schema as ZodNumber);
      }

      if (schema instanceof ZodBoolean) {
        return this.faker.datatype.boolean();
      }

      if (schema instanceof ZodISODateTime) {
        return this.faker.date.recent().toISOString();
      }

      if (schema instanceof ZodArray) {
        return this.generateArray(schema);
      }

      if (schema instanceof ZodObject) {
        return this.generateObject(schema, path);
      }

      if (schema instanceof ZodEnum) {
        return this.generateEnum(
          schema as ZodEnum<Readonly<Record<string, string | number>>>,
        );
      }

      if (schema instanceof ZodLiteral) {
        return (schema as ZodLiteral<string>).value;
      }

      if (schema instanceof ZodUnion) {
        return this.generateUnion(
          schema as unknown as ZodUnion<[$ZodType, ...$ZodType[]]>,
        );
      }

      if (schema instanceof ZodOptional) {
        return this.faker.datatype.boolean({
          probability: this.config.undefinedChance,
        })
          ? undefined
          : this.generateMockData(schema.unwrap());
      }

      if (schema instanceof ZodNullable) {
        return this.faker.datatype.boolean({
          probability: this.config.nullChance,
        })
          ? null
          : this.generateMockData(schema.unwrap());
      }

      if (schema instanceof ZodDefault) {
        return this.faker.datatype.boolean({
          probability: this.config.defaultChance,
        })
          ? schema.def.defaultValue
          : this.generateMockData(schema.unwrap());
      }

      if (schema instanceof ZodRecord) {
        return this.generateRecord(schema as ZodRecord);
      }

      // const schemaType = schema.def.type;
      console.warn(`Unsupported Zod type: ${schema._zod.def.type}`);
      return null;
    }

    private generateAlphanumeric(
      length?: Partial<Record<'min' | 'max', number | null>> | number,
    ): string {
      if (typeof length === 'number') {
        return this.faker.string.alphanumeric(length);
      } else if (typeof length === 'object') {
        return this.faker.string.alphanumeric({
          length: {
            min: length.min === 0
              ? 0
              : (length.min ?? this.config.lengths?.string?.min) ?? 5,
            max: length.max === 0
              ? 0
              : (length.max ?? this.config.lengths?.string?.max) ?? 20,
          },
        });
      } else {
        return this.faker.string.alphanumeric({
          length: this.config.lengths?.string,
        });
      }
    }

    private generateInteger(
      options: Partial<Record<'min' | 'max', number>> | undefined,
    ): number {
      return this.faker.number.int({
        min: options?.min,
        max: options?.max,
      });
    }

    private generateString(schema: ZodString): string {
      // Generate a random string with a reasonable length
      return this.generateAlphanumeric({
        min: schema.minLength,
        max: schema.maxLength,
      });
    }

    private generateNumber(schema: ZodNumber): number {
      // Simplified number generation
      const isInt = schema.safeParse(3.14).error;
      const minValue = schema.minValue;
      const maxValue = schema.maxValue;
      if (isInt) {
        return this.generateInteger({
          min: minValue ?? undefined,
          max: maxValue ?? undefined,
        });
      }

      return this.faker.number.float({
        min: minValue ?? undefined,
        max: maxValue ?? undefined,
      });
    }

    private generateArray<T extends $ZodType>(
      schema: ZodArray<T>,
    ): T['_zod']['output'][] {
      const elementSchema: T = schema.element;
      const length = this.generateInteger({
        min: this.config.lengths?.array?.min ?? 1,
        max: this.config.lengths?.array?.max ?? 5,
      });

      return Array.from({ length }, () => this.generateMockData(elementSchema));
    }

    private generateObject<
      S extends ZodRawShape,
    >(
      schema: ZodObject<S>,
      path: string,
    ): Record<string, unknown> {
      const shape: S = schema.shape;
      const result: Record<string, unknown> = {};

      for (const [key, fieldSchema] of Object.entries(shape)) {
        const fullPath = path ? `${path}.${key}` : key;
        switch (true) {
          case this.explicitlyWithNull.includes(fullPath as NullableKey):
            result[key] = null;
            break;
          case this.explicitlyWithNotNull.includes(fullPath as NullableKey):
            result[key] = this.generateMockData(
              (fieldSchema as ZodNullable).unwrap(),
              fullPath,
            );
            break;
          case this.explicitlyNotDefined.includes(fullPath as OptionalKey):
            result[key] = undefined;
            break;
          case this.explicitlyDefined.includes(fullPath as OptionalKey):
            result[key] = this.generateMockData(
              (fieldSchema as ZodOptional).unwrap(),
              fullPath,
            );
            break;
          default:
            result[key] = this.generateMockData(fieldSchema, fullPath);
        }
      }
      return result;
    }

    private generateEnum(
      schema: ZodEnum<Readonly<Record<string, string | number>>>,
    ): string | number {
      const options = schema.options;
      return this.faker.helpers.arrayElement(options);
    }

    private generateUnion<T extends $ZodType>(
      schema: ZodUnion<[T, ...T[]]>,
    ): unknown {
      const options = schema.options;
      const selectedOption = this.faker.helpers.arrayElement(options);
      return this.generateMockData(selectedOption);
    }

    private generateRecord(schema: ZodRecord): Record<string, unknown> {
      const result: Record<string, unknown> = {};
      const valueSchema = schema.def.valueType;
      if (schema.keyType instanceof ZodEnum) {
        // If the key type is enum, generate records for all enum values
        const keys = schema.keyType.options;
        for (const key of keys) {
          result[key] = this.generateMockData(valueSchema as ZodType);
        }
      } else {
        // For string/number keys, generate 1-5 random records
        const numKeys = this.generateInteger({
          min: this.config.lengths?.record?.min ?? 1,
          max: this.config.lengths?.record?.max ?? 5,
        });
        for (let i = 0; i < numKeys; i++) {
          const key = schema.keyType instanceof ZodString
            ? this.generateAlphanumeric()
            : this.generateInteger({ min: 0 });
          result[String(key)] = this.generateMockData(valueSchema as ZodType);
        }
      }

      return result;
    }
  };
};

const customGenerators = new Map()
  .set('photoUrl', (generatorFaker: Faker) => generatorFaker.image.urlPicsumPhotos({ width: 1280, height: 720 }))
  .set('logo', (generatorFaker: Faker) => generatorFaker.image.urlPicsumPhotos({ width: 600, height: 200 }))
  .set('phone', (generatorFaker: Faker) => generatorFaker.phone.number({ style: 'international' }))
  .set('carPlate', (generatorFaker: Faker) => generatorFaker.string.alphanumeric({ length: 7 }))
  .set('datePast', (generatorFaker: Faker) => generatorFaker.date.recent())
  .set('dateFuture', (generatorFaker: Faker) => generatorFaker.date.soon())
  .set('durationMinute', (generatorFaker: Faker) => generatorFaker.number.int({ min: 1, max: 60 * 24 * 7 }))
  .set('amount', (generatorFaker: Faker) => generatorFaker.number.int({ min: 100, max: 1000000, multipleOf: 100 }))
  .set('spaceCount', (generatorFaker: Faker) => generatorFaker.number.int({ min: 100, max: 1000000, multipleOf: 100 }))
  .set('skipByUndefined', (_generatorFaker: Faker) => undefined)
  .set('skipByEmptyObject', (_generatorFaker: Faker) => ({}));

export const createDefaultZodMocker = () => createZodMocker({
  customGenerators,
  seed: 42,
});
