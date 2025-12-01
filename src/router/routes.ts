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
    path: '/home/BusinessTrips',
    name: RouteName.APP.BUSINESS_TRIPS,
    component: () => import('@/modules/Tables/TableBusinessTrips.vue'),
  },
  {
    path: '/home/Employees',
    name: RouteName.APP.EMPLOYEES,
    component: () => import('@/modules/Tables/TableEmployees.vue'),
  },
  {
    path: '/home/Goals',
    name: RouteName.APP.GOALS,
    component: () => import('@/modules/Tables/TableGoals.vue'),
  },
  {
    path: '/home/JobTitles',
    name: RouteName.APP.JOB_TITLES,
    component: () => import('@/modules/Tables/TableJobTitles.vue'),
  },
  {
    path: '/home/Regions',
    name: RouteName.APP.REGIONS,
    component: () => import('@/modules/Tables/TableRegions.vue'),
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
