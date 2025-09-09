<script setup>
import { computed, useTemplateRef, watch, nextTick, useSlots } from 'vue';
import { onClickOutside, onKeyStroke } from '@vueuse/core';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';

// Random ID（for ARIA）
const headerId = `dialog-header-${Math.random().toString(36).slice(2)}`;
const bodyId = `dialog-body-${Math.random().toString(36).slice(2)}`;

// v-model
const isOpen = defineModel({
  type: Boolean,
  required: true,
});

// Props
const props = defineProps({
  backdrop: {
    type: [Boolean, String],
    default: true,
    validator: (value) => value === true || value === 'static',
  },

  escape: {
    type: Boolean,
    default: true,
  },

  position: {
    type: String,
    default: 'center',
    validator: (value) => ['center', 'top'].includes(value),
  },

  width: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg', 'fullscreen'].includes(v),
  },
});

const emit = defineEmits(['opened', 'closed']);
const dialogRef = useTemplateRef('dialogRef');
const slots = useSlots();

// Focus trap
const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap(dialogRef, {
  initialFocus: false,
  escapeDeactivates: false,
});

let overflow = null;

watch(isOpen, async (newVal) => {
  if (newVal) {
    overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    await nextTick();
    activateFocusTrap();
    emit('opened');
  } else {
    document.body.style.overflow = overflow;
    deactivateFocusTrap();
    emit('closed');
  }
});

// Close
const close = () => {
  isOpen.value = false;
};

// backdrop click
onClickOutside(dialogRef, () => {
  if (!isOpen.value) return;
  if (props.backdrop === true) close();
});

// Escape key
onKeyStroke('Escape', (e) => {
  if (!isOpen.value) return;
  if (props.escape) {
    e.preventDefault();
    close();
  }
});

// Dialog size
const dialogWidthClass = computed(() => ({
  'dialog-sm': props.width === 'sm',
  'dialog-md': props.width === 'md',
  'dialog-lg': props.width === 'lg',
  'dialog-fullscreen': props.width === 'fullscreen',
}));
</script>

<template>
  <transition name="fade-backdrop" appear>
    <div v-if="isOpen && width !== 'fullscreen'" class="backdrop"></div>
  </transition>

  <transition name="fade" appear>
    <dialog
      ref="dialogRef"
      v-if="isOpen"
      :open="isOpen"
      class="dialog"
      :class="[
        { 'is-center': props.position === 'center', 'is-top': props.position === 'top' },
        dialogWidthClass,
      ]"
      role="dialog"
      aria-modal="true"
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
    </dialog>
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

  /* Header */
  --j1nn0-vue-modal-dialog-header-background: #f5f5f5;
  --j1nn0-vue-modal-dialog-header-padding: 1rem;

  /* Body */
  --j1nn0-vue-modal-dialog-body-padding: 1rem;

  /* Footer */
  --j1nn0-vue-modal-dialog-footer-background: #f5f5f5;
  --j1nn0-vue-modal-dialog-footer-padding: 1rem;
}
</style>

<style lang="scss" scoped>
// Backdrop
.backdrop {
  position: fixed;
  inset: 0;
  background: var(--j1nn0-vue-modal-dialog-backdrop-background);
  backdrop-filter: blur(var(--j1nn0-vue-modal-dialog-backdrop-blur));
  z-index: var(--j1nn0-vue-modal-dialog-backdrop-z-index);
  transition:
    backdrop-filter 0.3s ease,
    opacity 0.3s ease;
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
  width: var(--j1nn0-vue-modal-dialog-width);
  border: var(--j1nn0-vue-modal-dialog-border);
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
  }

  &.is-top {
    top: 2rem;
    left: 50%;
    transform: translateX(-50%);
    max-height: calc(100vh - 4rem);
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
}

.dialog-header {
  background: var(--j1nn0-vue-modal-dialog-header-background);
  padding: var(--j1nn0-vue-modal-dialog-header-padding);
  border-top-left-radius: var(--j1nn0-vue-modal-dialog-border-radius);
  border-top-right-radius: var(--j1nn0-vue-modal-dialog-border-radius);
}

.dialog-footer {
  background: var(--j1nn0-vue-modal-dialog-footer-background);
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
}

// Dialog width
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
}
</style>
