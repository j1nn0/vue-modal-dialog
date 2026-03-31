import { DefineComponent, Plugin, VNode } from 'vue';

export interface VueModalDialogProps {
  /**
   * Controls backdrop (overlay) behavior.
   * - `true` (default): backdrop is shown and clicking it closes the dialog.
   * - `false`: no backdrop is rendered.
   * - `'static'`: backdrop is shown but clicking it does **not** close the dialog.
   */
  backdrop?: boolean | 'static';
  /**
   * When `true` (default), pressing the Escape key closes the dialog.
   */
  escape?: boolean;
  /**
   * Vertical position of the dialog.
   * - `'center'` (default): vertically centred in the viewport.
   * - `'top'`: anchored near the top of the viewport.
   */
  position?: 'center' | 'top';
  /**
   * Width of the dialog.
   * Accepts a preset (`'sm'` | `'md'` | `'lg'` | `'fullscreen'`) or any CSS length
   * ending with `px`, `%`, or `vw` (e.g. `'500px'`, `'80%'`).
   * Defaults to `'md'`.
   */
  width?: string;
  /**
   * Colour-scheme mode for the dialog.
   * - `'light'`: always use the light theme.
   * - `'dark'`: always use the dark theme.
   * - `null` (default): follow the user's OS preference (`prefers-color-scheme`).
   */
  mode?: 'light' | 'dark' | null;
  /**
   * Controls whether the dialog is open. Use with `v-model`.
   */
  modelValue: boolean;
}

export interface VueModalDialogEmits {
  /** Emitted after the dialog finishes opening and the focus trap is activated. */
  (event: 'opened'): void;
  /** Emitted after the dialog finishes closing and the focus trap is deactivated. */
  (event: 'closed'): void;
  /** Emitted when `v-model` value changes. */
  (event: 'update:modelValue', value: boolean): void;
}

export interface VueModalDialogSlots {
  /** Dialog header. The built-in close button is always rendered alongside this slot. */
  header?: () => VNode[];
  /** Main body content of the dialog. */
  default?: () => VNode[];
  /** Optional footer content. The footer is only rendered when this slot is provided. */
  footer?: () => VNode[];
}

/** Options accepted by the Vue plugin installer. */
export interface VueModalDialogPluginOptions {
  /**
   * Custom global component name.
   * Defaults to `'VueModalDialog'`.
   */
  name?: string;
}

export const VueModalDialog: DefineComponent<
  VueModalDialogProps,
  {},
  {},
  {},
  {},
  {},
  {},
  VueModalDialogEmits
>;

export const VueModalDialogPlugin: Plugin<[VueModalDialogPluginOptions?]>;
