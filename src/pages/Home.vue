<template>
  <q-layout view="lHh Lpr lFf" class="layout">
  <q-page-container>
    <q-card class="top-sheet" flat />
    <q-toolbar>
    <q-toolbar-title class="row col justify-between">
      <q-btn size="md" class="col-2" flat color="white">
        <q-avatar style="border-radius: 10px;" size="lg">
          <img src="https://cdn.quasar.dev/img/boy-avatar.png">
        </q-avatar>
      </q-btn>
      <div class="q-mt-sm col-7 text-center">TurboTracker</div>
      <div class="online"></div>
      <Logout class="col-1"/>
    </q-toolbar-title>
  </q-toolbar>
    <IntroPanel />
    <DashInfo />
    <BuildingQuickLinks />
    <div class="text-center">
      <p>For adding new building, please contact System Admin</p>
    </div>
  </q-page-container>
  <Footer />
</q-layout>
</template>
<script setup>
import Logout from 'src/components/Logout.vue'
import IntroPanel from 'src/components/home/IntroPanel.vue'
import DashInfo from 'src/components/home/DashInfo.vue'
import BuildingQuickLinks from 'src/components/home/BuildingQuickLinks.vue'
import Footer from 'components/Footer.vue'



</script>
<style scoped>
.top-sheet{
  position: absolute; width: 100%;
  height: 19vh;
  border-top-left-radius: 0%;
  border-top-right-radius: 0%;
  border-bottom-left-radius: 100%;
  border-bottom-right-radius: 100%;
  background-color: rgb(146, 200, 255)
}
</style>
