<template>
  <div class="business-table">
    <DataTable
      :value="businessTripsData"
      paginator
      :rows="15"
      table-style="min-width: 50rem"
      removable-sort
    >
      <Column field="date" header="Дата" sortable />
      <Column field="duration" header="Продолжительность" style="text-align: center" sortable />
      <Column field="numberOfEmployees" header="Кол-во человек" style="text-align: center" sortable />
      <Column field="goal" header="Вид командировки" style="text-align: center" sortable />
      <Column field="place" header="Место командировки" sortable />
      <Column field="estimatedPayment" header="Прибыль" sortable />
      <Column field="id" header="ID" />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

import businessTripsData from '@/static/business-trips.json';
</script>
