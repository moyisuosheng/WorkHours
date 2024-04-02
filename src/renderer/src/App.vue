<script setup lang="ts">
import Timeline from './components/Timeline.vue'
import WorkList from './components/WorkList.vue';
const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <Timeline />
  <!-- <WorkList /> -->
</template>

<style lang="css" scoped></style>
