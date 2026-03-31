import { DefineComponent, Plugin, VNode } from 'vue';

export interface VueModalDialogProps {
  /** v-model で制御する開閉状態 */
  modelValue: boolean;
  /** backdrop モード */
  backdrop?: boolean | 'static';
  /** Escape キーで閉じるか */
  escape?: boolean;
  /** ダイアログの位置 */
  position?: 'center' | 'top';
  /** ダイアログ幅 */
  width?: string;
  /** ダイアログモード */
  mode?: 'light' | 'dark' | null;
}

export interface VueModalDialogEmits {
  (event: 'update:modelValue', value: boolean): void;
  (event: 'opened'): void;
  (event: 'closed'): void;
}

export interface VueModalDialogSlots {
  header?: () => VNode[];
  default?: () => VNode[];
  footer?: () => VNode[];
}

export const VueModalDialog: DefineComponent<
  VueModalDialogProps,
  {},
  {},
  {},
  {},
  {},
  {},
  VueModalDialogEmits
>;

export const VueModalDialogPlugin: Plugin;
