import type { NamedRouteRecordRaw } from 'vue-routes-to-types';

import { RouteName } from '@/common/constants/route-name.ts';

export const routes = [
  {
    path: '/:catchAll(.*)*',
    redirect: '/',
    name: 'Redirect',
    meta: {
      public: true,
    },
  },
  {
    path: '/',
    name: RouteName.APP.HOME,
    component: () => import('@/views/ViewHome.vue'),
  },
] as const satisfies NamedRouteRecordRaw[];
