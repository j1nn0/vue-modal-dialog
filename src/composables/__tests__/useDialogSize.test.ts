import { describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';
import type { Ref } from 'vue';

import { useDialogSize } from '../useDialogSize';

describe('useDialogSize composable', () => {
  const mountComposable = (width: string | Ref<string>, position?: string | Ref<string>) => {
    return useDialogSize({ width, position });
  };

  describe('width behavior', () => {
    it('returns correct class for preset widths', () => {
      const presets = ['sm', 'md', 'lg', 'fullscreen'] as const;
      const expectedClasses: Record<string, Record<string, boolean>> = {
        sm: {
          'dialog-sm': true,
          'dialog-md': false,
          'dialog-lg': false,
          'dialog-fullscreen': false,
        },
        md: {
          'dialog-sm': false,
          'dialog-md': true,
          'dialog-lg': false,
          'dialog-fullscreen': false,
        },
        lg: {
          'dialog-sm': false,
          'dialog-md': false,
          'dialog-lg': true,
          'dialog-fullscreen': false,
        },
        fullscreen: {
          'dialog-sm': false,
          'dialog-md': false,
          'dialog-lg': false,
          'dialog-fullscreen': true,
        },
      };

      presets.forEach((preset) => {
        const { dialogWidthClass } = mountComposable(preset);
        expect(dialogWidthClass.value).toEqual(expectedClasses[preset]);
      });
    });

    it('returns correct style for preset widths', () => {
      const presets: Record<string, string> = {
        sm: 'var(--j1nn0-vue-modal-dialog-max-width-sm)',
        md: 'var(--j1nn0-vue-modal-dialog-max-width-md)',
        lg: 'var(--j1nn0-vue-modal-dialog-max-width-lg)',
        fullscreen: '100vw',
      };

      Object.entries(presets).forEach(([width, expectedStyle]) => {
        const { dialogWidthStyle } = mountComposable(width);
        expect(dialogWidthStyle.value).toBe(expectedStyle);
      });
    });

    it('returns custom width if not a preset', () => {
      const customWidth = '500px';
      const { dialogWidthClass, dialogWidthStyle } = mountComposable(customWidth);

      expect(dialogWidthClass.value).toEqual({
        'dialog-sm': false,
        'dialog-md': false,
        'dialog-lg': false,
        'dialog-fullscreen': false,
      });
      expect(dialogWidthStyle.value).toBe(customWidth);
    });

    it('returns undefined style for undefined width', () => {
      const { dialogWidthStyle } = useDialogSize({ width: undefined });
      expect(dialogWidthStyle.value).toBeUndefined();
    });

    it('reacts to width changes', async () => {
      const width = ref('sm');
      const { dialogWidthClass, dialogWidthStyle } = mountComposable(width);

      // 初期値
      expect(dialogWidthClass.value).toEqual({
        'dialog-sm': true,
        'dialog-md': false,
        'dialog-lg': false,
        'dialog-fullscreen': false,
      });
      expect(dialogWidthStyle.value).toBe('var(--j1nn0-vue-modal-dialog-max-width-sm)');

      // 変更
      width.value = 'md';
      await nextTick();
      expect(dialogWidthClass.value).toEqual({
        'dialog-sm': false,
        'dialog-md': true,
        'dialog-lg': false,
        'dialog-fullscreen': false,
      });
      expect(dialogWidthStyle.value).toBe('var(--j1nn0-vue-modal-dialog-max-width-md)');

      // カスタム幅に変更
      width.value = '600px';
      await nextTick();
      expect(dialogWidthClass.value).toEqual({
        'dialog-sm': false,
        'dialog-md': false,
        'dialog-lg': false,
        'dialog-fullscreen': false,
      });
      expect(dialogWidthStyle.value).toBe('600px');
    });
  });

  describe('position behavior', () => {
    it('returns correct class for all 9 positions', () => {
      const positions = [
        'center',
        'top',
        'bottom',
        'left',
        'right',
        'topleft',
        'topright',
        'bottomleft',
        'bottomright',
      ] as const;

      positions.forEach((position) => {
        const { dialogPositionClass } = mountComposable('md', position);
        const expected = {
          'is-center': position === 'center',
          'is-top': position === 'top',
          'is-bottom': position === 'bottom',
          'is-left': position === 'left',
          'is-right': position === 'right',
          'is-topleft': position === 'topleft',
          'is-topright': position === 'topright',
          'is-bottomleft': position === 'bottomleft',
          'is-bottomright': position === 'bottomright',
        };
        expect(dialogPositionClass.value).toEqual(expected);
      });
    });

    it('reacts to position changes', async () => {
      const position = ref('center');
      const { dialogPositionClass } = mountComposable('md', position);

      expect(dialogPositionClass.value['is-center']).toBe(true);
      expect(dialogPositionClass.value['is-top']).toBe(false);

      position.value = 'topleft';
      await nextTick();

      expect(dialogPositionClass.value['is-center']).toBe(false);
      expect(dialogPositionClass.value['is-topleft']).toBe(true);
    });
  });
});
