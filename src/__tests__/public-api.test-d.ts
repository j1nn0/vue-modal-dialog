import type { VueModalDialogProps } from '@/index';

const defaultBackdrop: VueModalDialogProps = { backdrop: 'default' };
const staticBackdrop: VueModalDialogProps = { backdrop: 'static' };

void defaultBackdrop;
void staticBackdrop;

// @ts-expect-error modal is no longer part of the public API.
const nonModal: VueModalDialogProps = { modal: false };
// @ts-expect-error boolean backdrop values are no longer part of the public API.
const falseBackdrop: VueModalDialogProps = { backdrop: false };
// @ts-expect-error boolean backdrop values are no longer part of the public API.
const trueBackdrop: VueModalDialogProps = { backdrop: true };

void nonModal;
void falseBackdrop;
void trueBackdrop;
