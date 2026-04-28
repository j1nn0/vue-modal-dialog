import type { ComputedRef, MaybeRef } from 'vue';
import { computed, unref } from 'vue';

/** Props shape expected by `useDialogSize`. */
export interface DialogSizeProps {
  width?: MaybeRef<string>;
}

/**
 * Composable that maps a width prop to CSS class and inline-style values.
 *
 * Preset widths (`sm`, `md`, `lg`, `fullscreen`) map to CSS custom
 * property references; any other value is passed through as-is.
 *
 * @returns `dialogWidthClass` — an object of `{ 'dialog-sm': true, ... }`
 *          for scoped CSS classes, and `dialogWidthStyle` — a `max-width`
 *          value for the inline `style` attribute.
 */
export function useDialogSize(props: DialogSizeProps): {
  dialogWidthClass: ComputedRef<Record<string, boolean>>;
  dialogWidthStyle: ComputedRef<string | undefined>;
} {
  const dialogWidthClass = computed((): Record<string, boolean> => {
    const width = unref(props.width);
    return {
      'dialog-sm': width === 'sm',
      'dialog-md': width === 'md',
      'dialog-lg': width === 'lg',
      'dialog-fullscreen': width === 'fullscreen',
    };
  });

  const dialogWidthStyle = computed((): string | undefined => {
    const width = unref(props.width);
    if (width === undefined) return undefined;
    const presets: Record<string, string> = {
      sm: 'var(--j1nn0-vue-modal-dialog-max-width-sm)',
      md: 'var(--j1nn0-vue-modal-dialog-max-width-md)',
      lg: 'var(--j1nn0-vue-modal-dialog-max-width-lg)',
      fullscreen: '100vw',
    };
    return presets[width] ?? width;
  });

  return { dialogWidthClass, dialogWidthStyle };
}
