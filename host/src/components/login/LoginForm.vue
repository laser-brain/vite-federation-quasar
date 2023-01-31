<template>
  <div class="flex col start offset">
    <q-card>
      <slot
        name="progress-overlay"
        :show="showLoader"
        label="Prüfe Login Daten ..."
      />
      <q-card-section>
        <q-input
          v-model="email"
          label="E-Mail*"
          clearable
          :rules="[rules.required]"
        />
        <q-input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="Passwort*"
          clearable
          :rules="[rules.required]"
          :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append="() => (showPassword = !showPassword)"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn class="btn-login bg-primary" color="on-primary" @click="login"
          >Login
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { ISocket, ISignalRStore } from "@/services/sockets";
import { apiBase, socketBase } from "@/services/login-api";
import { useJWT } from "@/stores/user-store";
const props = defineProps<{ signalR: ISignalRStore }>();
const emit = defineEmits<{
  (event: "remote-event"): void;
}>();
const email = ref("");
const password = ref("");
const showLoader = ref(false);
const showPassword = ref(false);

const store = useJWT().withSignalR(props.signalR);
const connection = ref();
const rules = {
  required: (value: string) => !!value || "Pflichtfeld.",
};

const socket: ISocket = {
  url: socketBase,
  events: {
    checkPasswordSuccessDebug: () => {
      console.log("success");
    },
    checkPasswordSuccess: (token: string | undefined) => {
      showLoader.value = false;
      if (token) {
        store.token = token;
        emit("remote-event");
      } else {
        console.error("received login success but no token data.", token);
      }
    },
    checkPasswordError: () => {
      showLoader.value = false;
    },
  },
};
props.signalR.addSocket("login", socket);

const login = async () => {
  showLoader.value = true;
  connection.value = props.signalR.sockets.login.connection?.connectionId;
  try {
    await fetch(apiBase, {
      mode: "cors",
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        signalRConnectionId:
          props.signalR.sockets.login.connection?.connectionId,
      }),
    });
  } catch (err) {
    console.error(err);
    showLoader.value = false;
  } finally {
    setTimeout(() => {
      showLoader.value = false;
    }, 5000);
  }
};
</script>
<style scoped lang="scss">
@import "@/styles/flex.scss";
.flex.col.offset {
  margin: 32px 0;
}

.q-card {
  width: 512px;
}

.btn-login {
  width: 50%;
}
</style>
