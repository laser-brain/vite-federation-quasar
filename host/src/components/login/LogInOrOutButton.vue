<template>
  <q-btn v-if="store.token" variant="outlined" color="primary" @click="logout"
    >Logout</q-btn
  >
  <q-btn v-else @click="navigateLogin">Login</q-btn>
</template>
<script setup lang="ts">
import { ISignalRStore } from "@/services/sockets.js";
import { useJWT } from "@/stores/user-store.js";
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps<{ signalR: ISignalRStore }>();
const emit = defineEmits<{
  (event: "logout"): void;
}>();
var store = useJWT().withSignalR(props.signalR);

const logout = () => {
  store.logout();
  emit("logout");
};

const navigateLogin = () => {
  router.push("/login");
};
</script>
<style scoped lang="scss"></style>
