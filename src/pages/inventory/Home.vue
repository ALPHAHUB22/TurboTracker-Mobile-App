<template>
  <q-page-container>
    <IntroPanel />
    <DashInfo />
    <BuildingQuickLinks />
    <div class="text-center">
      <p>For adding new building, please contact System Admin</p>
    </div>
  </q-page-container>
</template>
<script setup>
import IntroPanel from 'components/IntroPanel.vue'
import DashInfo from 'src/components/home/DashInfo.vue'
import BuildingQuickLinks from 'src/components/home/BuildingQuickLinks.vue'

</script>
