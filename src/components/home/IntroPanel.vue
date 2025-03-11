<template>
  <div class="q-pa-md row items-start">
    <div class="my-card q-gutter-sm" style="width: 100%;">
      <q-card v-ripple style="border: 1px solid #42C2FF;">
        <q-card-section class="text-center">
          <div class="text-subtitle2 text-bold">Hey, {{userInfo.name}}</div>
          <div class="text-caption">{{formattedDate}}</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { Preferences } from '@capacitor/preferences';

const userInfo = ref({})
const today = new Date();
const formattedDate = today.toLocaleDateString("en-US", {
  weekday: "short",  // "Fri"
  day: "2-digit",    // "13"
  month: "long",     // "December"
  year: "numeric",   // "2024"
});
onMounted(async () => {
  const user_value = await Preferences.get({ key: 'userInfo' })
  userInfo.value = JSON.parse(user_value.value)
});
</script>
