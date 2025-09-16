<template>
  {{ name }}
  <Test />
</template>
<script setup name="App">
  import { ref } from 'vue'
  import  Test from "./components/test.vue"

  const name = ref('App')
</script>

