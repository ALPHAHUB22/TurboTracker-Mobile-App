<template>
  <q-toolbar>
    <q-toolbar-title class="row col justify-between">
      <q-btn size="md" class="col-2" flat color="white">
        <q-avatar style="border-radius: 10px;" size="lg">
          <img src="https://cdn.quasar.dev/img/boy-avatar.png">
        </q-avatar>
      </q-btn>
      <text-caption class="q-mt-sm col-8 text-center">TurboTracker</text-caption>
      <q-btn flat class="col-2" icon="logout"></q-btn>
    </q-toolbar-title>
  </q-toolbar>
  <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
    <q-list>
      <q-item-label header>
        Essential Links
      </q-item-label>
      <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
    </q-list>
  </q-drawer>
  <!-- <Drawer :leftDrawerOpen="leftDrawerOpen" /> -->
</template>
<script setup>
import { ref } from 'vue'
// import Drawer from 'components/Drawer.vue'
import EssentialLink from 'components/EssentialLink.vue'
const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
const linksList = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev'
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev'
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev'
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev'
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev'
  }
]
</script>
