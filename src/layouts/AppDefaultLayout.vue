<template>
  <div class="layout-content">
    <PanelMenu :model="menuItems" multiple class="panel-menu">
      <template #item="{item}" class="panel-menu-template">
        <router-link
          v-if="item.route"
          v-slot="{ href, navigate }"
          :to="item.route"
          active-class="active-link"
        >
          <a :href="href" @click="navigate">
            <span>{{ item.label }}</span>
          </a>
        </router-link>
        <span v-else>{{ item.label }}</span>
      </template>
    </PanelMenu>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import PanelMenu from 'primevue/panelmenu';
import { ref } from 'vue';

const menuItems = ref([
  {
    label: 'Таблицы',
    icon: 'pi pi-file',
    items: [
      {
        label: 'Командировки',
        icon: 'pi pi-file',
        route: '/home/BusinessTrips',
      },
      {
        label: 'Рабочие',
        icon: 'pi pi-file',
        route: '/home/Employees',
      },
      {
        label: 'Виды командировок',
        icon: 'pi pi-file',
        route: '/home/Goals',
      },
      {
        label: 'Профессии',
        icon: 'pi pi-file',
        route: '/home/JobTitles',
      },
      {
        label: 'Регионы',
        icon: 'pi pi-file',
        route: '/home/Regions',
      },
    ],
  },
  {
    label: 'Admin',
    icon: 'pi pi-file',
    items: [
      {
        label: 'AdminTest',
        icon: 'pi pi-file',
        route: '/admin/test',
      },
    ],
  },
]);
</script>

<style scoped>
.layout-content {
  display: flex;
  gap: 2rem;
  margin: 1rem;
}

.panel-menu {
  width: 15rem;
}

.active-link {
  font-weight: bold;
  color: #ffffff;
  border-bottom: 1px solid #ffffff;
  margin-bottom: -1px;
}
</style>
