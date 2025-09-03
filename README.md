# j1nn0-vue-modal-dialog

A reusable Vue 3 modal dialog component with focus trap and ARIA accessibility support.

---

## Features

- Vue 3 + `<script setup>` support
- Focus trap inside the modal
- Keyboard accessibility (Escape to close)
- Backdrop with blur and fade animation
- Header, body, and footer slots
- Optional footer slot
- Close button in the header
- Auto scroll reset when opened
- Supports dynamic content and word wrapping

---

## Installation

```bash
npm install j1nn0-vue-modal-dialog
```

or

```bash
yarn add j1nn0-vue-modal-dialog
```

---

## Usage

```vue
<script setup>
import { ref } from 'vue'
import { J1nn0ModalDialog } from 'j1nn0-vue-modal-dialog'
import 'j1nn0-vue-modal-dialog/dist/j1nn0-vue-modal-dialog.css'

const isOpen = ref(false)

const submitForm = () => {
  alert('Form submitted!')
  isOpen.value = false
}
</script>

<template>
  <button @click="isOpen = true">Open Dialog</button>

  <J1nn0ModalDialog v-model="isOpen">
    <!-- Header slot -->
    <template #header> Dialog Title </template>

    <!-- Body slot (default) -->
    <p>
      This is the body content of the dialog. It supports long text and will wrap automatically.
    </p>

    <!-- Footer slot (optional) -->
    <template #footer>
      <button @click="isOpen = false">Cancel</button>
      <button @click="submitForm">Submit</button>
    </template>
  </J1nn0ModalDialog>
</template>
```

---

## Props

| Prop       | Type                | Default | Description                                                                  |
| ---------- | ------------------- | ------- | ---------------------------------------------------------------------------- |
| `backdrop` | `Boolean \| String` | `true`  | `true` = click on backdrop closes dialog, `"static"` = backdrop does nothing |
| `escape`   | `Boolean`           | `true`  | Pressing Escape key closes the dialog                                        |

---

## Slots

| Slot     | Description                                               |
| -------- | --------------------------------------------------------- |
| `header` | Optional. Content for the header. × button always present |
| default  | Content for the body of the dialog                        |
| `footer` | Optional. Content for footer, not rendered if empty       |

---

## Accessibility

- `role="dialog"` + `aria-modal="true"`
- `aria-labelledby` points to header slot
- `aria-describedby` points to body slot
- Close button has `aria-label="閉じる"`
- Focus trap inside the dialog ensures keyboard navigation
- Escape key closes the dialog if enabled

---

## Styles

- Dialog width: `90%` up to `600px` max
- Dialog height: auto, max `80vh`, scrollable if content overflows
- Word wrapping enabled in header and body
- Backdrop has fade-in/out animation with blur effect

---

## License

MIT
