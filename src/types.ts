/**
 * Props for the VueModalDialog component.
 *
 * All properties are optional with sensible defaults.
 */
export interface VueModalDialogProps {
  /** `true`: backdrop click closes the dialog. `false`: no backdrop. `'static'`: backdrop shown but click does not close. @default true */
  backdrop?: boolean | 'static';
  /** Whether pressing Escape closes the dialog (topmost only). @default true */
  escape?: boolean;
  /** Vertical position of the dialog. @default 'center' */
  position?: 'center' | 'top';
  /** Width preset (`'sm'`, `'md'`, `'lg'`, `'fullscreen'`) or any CSS value. @default 'md' */
  width?: string;
  /** Color mode. `null` follows the OS `prefers-color-scheme` setting. @default null */
  mode?: 'light' | 'dark' | null;
}
