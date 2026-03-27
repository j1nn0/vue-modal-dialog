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
