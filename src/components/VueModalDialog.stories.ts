import { ref, watch } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { action } from 'storybook/actions';

import VueModalDialog from './VueModalDialog.vue';

const openedAction = action('opened');
const closedAction = action('closed');

const LONG_TEXT = Array.from({ length: 8 })
  .map(
    (_, i) =>
      `Paragraph ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. ` +
      'Vivamus ac nisl sed arcu fermentum tincidunt. Morbi eget turpis nec nisi ' +
      'pellentesque condimentum. Aliquam erat volutpat. Praesent facilisis, nisi ' +
      'vitae tincidunt laoreet, odio sem blandit turpis, ut volutpat nulla tortor ' +
      'eget libero.',
  )
  .join('\n\n');

const meta: Meta = {
  title: 'Components/VueModalDialog',
  component: VueModalDialog,
  tags: ['autodocs'],
  args: {
    backdrop: true,
    escape: true,
    position: 'center',
    width: 'md',
    mode: null,
  },
  argTypes: {
    backdrop: {
      description:
        'Backdrop behavior: `true` (closes on click), `false` (no backdrop), `"static"` (visible but click does not close).',
      control: 'select',
      options: [true, false, 'static'],
      table: {
        type: { summary: 'boolean | "static"' },
        defaultValue: { summary: 'true' },
      },
    },
    escape: {
      description: 'Whether pressing the Escape key closes the dialog (topmost dialog only).',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    position: {
      description: 'Vertical position of the dialog on screen.',
      control: 'inline-radio',
      options: ['center', 'top'],
      table: {
        type: { summary: '"center" | "top"' },
        defaultValue: { summary: 'center' },
      },
    },
    width: {
      description:
        'Dialog width. Presets map to CSS custom properties; any CSS value (e.g. `420px`, `75vw`) is used as-is.',
      control: 'select',
      options: ['sm', 'md', 'lg', 'fullscreen', '420px', '75vw'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'md' },
      },
    },
    mode: {
      description:
        'Color mode. `null` follows OS `prefers-color-scheme`; `"light"` or `"dark"` overrides it.',
      control: 'select',
      options: [null, 'light', 'dark'],
      table: {
        type: { summary: '"light" | "dark" | null' },
        defaultValue: { summary: 'null' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ── helpers ────────────────────────────────────────────────────────────────

function usePlayground(args: Record<string, unknown>) {
  const isOpen = ref(false);
  const openedCount = ref(0);
  const closedCount = ref(0);

  const handleOpened = (...eventArgs: unknown[]) => {
    openedCount.value += 1;
    openedAction(...eventArgs);
  };
  const handleClosed = (...eventArgs: unknown[]) => {
    closedCount.value += 1;
    closedAction(...eventArgs);
  };

  watch(
    () => args.mode,
    (nextMode, prevMode) => {
      if (typeof document === 'undefined') return;
      if (prevMode) document.body.classList.remove(`mode-${prevMode}`);
      if (nextMode) document.body.classList.add(`mode-${nextMode}`);
    },
    { immediate: true },
  );

  return { isOpen, openedCount, closedCount, handleOpened, handleClosed };
}

/**
 * Render a simple dialog story with an "Open" button and `v-model` binding.
 * The dialog body renders the `args.bodyText` and the header/footer use
 * `args.titleText` / `args.footerText` respectively.
 */
function renderSimpleStory(headerSlot: string, bodySlot: string, footerSlot: string) {
  return (args: Record<string, unknown>) => ({
    components: { VueModalDialog },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div style="min-width: 320px;">
        <button type="button" @click="isOpen = true">Open Dialog</button>

        <VueModalDialog
          v-model="isOpen"
          :backdrop="args.backdrop"
          :escape="args.escape"
          :position="args.position"
          :width="args.width"
          :mode="args.mode"
          @opened="() => {}"
          @closed="() => {}"
        >
          ${headerSlot}
          ${bodySlot}
          ${footerSlot}
        </VueModalDialog>
      </div>
    `,
  });
}

function defaultHeader(): string {
  return '<template #header><strong>{{ args.titleText }}</strong></template>';
}

function defaultBody(): string {
  return '<p style="margin: 0; line-height: 1.5;">{{ args.bodyText }}</p>';
}

function defaultFooter(): string {
  return '<template #footer><div style="display: flex; gap: 0.5rem;"><button type="button" @click="isOpen = false">Close</button><span style="font-size: 0.875rem; opacity: 0.8;">{{ args.footerText }}</span></div></template>';
}

// ── Playground ─────────────────────────────────────────────────────────────

/**
 * Interactive playground with full control over all props and slot content.
 * Use the Controls panel to tweak backdrop, escape, position, width, mode,
 * and slot texts in real time.
 */
export const Playground: Story = {
  args: {
    titleText: 'VueModalDialog Story',
    bodyText: 'This is a Storybook canvas for testing modal behavior.',
    footerText: 'Footer area',
  },
  render: (args) => ({
    components: { VueModalDialog },
    setup() {
      const { isOpen, openedCount, closedCount, handleOpened, handleClosed } = usePlayground(
        args as Record<string, unknown>,
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

// ── Fullscreen ─────────────────────────────────────────────────────────────

/** Demonstrates the `fullscreen` width with `top` position. */
export const Fullscreen: Story = {
  args: {
    width: 'fullscreen',
    position: 'top',
    titleText: 'Fullscreen Mode',
    bodyText: 'This dialog fills the entire viewport. Header and footer are flush with the edges.',
    footerText: 'Fullscreen Footer',
  },
  render: renderSimpleStory(defaultHeader(), defaultBody(), defaultFooter()),
};

// ── StackedModals ──────────────────────────────────────────────────────────

/** Opens two dialogs in a stacked configuration. Only the topmost responds to Escape / backdrop click. */
export const StackedModals: Story = {
  args: {
    backdrop: true,
    escape: true,
    position: 'center',
    width: 'md',
    mode: null,
    titleText: 'Stacked Dialogs',
    bodyText: 'Use the controls below to test stacked dialog interaction.',
    footerText: 'Stack Demo',
  },
  render: (args) => ({
    components: { VueModalDialog },
    setup() {
      const showDialog1 = ref(false);
      const showDialog2 = ref(false);
      const events = ref<string[]>([]);

      const pushEvent = (message: string) => {
        events.value = [message, ...events.value].slice(0, 6);
      };

      watch(
        () => args.mode,
        (nextMode, prevMode) => {
          if (typeof document === 'undefined') return;
          if (prevMode) document.body.classList.remove(`mode-${prevMode}`);
          if (nextMode) document.body.classList.add(`mode-${nextMode}`);
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
          Open Dialog 1, then open Dialog 2 from its footer. Escape/backdrop close only the topmost.
        </p>
        <ul style="margin: 0.25rem 0 0; padding-left: 1.2rem; font-size: 0.8125rem; opacity: 0.75;">
          <li v-for="(event, idx) in events" :key="idx">{{ event }}</li>
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
          <template #header><strong>Dialog 1</strong></template>
          <p style="margin: 0; line-height: 1.5;">This is the first (lower) dialog.</p>
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
          <template #header><strong>Dialog 2</strong></template>
          <p style="margin: 0; line-height: 1.5;">This is the topmost dialog while open.</p>
          <template #footer>
            <button type="button" @click="showDialog2 = false">Close Dialog 2</button>
          </template>
        </VueModalDialog>
      </div>
    `,
  }),
};

// ── StaticBackdrop ─────────────────────────────────────────────────────────

/** Shows a visible backdrop that does **not** close the dialog on click. */
export const StaticBackdrop: Story = {
  args: {
    backdrop: 'static',
    titleText: 'Static Backdrop',
    bodyText:
      'Click the darkened area behind the dialog — it will not close. Use the × button or the Close button below.',
    footerText: 'Only explicit close',
  },
  render: renderSimpleStory(defaultHeader(), defaultBody(), defaultFooter()),
};

// ── NoBackdrop ─────────────────────────────────────────────────────────────

/** Dialog without any backdrop. */
export const NoBackdrop: Story = {
  args: {
    backdrop: false,
    titleText: 'No Backdrop',
    bodyText: 'There is no backdrop behind this dialog. Use the × button or Close to dismiss.',
    footerText: 'No backdrop',
  },
  render: renderSimpleStory(defaultHeader(), defaultBody(), defaultFooter()),
};

// ── NoEscape ───────────────────────────────────────────────────────────────

/** The Escape key is disabled. Only UI controls can dismiss the dialog. */
export const NoEscape: Story = {
  args: {
    escape: false,
    titleText: 'Escape Disabled',
    bodyText: 'Press the Escape key — nothing happens. You must use the × or Close button.',
    footerText: 'Escape: off',
  },
  render: renderSimpleStory(defaultHeader(), defaultBody(), defaultFooter()),
};

// ── LongContent ────────────────────────────────────────────────────────────

/** Dialog with a long body that triggers internal scroll. */
export const LongContent: Story = {
  args: {
    width: 'md',
    position: 'center',
    titleText: 'Scrollable Content',
    bodyText: LONG_TEXT,
    footerText: 'Scrolling Demo',
  },
  render: renderSimpleStory(defaultHeader(), defaultBody(), defaultFooter()),
};

// ── DarkMode ───────────────────────────────────────────────────────────────

/** Explicit dark mode, ignoring OS `prefers-color-scheme`. */
export const DarkMode: Story = {
  args: {
    mode: 'dark',
    titleText: 'Dark Mode',
    bodyText: 'This dialog is forced to dark mode. It ignores the system color-scheme preference.',
    footerText: 'Forced dark',
  },
  render: renderSimpleStory(defaultHeader(), defaultBody(), defaultFooter()),
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// ── LightMode ──────────────────────────────────────────────────────────────

/** Explicit light mode, ignoring OS `prefers-color-scheme`. */
export const LightMode: Story = {
  args: {
    mode: 'light',
    titleText: 'Light Mode',
    bodyText: 'This dialog is forced to light mode.',
    footerText: 'Forced light',
  },
  render: renderSimpleStory(defaultHeader(), defaultBody(), defaultFooter()),
  parameters: {
    backgrounds: { default: 'light' },
  },
};

// ── CustomWidth ────────────────────────────────────────────────────────────

/** Custom width values outside the preset range. Any CSS length is accepted. */
export const CustomWidth: Story = {
  args: {
    width: '420px',
    titleText: 'Custom Width: 420px',
    bodyText: 'This dialog uses `width="420px"`. Try changing to `75vw` or `600px` in Controls.',
    footerText: 'width: 420px',
  },
  render: renderSimpleStory(defaultHeader(), defaultBody(), defaultFooter()),
};

// ── PositionTop ────────────────────────────────────────────────────────────

/** Dialog anchored to the top of the viewport (2rem margin from top edge). */
export const PositionTop: Story = {
  args: {
    position: 'top',
    titleText: 'Top Position',
    bodyText:
      'This dialog is pinned to the top of the viewport instead of being centered vertically.',
    footerText: 'position: top',
  },
  render: renderSimpleStory(defaultHeader(), defaultBody(), defaultFooter()),
};

// ── FormInDialog ───────────────────────────────────────────────────────────

/** A realistic form inside a modal dialog, demonstrating focus trap with interactive controls. */
export const FormInDialog: Story = {
  args: {
    width: 'md',
    titleText: 'Contact Form',
    bodyText: '',
    footerText: '',
  },
  render: (args) => ({
    components: { VueModalDialog },
    setup() {
      const isOpen = ref(false);
      const name = ref('');
      const email = ref('');
      const submitted = ref(false);

      function handleSubmit() {
        submitted.value = true;
      }

      function handleReset() {
        name.value = '';
        email.value = '';
        submitted.value = false;
        isOpen.value = false;
      }

      return {
        args,
        isOpen,
        name,
        email,
        submitted,
        handleSubmit,
        handleReset,
      };
    },
    template: `
      <div style="min-width: 320px;">
        <button type="button" @click="isOpen = true">Open Contact Form</button>

        <VueModalDialog
          v-model="isOpen"
          :backdrop="args.backdrop"
          :escape="args.escape"
          :position="args.position"
          :width="args.width"
          :mode="args.mode"
        >
          <template #header>
            <strong>{{ args.titleText }}</strong>
          </template>

          <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label for="form-name" style="display: block; margin-bottom: 0.25rem; font-weight: 600;">Name</label>
              <input
                id="form-name"
                v-model="name"
                type="text"
                placeholder="Your name"
                style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"
              />
            </div>
            <div>
              <label for="form-email" style="display: block; margin-bottom: 0.25rem; font-weight: 600;">Email</label>
              <input
                id="form-email"
                v-model="email"
                type="email"
                placeholder="you@example.com"
                style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"
              />
            </div>
            <p v-if="submitted" style="margin: 0; color: green; font-weight: 600;">
              Form submitted! Name: {{ name }}, Email: {{ email }}
            </p>
          </form>

          <template #footer>
            <div style="display: flex; gap: 0.5rem;">
              <button type="button" @click="handleSubmit">Submit</button>
              <button type="button" @click="handleReset">Cancel</button>
            </div>
          </template>
        </VueModalDialog>
      </div>
    `,
  }),
};

// ── MinimalSlots ───────────────────────────────────────────────────────────

/** Simplest possible usage: only the default (body) slot, no header or footer. */
export const MinimalSlots: Story = {
  args: {
    titleText: '',
    bodyText:
      'This dialog has no header or footer — just the body content and the default × close button.',
    footerText: '',
  },
  render: (args) => ({
    components: { VueModalDialog },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div style="min-width: 320px;">
        <button type="button" @click="isOpen = true">Open Minimal Dialog</button>

        <VueModalDialog
          v-model="isOpen"
          :backdrop="args.backdrop"
          :escape="args.escape"
          :position="args.position"
          :width="args.width"
          :mode="args.mode"
        >
          <p style="margin: 0; line-height: 1.5;">{{ args.bodyText }}</p>
        </VueModalDialog>
      </div>
    `,
  }),
};
