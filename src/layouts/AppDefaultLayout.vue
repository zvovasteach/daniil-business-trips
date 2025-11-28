<template>
  <div class="layout-content">
    <PanelMenu :model="menuItems" multiple class="panel-menu">
      <template #item="{item}">
        <router-link
          v-if="item.route"
          v-slot="{ href, navigate }"
          :to="item.route"
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
    label: 'Home',
    icon: 'pi pi-file',
    items: [
      {
        label: 'Test',
        icon: 'pi pi-file',
        route: '/home/test',
      },
      {
        label: 'Test2',
        icon: 'pi pi-file',
        route: '/home/test2',
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
</style>
