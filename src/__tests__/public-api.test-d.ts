import type { DialogOptions, VueModalDialogExpose, VueModalDialogProps } from '@/index';

const defaultBackdrop: VueModalDialogProps = { backdrop: 'default' };
const staticBackdrop: VueModalDialogProps = { backdrop: 'static' };

const dialog: VueModalDialogProps = { role: 'dialog' };
const alertDialog: VueModalDialogProps = { role: 'alertdialog', describedBy: 'alert-description' };
const alertOptions: DialogOptions = { role: 'alertdialog', describedBy: 'alert-description' };
const exposed: VueModalDialogExpose = { requestClose: async () => true };
const closeResult: Promise<boolean> = exposed.requestClose();

void defaultBackdrop;
void staticBackdrop;
void dialog;
void alertDialog;
void alertOptions;
void closeResult;

// @ts-expect-error alertdialogs require describedBy.
const invalidAlertDialog: VueModalDialogProps = { role: 'alertdialog' };
// @ts-expect-error imperative alertdialogs require describedBy.
const invalidAlertOptions: DialogOptions = { role: 'alertdialog' };
// @ts-expect-error modal is no longer part of the public API.
const nonModal: VueModalDialogProps = { modal: false };
// @ts-expect-error boolean backdrop values are no longer part of the public API.
const falseBackdrop: VueModalDialogProps = { backdrop: false };
// @ts-expect-error boolean backdrop values are no longer part of the public API.
const trueBackdrop: VueModalDialogProps = { backdrop: true };

void invalidAlertDialog;
void invalidAlertOptions;
void nonModal;
void falseBackdrop;
void trueBackdrop;
