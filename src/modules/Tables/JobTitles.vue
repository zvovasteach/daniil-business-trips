<template>
  <div class="business-table">
    <DataTable
      :value="jobTitlesData"
      paginator
      :rows="15"
      table-style="min-width: 50rem"
    >
      <Column field="name" header="Название профессии" />
      <Column field="id" header="ID" />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

import jobTitlesData from '@/static/job-titles.json';
</script>
