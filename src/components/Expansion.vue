<template>
  <div class="q-pa-md">
    <q-list>
      <q-expansion-item popup default-opened icon="link" label="Quick Links">
        <q-separator />
        <q-card>
          <Card type="inner" :numbers="1"/>
        </q-card>
      </q-expansion-item>
      <q-expansion-item popup default-opened icon="warehouse" label="Recent Warehouses">
        <q-separator />
        <q-card>
          <Card type="inner" :numbers="3"/>
        </q-card>
      </q-expansion-item>
    </q-list>
  </div>
</template>
<script setup>
import Card from 'components/Card.vue'
</script>
