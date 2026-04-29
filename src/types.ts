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
  /**
   * ARIA role applied to the dialog container.
   * @param Standard dialog semantics for most cases; use alertdialog for urgent interruptions.
   * @default 'dialog'
   * @example 'alertdialog'
   */
  role?: 'dialog' | 'alertdialog';
  /**
   * Element selector or element to focus when the dialog opens.
   * @param Uses the first matching element or the provided element as the initial focus target.
   * @default undefined
   * @example '#confirm-button'
   */
  initialFocus?: string | HTMLElement;
  /**
   * Enables modal behavior when true.
   * @param Keeps background interaction blocked and focus trapped inside the dialog.
   * @default true
   * @example false
   */
  modal?: boolean;
  /**
   * Controls whether the dialog is teleported or rendered in place.
   * @param Pass a boolean to enable/disable teleporting, or a string CSS selector for the target.
   * @default false
   * @example '#modal-root'
   */
  teleport?: boolean | string;
  /**
   * Locks page scrolling while the dialog is open.
   * @param Prevents background content from scrolling behind the dialog.
   * @default true
   * @example false
   */
  scrollLock?: boolean;
  /**
   * Enables dragging the dialog by its header area.
   * @param Allows users to reposition the dialog with pointer input.
   * @default false
   * @example true
   */
  draggable?: boolean;
  /**
   * Transition name used for the dialog panel.
   * @param Must match a transition class set registered in styles.
   * @default 'fade'
   * @example 'zoom'
   */
  transition?: string;
  /**
   * Transition name used for the backdrop layer.
   * @param Must match a transition class set registered in styles.
   * @default 'fade-backdrop'
   * @example 'backdrop-fade'
   */
  backdropTransition?: string;
  /**
   * Callback invoked before closing the dialog.
   * @param Return false to cancel closing, or resolve to false from a Promise to keep the dialog open.
   * @default undefined
   * @example () => window.confirm('Close dialog?')
   */
  beforeClose?: () => boolean | Promise<boolean>;
  /** Vertical position of the dialog. @default 'center' */
  position?:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'topleft'
    | 'topright'
    | 'bottomleft'
    | 'bottomright';
  /** Width preset (`'sm'`, `'md'`, `'lg'`, `'fullscreen'`) or any CSS value. @default 'md' */
  width?: string;
  /** Color mode. `null` follows the OS `prefers-color-scheme` setting. @default null */
  mode?: 'light' | 'dark' | null;
}
