<template>
  <div class="business-table">
    <DataTable
      :value="goalsData"
      paginator
      :rows="15"
      table-style="min-width: 50rem"
      removable-sort
    >
      <Column field="name" header="Вид командировки" />
      <Column field="minEmployees" header="Мин. кол-во рабочих" sortable style="text-align: center" />
      <Column field="management" header="Управляющий" sortable style="text-align: center" />
      <Column field="performers" header="Сотрудники" sortable style="text-align: center" />
      <Column field="id" header="ID" />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

import goalsData from '@/static/goals.json';
</script>
