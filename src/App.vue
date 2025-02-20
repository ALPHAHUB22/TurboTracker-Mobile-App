<template>
  <router-view />
</template>

<script setup>
import { createApp } from 'vue';
import { Quasar, Notify, Loading } from 'quasar';
import App from './App.vue';
import 'quasar/dist/quasar.css';

const app = createApp(App);
app.use(Quasar, {
  plugins: {
    Notify,
    Loading,
  },
  // config: {
  //   loading: /* look at QuasarConfOptions from the API card */
  // },
});
</script>
