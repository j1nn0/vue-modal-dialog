/**
 * Dialog width: one of the built-in presets, or any CSS length.
 *
 * The `(string & {})` member keeps arbitrary CSS values assignable while
 * still offering the presets as editor completions.
 */
export type DialogWidth = 'sm' | 'md' | 'lg' | 'fullscreen' | (string & {});

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
  /** Accessible label for the dialog close button. @default 'Close' */
  closeLabel?: string;
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
  width?: DialogWidth;
  /** Color mode. `null` follows the OS `prefers-color-scheme` setting. @default null */
  mode?: 'light' | 'dark' | null;
}

/** Events emitted by the VueModalDialog component. */
export interface VueModalDialogEmits {
  /**
   * Fired when opening is requested. For an initially open dialog, this fires after its initial DOM mount.
   */
  'before-open': [];
  /** Fired when the dialog starts opening. */
  opening: [];
  /** Fired once the dialog is in the DOM and focus has been handled; the enter transition may still be playing. */
  opened: [];
  /** Fired before closing begins and before the `beforeClose` guard runs; a cancelled guard may prevent any close. */
  'before-close': [];
  /** Fired when the dialog starts closing. */
  closing: [];
  /** Fired once Vue has applied the close; the leave transition may still be playing. */
  closed: [];
}

/** Slots provided by the VueModalDialog component. */
export interface VueModalDialogSlots {
  /** Header area of the dialog. Contains the title and close button. */
  header: [];
  /** Default body content of the dialog. */
  default: [];
  /** Footer area of the dialog. Only rendered when the slot is provided. */
  footer: [];
}

/** Public API exposed via template ref on the VueModalDialog component. */
export interface VueModalDialogExpose {
  /** Request the dialog to close, respecting `beforeClose` guard if provided. */
  requestClose: () => void;
}
