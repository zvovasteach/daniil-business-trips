<template>
  <div class="business-table">
    <DataTable
      :value="employeesData"
      paginator
      :rows="15"
      table-style="min-width: 50rem"
      removable-sort
    >
      <Column field="surname" header="Фамилия" sortable />
      <Column field="jobTitle" header="Профессия" sortable style="text-align: center" />
      <Column field="sex" header="Пол" sortable style="text-align: center" />
<!--      <Column field="birthday" header="Дата рождения" sortable style="text-align: center" />-->
      <Column field="salary" header="Зарплата" sortable style="text-align: center" />
      <Column field="id" header="ID" />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

import employeesData from '@/static/employees.json';
</script>
