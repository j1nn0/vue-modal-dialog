<script setup lang="ts">
import {
  useTemplateRef,
  useSlots,
  ref,
  computed,
  watch,
  watchEffect,
  onBeforeUnmount,
  nextTick,
} from 'vue';
import { onKeyStroke, useEventListener } from '@vueuse/core';
import type { VueModalDialogProps } from '@/types';
import { useDialogState } from '@/composables/useDialogState';
import { useDialogSize } from '@/composables/useDialogSize';
import { useDialogMode } from '@/composables/useDialogMode';
import { useDialogStack } from '@/composables/useDialogStack';
import { useDialogDrag } from '@/composables/useDialogDrag';

// props / emit
const props = withDefaults(defineProps<VueModalDialogProps>(), {
  backdrop: true,
  escape: true,
  transition: 'fade',
  backdropTransition: 'fade-backdrop',
  position: 'center',
  width: 'md',
  mode: null,
  teleport: false,
  scrollLock: true,
  initialFocus: undefined,
  modal: true,
});
const emit = defineEmits<{
  opened: [];
  closed: [];
  'before-open': [];
  opening: [];
  'before-close': [];
  closing: [];
}>();
const dialogRef = useTemplateRef('dialogRef');
const slots = useSlots();
const isOpen = defineModel<boolean>({ required: true });

// Stack integration: shared single backdrop, dialogs stacked above it
const dialogId = `dialog-${Math.random().toString(36).slice(2)}`;
const stackIndex = ref(-1);
const currentTopId = ref<string | null>(null);
const teleportTarget = computed(() =>
  props.teleport === true ? 'body' : typeof props.teleport === 'string' ? props.teleport : 'body',
);

async function requestClose() {
  emit('before-close');
  if (props.beforeClose) {
    const allow = await props.beforeClose();
    if (!allow) return;
  }
  isOpen.value = false;
}

// composables (pass dialogId to useDialogState so focus-trap can react to stack)
const { close } = useDialogState(isOpen, dialogRef, emit, props, dialogId, requestClose);
const { dialogWidthClass, dialogWidthStyle, dialogPositionClass } = useDialogSize(props);
const { modeClass } = useDialogMode(props);
const isDraggable = computed(() => props.draggable === true && props.width !== 'fullscreen');
const { onPointerDown, dragStyle } = useDialogDrag(isOpen, isDraggable);

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
          console.warn('getComputedStyle error', err);
          return 1000;
        }
      })()
    : 1000;

const zIndexValue = computed(() => {
  const idx = stackIndex.value >= 0 ? stackIndex.value : 0;
  return BASE_Z + idx * 2 + 1; // dialog above its backdrop
});

const isTop = computed(() => currentTopId.value === dialogId);
const effectiveBackdrop = computed(() =>
  props.role === 'alertdialog' && props.backdrop === true ? 'static' : props.backdrop,
);
const canCloseByBackdrop = computed(
  () => effectiveBackdrop.value !== false && effectiveBackdrop.value !== 'static',
);

watchEffect(() => {
  if (props.role === 'alertdialog' && props.modal === false) {
    console.warn(
      '[VueModalDialog] role="alertdialog" with modal=false is contradictory: alertdialogs require focus to stay inside.',
    );
  }
});

function updateStackIndex() {
  stackIndex.value = useDialogStack.indexOf(dialogId);
  currentTopId.value = useDialogStack.topId();
}

// subscribe once to stack updates so we update stackIndex reactively
useDialogStack.subscribe(updateStackIndex);

// Watch open state to register/unregister in stack
watch(isOpen, (val) => {
  if (val) {
    emit('before-open');
    const idx = useDialogStack.push({
      id: dialogId,
      el: dialogRef,
      onClose: close,
      propsSnapshot: {
        ...props,
        scrollLock: props.modal === false ? false : props.scrollLock,
      },
    });
    stackIndex.value = idx;
    updateStackIndex();
    emit('opening');
  } else {
    emit('closing');
    useDialogStack.pop(dialogId);
    // Defer closed emit to let Vue process the DOM change (and any
    // transition) before notifying the parent.
    nextTick().then(() => emit('closed'));
  }
});

onBeforeUnmount(() => {
  useDialogStack.pop(dialogId);
  useDialogStack.unsubscribe(updateStackIndex);
});

// Backdrop click responds only on the topmost modal.
function handleBackdropClick() {
  if (!isOpen.value) return;
  if (canCloseByBackdrop.value && isTop.value) requestClose();
}

// Fallback for environments where backdrop click can be swallowed by overlays/tooling.
useEventListener(
  () => (typeof document !== 'undefined' ? document : null),
  'pointerdown',
  (e: PointerEvent) => {
    if (!isOpen.value) return;
    if (!isTop.value) return;
    if (!canCloseByBackdrop.value) return;
    if (props.width === 'fullscreen') return;

    const root = dialogRef.value;
    const target = e.target as Node | null;
    if (!root || !target) return;

    if (!root.contains(target)) {
      requestClose();
    }
  },
  { capture: true },
);

// Escape key only handled by top modal
onKeyStroke('Escape', (e) => {
  if (!isOpen.value) return;
  if (props.escape && isTop.value) {
    e.preventDefault();
    requestClose();
  }
});

// Random ID（for ARIA）
const headerId = `dialog-header-${Math.random().toString(36).slice(2)}`;
const bodyId = `dialog-body-${Math.random().toString(36).slice(2)}`;

defineExpose({ requestClose });
</script>

<template>
  <Teleport :to="teleportTarget" :disabled="!props.teleport">
    <transition :name="backdropTransition" appear>
      <div
        v-if="isOpen && isTop && width !== 'fullscreen' && props.modal !== false"
        class="backdrop"
        :class="modeClass"
        :style="{ zIndex: BASE_Z + (stackIndex >= 0 ? stackIndex * 2 : 0) }"
        @click="handleBackdropClick"
      ></div>
    </transition>

    <transition :name="transition" appear>
      <div
        ref="dialogRef"
        v-if="isOpen"
        :open="isOpen"
        :style="[{ maxWidth: dialogWidthStyle, zIndex: zIndexValue }, dragStyle]"
        class="dialog"
        :class="[dialogPositionClass, dialogWidthClass, modeClass]"
        :role="props.role ?? 'dialog'"
        :aria-modal="isTop && props.modal !== false"
        :aria-hidden="!isTop"
        :aria-labelledby="headerId"
        :aria-describedby="bodyId"
      >
        <div class="dialog-content">
          <header
            class="dialog-header"
            :id="headerId"
            :style="isDraggable ? { cursor: 'grab' } : {}"
            @pointerdown="onPointerDown"
          >
            <div class="dialog-title">
              <slot name="header"></slot>
            </div>
            <button class="dialog-close" @click="requestClose" aria-label="Close">×</button>
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
  </Teleport>
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
  --j1nn0-vue-modal-dialog-position-offset: 2rem;

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

  &.is-bottom {
    bottom: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
    left: 50%;
    transform: translateX(-50%);
  }

  &.is-left {
    left: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
    top: 50%;
    transform: translateY(-50%);
  }

  &.is-right {
    right: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
    top: 50%;
    transform: translateY(-50%);
  }

  &.is-topleft {
    top: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
    left: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
  }

  &.is-topright {
    top: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
    right: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
  }

  &.is-bottomleft {
    bottom: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
    left: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
  }

  &.is-bottomright {
    bottom: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
    right: var(--j1nn0-vue-modal-dialog-position-offset, 2rem);
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
