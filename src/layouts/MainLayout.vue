<template>
  <q-layout view="lHh Lpr lFf">
    <Header />
    <router-view />
    <Footer />
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import Header from 'components/Header.vue'
import Footer from 'components/Footer.vue'

</script>
