import { expect, test } from 'vitest';
import { nextTick, ref } from 'vue';

import { useDialogMode } from '../useDialogMode';

test('useDialogMode respects props.mode and updates', async () => {
  // props を ref でラップ
  const props = ref({ mode: 'dark' });
  const { effectiveMode, modeClass } = useDialogMode(props.value);

  // 初期値
  expect(effectiveMode.value).toBe('dark');
  expect(modeClass.value).toBe('mode-dark');

  // props.mode を変更
  props.value.mode = 'light';
  await nextTick(); // watch の反応を待つ
  expect(effectiveMode.value).toBe('light');
  expect(modeClass.value).toBe('mode-light');

  // props.mode を null に戻すとデフォルト light が反映
  props.value.mode = null;
  await nextTick();
  expect(effectiveMode.value).toBe('light');
  expect(modeClass.value).toBe('mode-light');
});
