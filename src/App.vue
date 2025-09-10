<script setup>
import { ref } from 'vue';
import VueModalDialog from '@/components/VueModalDialog.vue';

// モーダル開閉
const isOpened = ref(false);
const openDialog = () => (isOpened.value = true);
const closeDialog = () => (isOpened.value = false);

// Props コントロール用の ref
const backdrop = ref(true);
const escape = ref(true);
const position = ref('center'); // center | top
const width = ref('md'); // sm | md | lg | fullscreen

// イベントログ用
const eventLog = ref([]);
const opened = () => eventLog.value.push('opened');
const closed = () => eventLog.value.push('closed');
</script>

<template>
  <h2>VueModalDialog Playground</h2>

  <!-- コントロールパネル -->
  <div class="controls">
    <label>
      Backdrop:
      <input type="checkbox" v-model="backdrop" />
    </label>

    <label>
      Escape:
      <input type="checkbox" v-model="escape" />
    </label>

    <label>
      Position:
      <select v-model="position">
        <option value="center">Center</option>
        <option value="top">Top</option>
      </select>
    </label>

    <label>
      Width:
      <select v-model="width">
        <option value="sm">Small</option>
        <option value="md">Medium</option>
        <option value="lg">Large</option>
        <option value="fullscreen">Fullscreen</option>
      </select>
    </label>

    <button type="button" @click="openDialog">Open Dialog</button>
  </div>

  <!-- モーダル -->
  <VueModalDialog
    v-model="isOpened"
    :backdrop="backdrop"
    :escape="escape"
    :position="position"
    :width="width"
    @opened="opened"
    @closed="closed"
  >
    <template #header>
      <strong>VueModalDialog Playground</strong>
    </template>

    <div style="max-height: 60vh; padding: 1rem">
      <p>This is a scrollable body to test the scroll behavior.</p>
      <p v-for="i in 50" :key="i">
        Line {{ i }}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </p>
    </div>

    <template #footer>
      <button type="button" @click="closeDialog">Close</button>
    </template>
  </VueModalDialog>

  <!-- イベントログ -->
  <div class="event-log" v-if="eventLog.length">
    <h3>Event Log</h3>
    <ul>
      <li v-for="(log, index) in eventLog" :key="index">{{ log }}</li>
    </ul>
  </div>
</template>

<style scoped>
.controls {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
.event-log {
  margin-top: 1rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  background: #f9f9f9;
}
</style>
