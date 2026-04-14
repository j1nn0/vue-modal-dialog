// Singleton stack manager for modal dialogs
// API: push(entry) -> index, pop(id) -> removed entry, top(), topId(), count(), indexOf(id), subscribe(fn), unsubscribe(fn)
const stack = [];
const subscribers = new Set();

function notify() {
  const snapshot = stack.slice();
  subscribers.forEach((fn) => {
    try {
      fn(snapshot);
    } catch (err) {
      // swallow errors from subscribers
       
      console.debug('useDialogStack subscriber error', err);
    }
  });
}

function applyBodyClass() {
  if (typeof document === 'undefined') return;
  if (stack.length > 0) document.body.classList.add('vue-modal-open');
  else document.body.classList.remove('vue-modal-open');
}

export const useDialogStack = {
  push(entry) {
    stack.push(entry);
    applyBodyClass();
    notify();
    return stack.length - 1;
  },
  pop(id) {
    const idx = stack.findIndex((e) => e.id === id);
    if (idx !== -1) {
      const [removed] = stack.splice(idx, 1);
      applyBodyClass();
      notify();
      return removed;
    }
    return null;
  },
  top() {
    return stack.length ? stack[stack.length - 1] : null;
  },
  topId() {
    const t = stack.length ? stack[stack.length - 1] : null;
    return t ? t.id : null;
  },
  count() {
    return stack.length;
  },
  indexOf(id) {
    return stack.findIndex((e) => e.id === id);
  },
  subscribe(fn) {
    subscribers.add(fn);
  },
  unsubscribe(fn) {
    subscribers.delete(fn);
  },
  // for debugging / tests
  _getStack() {
    return stack.slice();
  },
};
