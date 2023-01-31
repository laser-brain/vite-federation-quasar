<template>
  <q-markup-table>
    <slot
      name="progress-overlay"
      :show="loading"
      :label="loaderLabel"
      :fullscreen="true"
    />
    <thead>
      <tr>
        <th class="text-left">E-Mail</th>
        <th class="text-left">Name</th>
        <th class="text-left">Letzter Login</th>
        <th class="text-left">Status</th>
        <th class="text-left">Erstellt</th>
        <th class="text-left">Zuletzt aktualisiert</th>
        <th class="text-left">Aktionen</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="account in accounts" :key="account.eMail">
        <td>{{ account.eMail }}</td>
        <td>{{ account.name ?? "-" }}</td>
        <td>
          {{ account.lastLogin?.toLocaleDateString() ?? "-" }}
          {{ account.lastLogin?.toLocaleTimeString() }}
        </td>
        <td>{{ account.status }}</td>
        <td>
          {{ account.createdAt.toLocaleDateString() }}
          {{ account.createdAt.toLocaleTimeString() }}
        </td>
        <td>
          {{ account.lastUpdate?.toLocaleDateString() ?? "-" }}
          {{ account.lastUpdate?.toLocaleTimeString() }}
        </td>
        <td>
          <div class="flex row actions">
            <q-btn
              v-if="account.status === 'active'"
              prepend-icon="mdi-cancel"
              @click="selectAccountForBlock(account)"
              color="negative"
              >{{ BLOCK }}</q-btn
            >
            <q-btn
              v-else
              prepend-icon="mdi-account-check"
              @click="selectAccountForUnblock(account)"
              color="positive"
              >{{ UNBLOCK }}</q-btn
            >
          </div>
        </td>
      </tr>
    </tbody>
  </q-markup-table>
  <slot name="confirmation-dialog" />
  <q-dialog seamless position="bottom" v-model="showSnackbar" :timeout="5000">
    <q-card elevation="8">
      <q-card-section>
        {{ snackbarMessage }}
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import {
  Account,
  IAccountNetworkData,
  apiBase,
  socketBase,
} from "@/services/login-api";
import { ISocket, ISignalRStore } from "@/services/sockets";
import { ref, Ref, onMounted } from "vue";

const BLOCK = "Account blockieren";
const UNBLOCK = "Account freigeben";
const LOADING_DATA = "Lade Account Daten ...";
const LOADING_UPDATE_STATUS = "Status wird aktualisiert ...";

const loaderLabel = ref(LOADING_DATA);
const loading = ref(true);
const showSnackbar = ref(false);
const snackbarMessage = ref();
const showConfirmationDialogUnblock = ref(false);
const showConfirmationDialogBlock = ref(false);

const accounts: Ref<Account[]> = ref([]);
const selectedAccount: Ref<Account | undefined> = ref();
const props = defineProps<{ signalR: ISignalRStore }>();

const socket: ISocket = {
  url: socketBase,
  events: {
    blockUserSuccess: () => {
      endRequest("Account blockiert!");
    },
    blockUserError: () => {
      if (selectedAccount.value) {
        selectedAccount.value.status = "active";
      }
      endRequest("Es ist ein Fehler aufgetreten");
    },
    unblockUserSuccess: () => {
      endRequest("Zugriff wiederhergestellt!");
    },
    unblockUserError: () => {
      if (selectedAccount.value) {
        selectedAccount.value.status = "blocked";
      }
      endRequest("Es ist ein Fehler aufgetreten");
    },
  },
};

const endRequest = (message?: string) => {
  if (message) {
    snackbarMessage.value = message;
    showSnackbar.value = true;
  }
  showConfirmationDialogBlock.value = false;
  showConfirmationDialogUnblock.value = false;
  loading.value = false;
  selectedAccount.value = undefined;
};

props.signalR.addSocket("accounts", socket);

onMounted(async () => {
  try {
    const serverResponse = await fetch(apiBase);

    const data = await serverResponse.json();
    accounts.value = (data as IAccountNetworkData[])?.map(
      (account) => new Account(account)
    );
  } finally {
    loading.value = false;
  }
});

const apiRequest = async (data: Account) => {
  loaderLabel.value = LOADING_UPDATE_STATUS;
  loading.value = true;
  try {
    await fetch(`${apiBase}/${data.eMail}`, {
      method: "PUT",
      mode: "cors",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        signalRConnectionId:
          props.signalR.sockets.accounts.connection?.connectionId,
        ...data,
      }),
    });
  } catch (error) {
    snackbarMessage.value = `Es ist ein Fehler aufgetreten: ${error}`;
    showSnackbar.value = true;
  } finally {
    setTimeout(() => {
      if (
        showConfirmationDialogBlock.value ||
        showConfirmationDialogUnblock.value
      ) {
        if (selectedAccount.value && showConfirmationDialogBlock.value) {
          selectedAccount.value.status = "active";
        }
        if (selectedAccount.value && showConfirmationDialogUnblock.value) {
          selectedAccount.value.status = "blocked";
        }
        endRequest();
      }
    }, 5000);
  }
};

const selectAccountForBlock = (data: Account) => {
  selectedAccount.value = data;
  showConfirmationDialogBlock.value = true;
};

const selectAccountForUnblock = (data: Account) => {
  selectedAccount.value = data;
  showConfirmationDialogUnblock.value = true;
};

const block = async () => {
  if (!selectedAccount.value) {
    return;
  }
  selectedAccount.value.status = "blocked";
  await apiRequest(selectedAccount.value);
};

const unblock = async () => {
  if (!selectedAccount.value) {
    return;
  }
  selectedAccount.value.status = "active";
  await apiRequest(selectedAccount.value);
};

const cancelDialog = (id: "block" | "unblock") => {
  switch (id) {
    case "block":
      showConfirmationDialogBlock.value = false;
      break;
    case "unblock":
      showConfirmationDialogUnblock.value = false;
      break;
  }
};
</script>
<style scoped lang="scss">
@import "@/styles/flex.scss";

.actions {
  .v-btn:not(:last-child) {
    margin-right: 32px;
  }
}

td {
  vertical-align: middle;
}

.no-margin-left {
  margin-left: 0px;
}

button.selection-action {
  margin: 0px 32px;
  &:first-child {
    margin-left: 0px;
  }
}
</style>
