import { describe, expect, it } from 'vitest';
import { createApp, defineComponent } from 'vue';
import { VueModalDialogPlugin, VueModalDialog } from '@/index';

describe('VueModalDialogPlugin', () => {
  it('registers component with default name "VueModalDialog"', () => {
    const app = createApp(defineComponent({ template: '<div/>' }));
    app.use(VueModalDialogPlugin);

    const component = app.component('VueModalDialog');
    expect(component).toBe(VueModalDialog);
  });

  it('registers component with a custom name', () => {
    const app = createApp(defineComponent({ template: '<div/>' }));
    app.use(VueModalDialogPlugin, { name: 'CustomDialog' });

    const component = app.component('CustomDialog');
    expect(component).toBe(VueModalDialog);
    expect(app.component('VueModalDialog')).toBeUndefined();
  });
});
