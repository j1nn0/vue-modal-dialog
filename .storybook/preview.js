import { definePreview } from '@storybook/vue3-vite';

const preview = definePreview({
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    actions: { argTypesRegex: '^on.*' },
    layout: 'centered',
    backgrounds: {
      default: 'transparent',
      values: [
        { name: 'transparent', value: 'transparent' },
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#111827' },
      ],
    },
  },
  decorators: [
    (story) => {
      // Cleanup any VueModalDialog side effects left from a previous story
      if (typeof document !== 'undefined') {
        document.body.classList.remove('vue-modal-open', 'mode-light', 'mode-dark');
      }
      return story();
    },
  ],
});

export default preview;
