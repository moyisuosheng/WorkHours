<script setup lang="ts">
import Timeline from './components/Timeline.vue'

const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <Timeline />
</template>

<style lang="css" scoped>

</style>
