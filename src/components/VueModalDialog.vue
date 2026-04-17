<script setup lang="ts">
import { useTemplateRef, useSlots, ref, computed, watch, onBeforeUnmount } from 'vue';
import { onClickOutside, onKeyStroke } from '@vueuse/core';
import { useDialogState } from '@/composables/useDialogState';
import { useDialogSize } from '@/composables/useDialogSize';
import { useDialogMode } from '@/composables/useDialogMode';
import { useDialogStack } from '@/composables/useDialogStack';

interface Props {
  backdrop?: boolean | 'static';
  escape?: boolean;
  position?: 'center' | 'top';
  width?: string;
  mode?: 'light' | 'dark' | null;
}

// props / emit
const props = withDefaults(defineProps<Props>(), {
  backdrop: true,
  escape: true,
  position: 'center',
  width: 'md',
  mode: null,
});
const emit = defineEmits<{
  opened: [];
  closed: [];
}>();
const dialogRef = useTemplateRef('dialogRef');
const slots = useSlots();
const isOpen = defineModel<boolean>({ required: true });

// Stack integration: shared single backdrop, dialogs stacked above it
const dialogId = `dialog-${Math.random().toString(36).slice(2)}`;
const stackIndex = ref(-1);

// composables (pass dialogId to useDialogState so focus-trap can react to stack)
const { close } = useDialogState(isOpen, dialogRef, emit, props, dialogId);
const { dialogWidthClass, dialogWidthStyle } = useDialogSize(props);
const { modeClass } = useDialogMode(props);

// read base z-index safely
const BASE_Z =
  typeof window !== 'undefined'
    ? (() => {
        try {
          const v = getComputedStyle(document.documentElement).getPropertyValue(
            '--j1nn0-vue-modal-dialog-backdrop-z-index',
          );
          const n = parseInt(v, 10);
          return Number.isFinite(n) ? n : 1000;
        } catch (err) {
          console.debug('getComputedStyle error', err);
          return 1000;
        }
      })()
    : 1000;

const zIndexValue = computed(() => {
  const idx = stackIndex.value >= 0 ? stackIndex.value : 0;
  return BASE_Z + idx * 2 + 1; // dialog above its backdrop
});

const isTop = computed(() => useDialogStack.topId() === dialogId);

function updateStackIndex() {
  stackIndex.value = useDialogStack.indexOf(dialogId);
}

// subscribe once to stack updates so we update stackIndex reactively
useDialogStack.subscribe(updateStackIndex);

// Watch open state to register/unregister in stack
watch(isOpen, (val) => {
  if (val) {
    const idx = useDialogStack.push({
      id: dialogId,
      el: dialogRef,
      onClose: close,
      propsSnapshot: props,
    });
    stackIndex.value = idx;
    updateStackIndex();
  } else {
    useDialogStack.pop(dialogId);
  }
});

onBeforeUnmount(() => {
  useDialogStack.pop(dialogId);
  useDialogStack.unsubscribe(updateStackIndex);
});

// backdrop click responds only if this modal is top
onClickOutside(dialogRef, () => {
  if (!isOpen.value) return;
  if (props.backdrop === true && isTop.value) close();
});

// Escape key only handled by top modal
onKeyStroke('Escape', (e) => {
  if (!isOpen.value) return;
  if (props.escape && isTop.value) {
    e.preventDefault();
    close();
  }
});

// Random ID（for ARIA）
const headerId = `dialog-header-${Math.random().toString(36).slice(2)}`;
const bodyId = `dialog-body-${Math.random().toString(36).slice(2)}`;
</script>

<template>
  <transition name="fade-backdrop" appear>
    <div
      v-if="isOpen && isTop && width !== 'fullscreen'"
      class="backdrop"
      :class="modeClass"
      :style="{ zIndex: BASE_Z + (stackIndex >= 0 ? stackIndex * 2 : 0) }"
    ></div>
  </transition>

  <transition name="fade" appear>
    <div
      ref="dialogRef"
      v-if="isOpen"
      :open="isOpen"
      :style="{ maxWidth: dialogWidthStyle, zIndex: zIndexValue }"
      class="dialog"
      :class="[
        { 'is-center': props.position === 'center', 'is-top': props.position === 'top' },
        dialogWidthClass,
        modeClass,
      ]"
      role="dialog"
      :aria-modal="isTop"
      :aria-hidden="!isTop"
      :aria-labelledby="headerId"
      :aria-describedby="bodyId"
    >
      <div class="dialog-content">
        <header class="dialog-header" :id="headerId">
          <div class="dialog-title">
            <slot name="header"></slot>
          </div>
          <button class="dialog-close" @click="close" aria-label="Close">×</button>
        </header>

        <div class="dialog-body" :id="bodyId">
          <slot></slot>
        </div>

        <footer v-if="slots.footer" class="dialog-footer">
          <slot name="footer"></slot>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style>
:root {
  /* Backdrop */
  --j1nn0-vue-modal-dialog-backdrop-z-index: 1000;
  --j1nn0-vue-modal-dialog-backdrop-background: rgba(0, 0, 0, 0.6);
  --j1nn0-vue-modal-dialog-backdrop-blur: 2px;

  /* Dialog */
  --j1nn0-vue-modal-dialog-border: none;
  --j1nn0-vue-modal-dialog-border-radius: 8px;
  --j1nn0-vue-modal-dialog-width: 90%;
  --j1nn0-vue-modal-dialog-max-width-sm: 300px;
  --j1nn0-vue-modal-dialog-max-width-md: 600px;
  --j1nn0-vue-modal-dialog-max-width-lg: 900px;
  --j1nn0-vue-modal-dialog-max-height: 80vh;
  --j1nn0-vue-modal-dialog-text-color: #000000;

  /* Header */
  --j1nn0-vue-modal-dialog-header-background: #f5f5f5;
  --j1nn0-vue-modal-dialog-header-padding: 1rem;

  /* Body */
  --j1nn0-vue-modal-dialog-body-background: #fff;
  --j1nn0-vue-modal-dialog-body-padding: 1rem;

  /* Footer */
  --j1nn0-vue-modal-dialog-footer-background: #f5f5f5;
  --j1nn0-vue-modal-dialog-footer-padding: 1rem;

  /* Dark mode */
  --j1nn0-vue-modal-dialog-backdrop-background-dark: rgba(255, 255, 255, 0.2);
  --j1nn0-vue-modal-dialog-border-dark: none;
  --j1nn0-vue-modal-dialog-header-background-dark: #1f2937;
  --j1nn0-vue-modal-dialog-footer-background-dark: #1f2937;
  --j1nn0-vue-modal-dialog-body-background-dark: #111827;
  --j1nn0-vue-modal-dialog-text-color-dark: #f9fafb;
}
.vue-modal-open {
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
// Backdrop
.backdrop {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(var(--j1nn0-vue-modal-dialog-backdrop-blur));
  z-index: var(--j1nn0-vue-modal-dialog-backdrop-z-index);
  transition:
    backdrop-filter 0.3s ease,
    opacity 0.3s ease;

  &.mode-light {
    background: var(--j1nn0-vue-modal-dialog-backdrop-background);
  }

  &.mode-dark {
    background: var(--j1nn0-vue-modal-dialog-backdrop-background-dark);
  }
}

.fade-backdrop-enter-active,
.fade-backdrop-leave-active {
  transition:
    opacity 0.3s ease,
    backdrop-filter 0.3s ease;
}
.fade-backdrop-enter-from,
.fade-backdrop-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}
.fade-backdrop-enter-to,
.fade-backdrop-leave-from {
  opacity: 1;
  backdrop-filter: blur(var(--j1nn0-vue-modal-dialog-backdrop-blur));
}

// Dialog
.dialog {
  position: fixed;
  z-index: calc(var(--j1nn0-vue-modal-dialog-backdrop-z-index) + 1);
  border-radius: var(--j1nn0-vue-modal-dialog-border-radius);
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  &.is-center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: var(--j1nn0-vue-modal-dialog-max-height);
    margin: 0;
    width: 100%;
    max-width: var(--j1nn0-vue-modal-dialog-width);
  }

  &.is-top {
    top: 2rem;
    left: 50%;
    transform: translateX(-50%);
    max-height: calc(100vh - 4rem);
    width: 100%;
    max-width: var(--j1nn0-vue-modal-dialog-width);
    box-sizing: border-box;
    margin: 0;
  }

  &.mode-light {
    border: var(--j1nn0-vue-modal-dialog-border);
    color: var(--j1nn0-vue-modal-dialog-text-color);

    .dialog-header {
      background: var(--j1nn0-vue-modal-dialog-header-background);
    }
    .dialog-footer {
      background: var(--j1nn0-vue-modal-dialog-footer-background);
    }
    .dialog-body {
      background: var(--j1nn0-vue-modal-dialog-body-background);
    }
    .dialog-close {
      color: var(--j1nn0-vue-modal-dialog-text-color);
    }
  }

  &.mode-dark {
    border: var(--j1nn0-vue-modal-dialog-border-dark);
    color: var(--j1nn0-vue-modal-dialog-text-color-dark);

    .dialog-header {
      background: var(--j1nn0-vue-modal-dialog-header-background-dark);
    }
    .dialog-footer {
      background: var(--j1nn0-vue-modal-dialog-footer-background-dark);
    }
    .dialog-body {
      background: var(--j1nn0-vue-modal-dialog-body-background-dark);
    }
    .dialog-close {
      color: var(--j1nn0-vue-modal-dialog-text-color-dark);
    }
  }
}

// Fade animation
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

// Content
.dialog-content {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
}

.dialog-header,
.dialog-footer {
  flex-shrink: 0;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow-wrap: break-word;
  word-break: break-word;
}

.dialog-header {
  padding: var(--j1nn0-vue-modal-dialog-header-padding);
  border-top-left-radius: var(--j1nn0-vue-modal-dialog-border-radius);
  border-top-right-radius: var(--j1nn0-vue-modal-dialog-border-radius);
}

.dialog-footer {
  padding: var(--j1nn0-vue-modal-dialog-footer-padding);
  border-bottom-left-radius: var(--j1nn0-vue-modal-dialog-border-radius);
  border-bottom-right-radius: var(--j1nn0-vue-modal-dialog-border-radius);
}

.dialog-title {
  flex: 1 1 auto;
  overflow-wrap: break-word;
}

.dialog-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1;
}

.dialog-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: var(--j1nn0-vue-modal-dialog-body-padding);
  overflow-wrap: break-word;
  word-break: break-word;
}

// Dialog width classes
.dialog-sm {
  max-width: var(--j1nn0-vue-modal-dialog-max-width-sm);
}
.dialog-md {
  max-width: var(--j1nn0-vue-modal-dialog-max-width-md);
}
.dialog-lg {
  max-width: var(--j1nn0-vue-modal-dialog-max-width-lg);
}
.dialog-fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh !important;
  border-radius: 0;
  top: 0 !important;
  left: 0 !important;
  transform: none !important;

  .dialog-content {
    height: 100%;
  }

  .dialog-header,
  .dialog-footer {
    border-radius: 0;
  }
}
</style>
