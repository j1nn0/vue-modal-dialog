<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import VueModalDialog from '@/components/VueModalDialog.vue';
import { useDialogMode } from './composables/useDialogMode';
import type { VueModalDialogProps } from '@/types';

// Modal open/close
const isOpened = ref(false);
const openDialog = () => (isOpened.value = true);
const closeDialog = () => (isOpened.value = false);

// All 14 props controls
const backdrop = ref<boolean | 'static'>(true);
const escape = ref(true);
const role = ref<'dialog' | 'alertdialog'>('dialog');
const initialFocus = ref('');
const modal = ref(true);
const teleport = ref(false);
const scrollLock = ref(true);
const draggable = ref(false);
const transition = ref('fade');
const backdropTransition = ref('fade-backdrop');
const beforeCloseEnabled = ref(false);
const position = ref<VueModalDialogProps['position']>('center');
const width = ref('md');
const mode = ref<'light' | 'dark' | null>(null);

// beforeClose handler
const beforeClose = computed(() =>
  beforeCloseEnabled.value
    ? () => window.confirm('Are you sure you want to close this dialog?')
    : undefined,
);

// Event log
const eventLog = ref<string[]>([]);
const logEvent = (name: string) => eventLog.value.push(name);
const clearLog = () => (eventLog.value = []);

// Mode class for body styling
const modeProps = reactive({ mode });
watch(mode, (newVal) => {
  modeProps.mode = newVal;
});
const { modeClass } = useDialogMode(modeProps);
watch(
  modeClass,
  (newVal, oldVal) => {
    document.body.classList.remove(oldVal ?? '');
    document.body.classList.add(newVal);
  },
  { immediate: true },
);

// Dummy text
const text = ref(1);
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

  <!-- Controls panel -->
  <div class="controls">
    <fieldset>
      <legend>Behavior</legend>
      <label>
        Backdrop:
        <select v-model="backdrop">
          <option :value="true">true (closes on click)</option>
          <option :value="false">false (no backdrop)</option>
          <option value="static">static (visible, no close)</option>
        </select>
      </label>
      <label>
        Escape:
        <input type="checkbox" v-model="escape" />
      </label>
      <label>
        Role:
        <select v-model="role">
          <option value="dialog">dialog</option>
          <option value="alertdialog">alertdialog</option>
        </select>
      </label>
      <label>
        Modal:
        <input type="checkbox" v-model="modal" />
      </label>
      <label>
        Scroll Lock:
        <input type="checkbox" v-model="scrollLock" />
      </label>
      <label>
        beforeClose guard:
        <input type="checkbox" v-model="beforeCloseEnabled" />
      </label>
    </fieldset>

    <fieldset>
      <legend>Layout</legend>
      <label>
        Position:
        <select v-model="position">
          <option value="center">center</option>
          <option value="top">top</option>
          <option value="bottom">bottom</option>
          <option value="left">left</option>
          <option value="right">right</option>
          <option value="topleft">topleft</option>
          <option value="topright">topright</option>
          <option value="bottomleft">bottomleft</option>
          <option value="bottomright">bottomright</option>
        </select>
      </label>
      <label>
        Width:
        <select v-model="width">
          <option value="sm">sm</option>
          <option value="md">md</option>
          <option value="lg">lg</option>
          <option value="fullscreen">fullscreen</option>
        </select>
      </label>
      <label>
        Teleport:
        <input type="checkbox" v-model="teleport" />
      </label>
      <label>
        Draggable:
        <input type="checkbox" v-model="draggable" />
      </label>
    </fieldset>

    <fieldset>
      <legend>Appearance</legend>
      <label>
        Mode:
        <select v-model="mode">
          <option :value="null">Auto (OS)</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <label>
        Transition:
        <input type="text" v-model="transition" />
      </label>
      <label>
        Backdrop Transition:
        <input type="text" v-model="backdropTransition" />
      </label>
      <label>
        Initial Focus (selector):
        <input type="text" v-model="initialFocus" placeholder="#confirm-btn" />
      </label>
    </fieldset>

    <fieldset>
      <legend>Content</legend>
      <label>
        Text repeat:
        <input type="number" v-model="text" min="1" max="20" />
      </label>
    </fieldset>

    <button type="button" @click="openDialog">Open Dialog</button>
    <button type="button" @click="clearLog" v-if="eventLog.length">Clear Log</button>
  </div>

  <Teleport to="body">
    <VueModalDialog
      v-model="isOpened"
      :backdrop="backdrop"
      :escape="escape"
      :role="role"
      :initial-focus="initialFocus || undefined"
      :modal="modal"
      :teleport="teleport"
      :scroll-lock="scrollLock"
      :draggable="draggable"
      :transition="transition"
      :backdrop-transition="backdropTransition"
      :before-close="beforeClose"
      :position="position"
      :width="width"
      :mode="mode"
      @opened="logEvent('opened')"
      @closed="logEvent('closed')"
      @before-open="logEvent('before-open')"
      @opening="logEvent('opening')"
      @before-close="logEvent('before-close')"
      @closing="logEvent('closing')"
    >
      <template #header>
        <strong>VueModalDialog Playground</strong>
      </template>

      <div>
        <p>This is a scrollable body to test the scroll behavior.</p>
        <p>{{ dummyText }}</p>
        <button id="confirm-btn" type="button" @click="closeDialog">Confirm</button>
      </div>

      <template #footer>
        <button type="button" @click="closeDialog">Close</button>
      </template>
    </VueModalDialog>
  </Teleport>

  <!-- Event log -->
  <div class="event-log" v-if="eventLog.length">
    <h3>Event Log</h3>
    <ul>
      <li v-for="(log, index) in eventLog" :key="index">{{ log }}</li>
    </ul>
  </div>
</template>

<style lang="scss">
body {
  &.mode-dark {
    background: #333;
    color: #aaa;
  }
}
</style>

<style scoped>
.controls {
  margin-bottom: 1rem;
}
fieldset {
  margin-bottom: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem;
}
legend {
  font-weight: bold;
  font-size: 0.9rem;
}
label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
}
.event-log {
  margin-top: 1rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  background: #f9f9f9;
}
</style>
