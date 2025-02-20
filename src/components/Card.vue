<template>
  <div class="q-pa-md row items-start">
    <div v-if="props.type ==='greeting'" class="my-card q-gutter-sm">
      <q-card class="text-white bg-primary">
        <q-card-section>
          <div class="text-h6">Hey, Robert</div>
          <div class="text-subtitle2">Fri, 13 December, 2024</div>
        </q-card-section>
      </q-card>
    </div>
    <div v-else class="my-card q-gutter-sm">
      <q-card v-for="number in numbers" class="text-white bg-primary">
        <q-card-section class="q-pa-md">
          + Add Item or Warehouse
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
	type: String,
  numbers: Number
})
const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

</script>

<style>
.my-card{
  width: 100%;
}
</style>
