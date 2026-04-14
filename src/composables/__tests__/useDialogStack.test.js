import { afterEach, describe, expect, it } from 'vitest';

import { useDialogStack } from '../useDialogStack';

describe('useDialogStack', () => {
  afterEach(() => {
    // cleanup stack
    const s = useDialogStack._getStack();
    s.forEach((e) => useDialogStack.pop(e.id));
    document.body.classList.remove('vue-modal-open');
  });

  it('push/pop updates count, topId and body class', () => {
    expect(useDialogStack.count()).toBe(0);

    const events = [];
    const subs = (stack) => events.push(stack.map((e) => e.id));
    useDialogStack.subscribe(subs);

    useDialogStack.push({ id: 'a' });
    expect(useDialogStack.count()).toBe(1);
    expect(document.body.classList.contains('vue-modal-open')).toBeTruthy();

    useDialogStack.push({ id: 'b' });
    expect(useDialogStack.count()).toBe(2);
    expect(useDialogStack.topId()).toBe('b');

    useDialogStack.pop('b');
    expect(useDialogStack.count()).toBe(1);

    useDialogStack.unsubscribe(subs);
    expect(events.length).toBeGreaterThanOrEqual(2);
  });
});
