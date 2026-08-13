import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearDialogStack } from '@/test-utils';

import { useDialogStack } from '../useDialogStack';

describe('useDialogStack', () => {
  afterEach(() => {
    clearDialogStack();
    document.body.classList.remove('vue-modal-open');
    document.body.style.paddingRight = '';
    vi.restoreAllMocks();
  });

  it('nextId is unique across dialogs mounted in separate Vue apps', () => {
    // Vue's useId() restarts at v-0 per app, so dialogs opened through
    // useDialog() (each its own app) would collide and both look topmost.
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) ids.add(useDialogStack.nextId());

    expect(ids.size).toBe(50);
    expect([...ids].every((id) => id.length > 0)).toBe(true);
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

  describe('scrollLock behavior', () => {
    it('adds body class without padding in a non-scrollable document', () => {
      useDialogStack.push({ id: 'default-lock' });

      expect(document.body.classList.contains('vue-modal-open')).toBeTruthy();
      expect(document.body.style.paddingRight).toBe('');

      useDialogStack.pop('default-lock');
    });

    it('compensates for the scrollbar once and restores inline padding', () => {
      const documentElement = document.documentElement;
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200);
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
      vi.spyOn(documentElement, 'clientWidth', 'get').mockReturnValue(1185);
      vi.spyOn(documentElement, 'scrollHeight', 'get').mockReturnValue(1200);
      document.body.style.paddingRight = '12px';

      useDialogStack.push({ id: 'first-lock' });
      expect(document.body.style.paddingRight).toBe('27px');

      useDialogStack.push({ id: 'second-lock' });
      expect(document.body.style.paddingRight).toBe('27px');

      useDialogStack.pop('second-lock');
      expect(document.body.style.paddingRight).toBe('27px');

      useDialogStack.pop('first-lock');
      expect(document.body.style.paddingRight).toBe('12px');

      document.body.style.paddingRight = '';
      useDialogStack.push({ id: 'empty-padding-lock' });
      expect(document.body.style.paddingRight).toBe('15px');
      useDialogStack.pop('empty-padding-lock');
      expect(document.body.style.paddingRight).toBe('');
    });

    it('does not add body class when all dialogs disable scrollLock', () => {
      useDialogStack.push({ id: 'no-lock', propsSnapshot: { scrollLock: false } });

      expect(document.body.classList.contains('vue-modal-open')).toBeFalsy();

      useDialogStack.pop('no-lock');
    });

    it('keeps body class when any stacked dialog enables scrollLock', () => {
      useDialogStack.push({ id: 'no-lock', propsSnapshot: { scrollLock: false } });
      useDialogStack.push({ id: 'yes-lock', propsSnapshot: { scrollLock: true } });

      expect(document.body.classList.contains('vue-modal-open')).toBeTruthy();

      useDialogStack.pop('yes-lock');
      expect(document.body.classList.contains('vue-modal-open')).toBeFalsy();

      useDialogStack.pop('no-lock');
    });
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

  describe('focus restoration', () => {
    it('saves activeElement when first dialog opens and restores when last closes', () => {
      const button = document.createElement('button');
      button.textContent = 'trigger';
      document.body.appendChild(button);
      button.focus();

      expect(document.activeElement).toBe(button);

      useDialogStack.push({ id: 'first' });
      useDialogStack.push({ id: 'second' });

      // pop second — active element should NOT be restored yet (stack not empty)
      useDialogStack.pop('second');

      // pop first — now stack is empty, focus should be restored
      useDialogStack.pop('first');

      expect(document.activeElement).toBe(button);

      document.body.removeChild(button);
    });

    it('does not restore focus when last pop is via cleanup (previouslyFocusedElement is null)', () => {
      // if previouslyFocusedElement was never set (e.g., no focusable element),
      // popping to empty stack should not throw
      expect(() => useDialogStack.pop('nonexistent')).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('warns to console and does not crash when a subscriber throws', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const throwingSub = () => {
        throw new Error('subscriber crash');
      };
      useDialogStack.subscribe(throwingSub);
      useDialogStack.push({ id: 'err' });

      expect(warnSpy).toHaveBeenCalledWith(
        '[Vue warn]: useDialogStack subscriber error',
        expect.any(Error),
      );

      // stack should still be updated despite the error
      expect(useDialogStack.count()).toBe(1);

      useDialogStack.unsubscribe(throwingSub);
      warnSpy.mockRestore();
    });
  });
});
