<template>
  <div class="business-table">
    <DataTable
      :value="regionsData"
      paginator
      :rows="15"
      table-style="min-width: 50rem"
      removable-sort
    >
      <Column field="region" header="Регион" />
      <Column field="kilometers" header="Кол-во километров" sortable style="text-align: center" />
      <Column field="timeByCar" header="Время на машине" sortable style="text-align: center" />
      <Column field="priceTrain" header="Цена поезда" sortable style="text-align: center" />
      <Column field="timeByTrain" header="Время на поезде" sortable style="text-align: center" />
      <Column field="priceFlight" header="Цена перелета" sortable style="text-align: center" />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

import regionsData from '@/static/regions.json';
</script>
