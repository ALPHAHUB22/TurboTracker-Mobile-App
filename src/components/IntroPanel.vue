<template>
  <div class="q-pa-md row items-start">
    <div class="my-card q-gutter-sm">
      <q-card class="text-white bg-primary">
        <q-card-section>
          <div class="text-h6">Hey, {{userInfo.name}}</div>
          <div class="text-subtitle2">{{formattedDate}}</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')))
const today = new Date();
const formattedDate = today.toLocaleDateString("en-US", {
  weekday: "short",  // "Fri"
  day: "2-digit",    // "13"
  month: "long",     // "December"
  year: "numeric",   // "2024"
});

</script>
