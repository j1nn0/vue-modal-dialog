import type { ComputedRef, MaybeRef } from 'vue';
import { computed, unref } from 'vue';

export interface DialogSizeProps {
  width?: MaybeRef<string>;
}

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
