import type { ComputedRef, Ref } from 'vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

export interface DialogModeProps {
  mode?: 'light' | 'dark' | null;
}

export function useDialogMode(props: DialogModeProps): {
  effectiveMode: Ref<'light' | 'dark' | undefined>;
  modeClass: ComputedRef<string>;
} {
  const effectiveMode = ref<'light' | 'dark' | undefined>(undefined);

  const getSystemMode = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  const updateMode = (): void => {
    effectiveMode.value = props.mode != null ? props.mode : getSystemMode();
  };

  const modeClass = computed(() => `mode-${effectiveMode.value}`);

  // props.mode が変わるたび即時に反映
  watch(() => props.mode, updateMode, { immediate: true });

  // prefers-color-scheme の変更
  let mediaQuery: MediaQueryList | null = null;
  const mediaListener = (e: MediaQueryListEvent): void => {
    if (props.mode == null) {
      effectiveMode.value = e.matches ? 'dark' : 'light';
    }
  };

  onMounted(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', mediaListener);
    }
  });

  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', mediaListener);
    }
  });

  return { effectiveMode, modeClass };
}
