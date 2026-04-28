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

    const events: string[][] = [];
    const subs = (stack: { id: string }[]) => events.push(stack.map((e) => e.id));
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

  describe('top()', () => {
    it('returns null for empty stack', () => {
      expect(useDialogStack.top()).toBeNull();
    });

    it('returns last pushed entry', () => {
      useDialogStack.push({ id: 'first' });
      useDialogStack.push({ id: 'second' });

      const top = useDialogStack.top();
      expect(top).not.toBeNull();
      expect(top!.id).toBe('second');
    });
  });

  describe('topId()', () => {
    it('returns null for empty stack', () => {
      expect(useDialogStack.topId()).toBeNull();
    });

    it('returns id of last pushed entry', () => {
      useDialogStack.push({ id: 'x' });
      useDialogStack.push({ id: 'y' });

      expect(useDialogStack.topId()).toBe('y');
      useDialogStack.pop('y');
      expect(useDialogStack.topId()).toBe('x');
    });
  });

  describe('indexOf()', () => {
    it('returns -1 when not found', () => {
      expect(useDialogStack.indexOf('nonexistent')).toBe(-1);
    });

    it('returns correct index for found entries', () => {
      useDialogStack.push({ id: 'a' });
      useDialogStack.push({ id: 'b' });

      expect(useDialogStack.indexOf('a')).toBe(0);
      expect(useDialogStack.indexOf('b')).toBe(1);
    });
  });

  describe('count()', () => {
    it('returns 0 for empty stack', () => {
      expect(useDialogStack.count()).toBe(0);
    });
  });
});
