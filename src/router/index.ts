import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import type { GenerateRoutesMap, NamedRouteRecordRaw } from 'vue-routes-to-types';

import { routes as mainRoutes } from '@/router/routes.ts';

const routes: NamedRouteRecordRaw[] = [...mainRoutes];

export const router = createRouter({
  history: createWebHistory(),
  routes: routes as readonly RouteRecordRaw[],
});

export type RoutesMap = GenerateRoutesMap<typeof routes>;
