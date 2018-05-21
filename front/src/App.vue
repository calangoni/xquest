<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  beforeMount () {
    this.$axios.defaults.baseURL = 'http://localhost:3000';
  }
}
</script>

<style>
</style>
