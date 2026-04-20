import { ref, watch } from 'vue';

import VueModalDialog from './VueModalDialog.vue';
import { action } from 'storybook/actions';

const openedAction = action('opened');
const closedAction = action('closed');

const meta = {
  title: 'Components/VueModalDialog',
  component: VueModalDialog,
  tags: ['autodocs'],
  args: {
    backdrop: true,
    escape: true,
    position: 'center',
    width: 'md',
    mode: null,
    titleText: 'VueModalDialog Story',
    bodyText: 'This is a Storybook canvas for testing modal behavior.',
    footerText: 'Footer area',
  },
  argTypes: {
    backdrop: {
      control: 'select',
      options: [true, false, 'static'],
    },
    escape: {
      control: 'boolean',
    },
    position: {
      control: 'inline-radio',
      options: ['center', 'top'],
    },
    width: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'fullscreen', '420px', '75vw'],
    },
    mode: {
      control: 'select',
      options: [null, 'light', 'dark'],
    },
    titleText: {
      control: 'text',
      name: 'slot:header',
    },
    bodyText: {
      control: 'text',
      name: 'slot:default',
    },
    footerText: {
      control: 'text',
      name: 'slot:footer',
    },
  },
};

export default meta;

export const Playground = {
  render: (args) => ({
    components: { VueModalDialog },
    setup() {
      const isOpen = ref(false);
      const openedCount = ref(0);
      const closedCount = ref(0);
      const handleOpened = (...eventArgs) => {
        openedCount.value += 1;
        openedAction(...eventArgs);
      };
      const handleClosed = (...eventArgs) => {
        closedCount.value += 1;
        closedAction(...eventArgs);
      };

      watch(
        () => args.mode,
        (nextMode, prevMode) => {
          if (prevMode) {
            document.body.classList.remove(`mode-${prevMode}`);
          }
          if (nextMode) {
            document.body.classList.add(`mode-${nextMode}`);
          }
        },
        { immediate: true },
      );

      return {
        args,
        isOpen,
        openedCount,
        closedCount,
        handleOpened,
        handleClosed,
      };
    },
    template: `
      <div style="min-width: 320px;">
        <button type="button" @click="isOpen = true">Open Dialog</button>
        <p style="margin: 0.75rem 0 0; font-size: 0.875rem; opacity: 0.7;">
          opened: {{ openedCount }} / closed: {{ closedCount }}
        </p>

        <VueModalDialog
          v-model="isOpen"
          :backdrop="args.backdrop"
          :escape="args.escape"
          :position="args.position"
          :width="args.width"
          :mode="args.mode"
          @opened="handleOpened"
          @closed="handleClosed"
        >
          <template #header>
            <strong>{{ args.titleText }}</strong>
          </template>

          <p style="margin: 0; line-height: 1.5;">{{ args.bodyText }}</p>

          <template #footer>
            <div style="display: flex; gap: 0.5rem;">
              <button type="button" @click="isOpen = false">Close</button>
              <span style="font-size: 0.875rem; opacity: 0.8;">{{ args.footerText }}</span>
            </div>
          </template>
        </VueModalDialog>
      </div>
    `,
  }),
};

export const Fullscreen = {
  args: {
    width: 'fullscreen',
    position: 'top',
    titleText: 'Fullscreen mode',
    bodyText: 'Use this story to verify fullscreen layout and scrolling behavior.',
  },
};

export const StackedModals = {
  args: {
    backdrop: true,
    escape: true,
    position: 'center',
    width: 'md',
    mode: null,
  },
  render: (args) => ({
    components: { VueModalDialog },
    setup() {
      const showDialog1 = ref(false);
      const showDialog2 = ref(false);
      const events = ref([]);

      const pushEvent = (message) => {
        events.value = [message, ...events.value].slice(0, 6);
      };

      watch(
        () => args.mode,
        (nextMode, prevMode) => {
          if (prevMode) {
            document.body.classList.remove(`mode-${prevMode}`);
          }
          if (nextMode) {
            document.body.classList.add(`mode-${nextMode}`);
          }
        },
        { immediate: true },
      );

      return {
        args,
        showDialog1,
        showDialog2,
        events,
        pushEvent,
      };
    },
    template: `
      <div style="min-width: 320px;">
        <button type="button" @click="showDialog1 = true">Open Dialog 1</button>
        <p style="margin: 0.75rem 0 0.5rem; font-size: 0.875rem; opacity: 0.8;">
          Open Dialog 1, then open Dialog 2 from its footer. Escape/backdrop close should affect only the topmost dialog.
        </p>
        <ul style="margin: 0.25rem 0 0; padding-left: 1.2rem; font-size: 0.8125rem; opacity: 0.75;">
          <li v-for="(event, index) in events" :key="index">{{ event }}</li>
        </ul>

        <VueModalDialog
          v-model="showDialog1"
          :backdrop="args.backdrop"
          :escape="args.escape"
          :position="args.position"
          :width="args.width"
          :mode="args.mode"
          @opened="pushEvent('Dialog 1 opened')"
          @closed="pushEvent('Dialog 1 closed')"
        >
          <template #header>
            <strong>Dialog 1</strong>
          </template>

          <p style="margin: 0; line-height: 1.5;">
            This is the first dialog.
          </p>

          <template #footer>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <button type="button" @click="showDialog2 = true">Open Dialog 2</button>
              <button type="button" @click="showDialog1 = false">Close Dialog 1</button>
            </div>
          </template>
        </VueModalDialog>

        <VueModalDialog
          v-model="showDialog2"
          :backdrop="args.backdrop"
          :escape="args.escape"
          :position="args.position"
          :width="args.width"
          :mode="args.mode"
          @opened="pushEvent('Dialog 2 opened')"
          @closed="pushEvent('Dialog 2 closed')"
        >
          <template #header>
            <strong>Dialog 2</strong>
          </template>

          <p style="margin: 0; line-height: 1.5;">
            This is the topmost dialog while open.
          </p>

          <template #footer>
            <button type="button" @click="showDialog2 = false">Close Dialog 2</button>
          </template>
        </VueModalDialog>
      </div>
    `,
  }),
};
