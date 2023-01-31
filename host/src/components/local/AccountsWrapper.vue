<template>
  <accounts-management :signal-r="signalR">
    <template #progress-overlay="model">
      <progress-overlay v-bind="model" />
    </template>
  </accounts-management>
  <confirmation-dialog />
</template>
<script setup lang="ts">
import AccountsManagement from "@/components/login/AccountsManagement.vue";
import ConfirmationDialog from "remoteCore/ConfirmationDialog";
import ProgressOverlay from "remoteCore/ProgressOverlay";
import { useSignalR } from "@/stores/signalR-store";

const signalR = useSignalR();
const test = () => alert("test");
</script>
<style scoped lang="scss"></style>
