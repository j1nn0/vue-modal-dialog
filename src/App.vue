<script setup>
import { ref, computed } from 'vue';
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
const mode = ref(null);
const text = ref(1);

// イベントログ用
const eventLog = ref([]);
const opened = () => eventLog.value.push('opened');
const closed = () => eventLog.value.push('closed');

const backdropVal = computed(() => {
  return backdrop.value ? true : 'static';
});

// ダミーテキスト（長い文章と長い単語を混ぜています）
const dummyText = computed(() =>
  `
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Pellentesque ultralongwordthatshouldbreakautomaticallywithoutoverflowingthecontainer
in vel mauris eget purus fermentum efficitur. Vivamus sagittis tortor non eros pulvinar
ultricies. Sed non purus sit amet velit efficitur gravida. Cras a urna et turpis
maximummodaldialogheightcontent that will require scrolling. Lorem ipsum dolor sit amet,
consectetur adipiscing elit. Vestibulum consequat, libero vel convallis pellentesque,
massa arcu lacinia leo, at finibus libero nulla nec lectus.
`.repeat(text.value),
);
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

    <label>
      Mode:
      <select v-model="mode">
        <option :value="null">Auto</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>

    <label>
      Text repeat:
      <input type="number" v-model="text" />
    </label>

    <button type="button" @click="openDialog">Open Dialog</button>
  </div>

  <Teleport to="body">
    <!-- モーダル -->
    <VueModalDialog
      v-model="isOpened"
      :backdrop="backdropVal"
      :escape="escape"
      :position="position"
      :width="width"
      :mode="mode"
      @opened="opened"
      @closed="closed"
    >
      <template #header>
        <strong>VueModalDialog Playground</strong>
      </template>

      <div>
        <p>This is a scrollable body to test the scroll behavior.</p>
        <p>{{ dummyText }}</p>
      </div>

      <template #footer>
        <button type="button" @click="closeDialog">Close</button>
      </template>
    </VueModalDialog>
  </Teleport>

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
