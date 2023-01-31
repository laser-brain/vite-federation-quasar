<template>
  <div class="toggle">
    <q-btn color="primary" @click="toggle">Toggle</q-btn>
  </div>
  <quasar-example
    card-text="lorem ipsum"
    confirm-button-text="confirm"
    :active="active"
    @cancel="toggle"
    @continue="toggle"
  />
</template>
<script setup lang="ts">
import { ref } from "vue";
import QuasarExample from "remote/QuasarExample";
const active = ref(false);
const toggle = () => {
  active.value = !active.value;
};
</script>
<style lang="scss">
.toggle {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
