import { AppLayout } from '@/common/constants.js';
import type { RoutesMap } from '@/router';

declare module 'vue-router' {
  export interface TypesConfig {
    RouteNamedMap: RoutesMap;
  }

  interface RouteMeta {
    public?: boolean;
    layout?: AppLayout;
  }
}
