import type { NamedRouteRecordRaw } from 'vue-routes-to-types';

import { RouteName } from '@/common/constants/route-name.ts';

export const routes = [
  {
    path: '/:catchAll(.*)*',
    redirect: '/home',
    name: 'Redirect',
    meta: {
      public: true,
    },
  },
  {
    path: '/home',
    name: RouteName.APP.HOME,
    component: () => import('@/views/ViewHome.vue'),
  },
  {
    path: '/home/test',
    name: RouteName.APP.HOME_TEST,
    component: () => import('@/modules/Home/HomeTest.vue'),
  },
  {
    path: '/home/test2',
    name: RouteName.APP.HOME_TEST2,
    component: () => import('@/modules/Home/HomeTest2.vue'),
  },
  {
    path: '/admin',
    name: RouteName.APP.ADMIN,
    component: () => import('@/views/ViewAdmin.vue'),
  },
  {
    path: '/admin/test',
    name: RouteName.APP.ADMIN_TEST,
    component: () => import('@/modules/Admin/AdminTest.vue'),
  },
] as const satisfies NamedRouteRecordRaw[];
