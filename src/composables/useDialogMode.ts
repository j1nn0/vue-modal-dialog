import type { ComputedRef, Ref } from 'vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

/**
 * Composable that resolves the dialog color mode.
 *
 * When the mode getter returns `'light'` or `'dark'` it is used directly.
 * When it returns `null` (default) the composable follows the OS-level
 * `prefers-color-scheme` media query and updates reactively.
 *
 * @param getMode - Getter for the current mode prop.
 * @returns `effectiveMode` — the resolved mode, and `modeClass` —
 *          a CSS class string (`'mode-light'` or `'mode-dark'`).
 */
export function useDialogMode(getMode: () => 'light' | 'dark' | null | undefined): {
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
    const mode = getMode();
    effectiveMode.value = mode ?? getSystemMode();
  };

  const modeClass = computed(() => `mode-${effectiveMode.value}`);

  // Reflect mode prop changes immediately.
  watch(getMode, updateMode, { immediate: true });

  // Listen for prefers-color-scheme changes.
  let mediaQuery: MediaQueryList | null = null;
  const mediaListener = (e: MediaQueryListEvent): void => {
    if (getMode() == null) {
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
