<template>
  <h1>LOCAL ONLY! Module login preview</h1>
  <h2 v-show="finished">Process completed</h2>
  <div class="row">
    <login-form v-bind="{ signalR: signalR }" @remote-event="remoteCallback">
      <template #progress-overlay="model">
        <progress-overlay v-bind="model" />
      </template>
    </login-form>
  </div>
  <q-dialog />
  <div class="row justify-center">
    <q-card>
      <q-card-section>
        <label>Local store:</label>
        <!-- @prettier ignore -->
        <pre>{{ JSON.stringify(store.tokenData, null, 2) }}</pre>
        <label>Server response:</label>
        <pre>{{ serverData ?? "{\n}" }}</pre>
      </q-card-section>
      <q-card-actions align="between">
        <q-btn color="secondary" variant="outlined" @click="serverRequest"
          >Query API Endpoint</q-btn
        >
        <log-in-or-out-button :signal-r="signalR" />
        <q-btn color="primary" variant="outlined" @click="refreshToken"
          >Refresh token</q-btn
        >
      </q-card-actions>
    </q-card>
  </div>
  <div class="row justify-center">
    <label>Current RefreshToken:</label>
  </div>
  <div class="row justify-center">
    <span class="break">{{ store.tokenData.refresh }}</span>
  </div>
  <div class="row justify-center">
    <label>Current AccessToken:</label>
  </div>
  <div class="row justify-center">
    <span class="break">{{ store.token }}</span>
  </div>
  <div class="row justify-center">
    <label>Refresh Token valid:</label>
    <span>{{ expirationCountdown }}</span>
  </div>
  <div class="row justify-center">
    <dashboard-card link-target="/accounts">
      <template #progress-overlay="model">
        <progress-overlay v-bind="model" />
      </template>
    </dashboard-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useJWT } from "@/stores/user-store";
import { useSignalR } from "@/stores//signalR-store";
import { ISignalRStore } from "@/services/sockets";
import { apiBase } from "@/services/login-api";

import ProgressOverlay from "remoteCore/ProgressOverlay";
import DashboardCard from "@/components/dashboard/DashboardCard.vue";
import LoginForm from "@/components/login/LoginForm.vue";
import LogInOrOutButton from "@/components/login/LogInOrOutButton.vue";

const signalR: ISignalRStore = useSignalR();
const store = useJWT().withSignalR(signalR);
const finished = ref(false);
const serverData = ref();
const expirationCountdown = ref(0);
let countdownInterval: number;
let timeout: number;

const remoteCallback = async () => {
  finished.value = true;
  startCountdown();
  await serverRequest();
  console.log("received remote-event");
};

const startCountdown = () => {
  clearInterval(countdownInterval);
  clearTimeout(timeout);
  // use window. for correct type inference
  countdownInterval = window.setInterval(() => {
    let diff =
      (store.tokenData?.expires ?? new Date()).getTime() - new Date().getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    const mins = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);

    const seconds = Math.floor(diff / 1000);
    diff -= seconds * 1000;

    expirationCountdown.value = seconds >= 0 ? seconds : 0;
  }, 500);
  timeout = window.setTimeout(() => {
    clearInterval(countdownInterval);
  }, 61 * 1000);
};

const refreshToken = async () => {
  const tokenData = store.tokenData;
  if (tokenData) {
    await store.refreshToken(tokenData.email, tokenData.refresh);
  }
  await store.getTokenAsync();
  startCountdown();
};

const serverRequest = async () => {
  var token = await store.getTokenAsync();
  try {
    const response = await fetch(`${apiBase}/check-token`, {
      mode: "cors",
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    serverData.value = JSON.stringify({
      timestamp: new Date().toLocaleTimeString(),
      data,
    });
  } catch {
    serverData.value = "Could not read from server";
  }
};
</script>
<style scoped lang="scss">
h1,
h2 {
  text-align: center;
}

h2 {
  color: green;
}

.row {
  margin-top: 32px;
}

.q-card {
  width: 512px;
}

span.break {
  max-width: 1024px;
  word-wrap: break-word;
}

pre {
  overflow-x: scroll;
}
</style>
