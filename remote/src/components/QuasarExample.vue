<template>
  <q-dialog v-model="activeRef">
    <q-card>
      <q-card-section><h5>Are you sure?</h5></q-card-section>
      <v-card-text>
        {{ cardText }}
      </v-card-text>
      <q-card-actions>
        <q-btn text color="secondary" @click="emit('cancel')">Cancel</q-btn>
        <q-btn color="primary" @click="emit('continue')">{{
          confirmButtonText
        }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { toRefs } from "vue";
interface IConfirmationDialogProps {
  confirmButtonText: string;
  cardText: string;
  active: boolean;
}
const props = defineProps<IConfirmationDialogProps>();
const { active: activeRef } = toRefs(props);
const emit = defineEmits<(event: "continue" | "cancel") => void>();
</script>
<style scoped lang="scss">
.q-card {
  padding: 8px;
  min-width: 512px;
}
</style>
