import { computed, unref } from 'vue';

export function useDialogSize(props) {
  const dialogWidthClass = computed(() => {
    const width = unref(props.width); // <- ref なら値を取得
    return {
      'dialog-sm': width === 'sm',
      'dialog-md': width === 'md',
      'dialog-lg': width === 'lg',
      'dialog-fullscreen': width === 'fullscreen',
    };
  });

  const dialogWidthStyle = computed(() => {
    const width = unref(props.width); // <- ref なら値を取得
    const presets = {
      sm: 'var(--j1nn0-vue-modal-dialog-max-width-sm)',
      md: 'var(--j1nn0-vue-modal-dialog-max-width-md)',
      lg: 'var(--j1nn0-vue-modal-dialog-max-width-lg)',
      fullscreen: '100vw',
    };
    return presets[width] || width;
  });

  return { dialogWidthClass, dialogWidthStyle };
}
