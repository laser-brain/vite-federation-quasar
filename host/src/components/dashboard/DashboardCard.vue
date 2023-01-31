<template>
  <router-link :to="linkTarget">
    <div class="card-container">
      <slot
        name="progress-overlay"
        :show="loading"
        :fullscreen="false"
        label="Lade Informationen ..."
      />
      <q-card class="card-data">
        <q-card-section>
          <q-icon icon="mdi-account-check" />
          <span class="info"
            >{{ loginCount.active.count }} Logins insgesamt</span
          >
        </q-card-section>
        <q-card-section>
          <q-icon icon="mdi-weather-sunset-up" />
          <span class="info"
            >{{ loginCount.today.count }} heute ({{
              loginCount.today.date?.toLocaleDateString()
            }})</span
          >
        </q-card-section>
        <q-card-section>
          <q-icon icon="mdi-calendar-week-begin" />
          <span class="info"
            >{{ loginCount.week.count }} diese Woche (ab
            {{ loginCount.week.date?.toLocaleDateString() }})</span
          >
        </q-card-section>
        <q-card-section>
          <q-icon icon="mdi-calendar-month" />
          <span class="info"
            >{{ loginCount.month.count }} diesen Monat (ab
            {{ loginCount.month.date?.toLocaleDateString() }})</span
          >
        </q-card-section>
        <q-card-section>
          <q-icon icon="mdi-cancel" />
          <span class="info"
            >{{ loginCount.blocked.count }} Blockierte Accounts</span
          >
        </q-card-section>
      </q-card>
    </div>
  </router-link>
</template>
<script setup lang="ts">
import { ref, Ref, onMounted } from "vue";
import { apiBase } from "@/services/login-api";

defineProps<{ linkTarget: string }>();

interface ILoginCountData {
  date?: Date;
  count: number;
}
interface ILoginCountNetworkResult {
  active: ILoginCountData;
  blocked: ILoginCountData;
  today: ILoginCountData;
  week: ILoginCountData;
  month: ILoginCountData;
}

class LoginCountInfo implements ILoginCountData {
  constructor(base: ILoginCountData) {
    this.count = base.count;
    this.date = base.date ? new Date(base.date) : undefined;
  }

  count: number;
  date?: Date;
}

const loginCount: Ref<ILoginCountNetworkResult> = ref({
  active: { count: 0 },
  blocked: { count: 0 },
  today: { count: 0 },
  week: { count: 0 },
  month: { count: 0 },
});
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await fetch(`${apiBase}/count`);
    const data = (await response.json()) as ILoginCountNetworkResult;
    loginCount.value = {
      active: new LoginCountInfo(data.active),
      blocked: new LoginCountInfo(data.blocked),
      today: new LoginCountInfo(data.today),
      week: new LoginCountInfo(data.week),
      month: new LoginCountInfo(data.month),
    };
  } finally {
    loading.value = false;
  }
});
</script>
<style scoped lang="scss">
@import "@/styles/flex.scss";

div.card-container {
  position: relative;
  margin: 64px;
}

span.info {
  margin-left: 8px;
  padding-top: 2px;
}

a {
  color: inherit;
  text-decoration: none;
}

$card-dimension: 256px;

.card-data {
  padding: 1px;
  position: relative;
  cursor: pointer;
  transition: transform 0.32s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &:hover {
    border: 1px solid white;
    padding: 0;
  }

  min-height: $card-dimension;
  min-width: $card-dimension;
}
</style>
