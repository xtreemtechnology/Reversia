let _subscriber = null;

export function subscribeConfirm(cb) {
  _subscriber = cb;
  return () => {
    if (_subscriber === cb) _subscriber = null;
  };
}

export function confirm({ title = "Confirm", message = "", confirmText = "OK", cancelText = "Cancel" } = {}) {
  if (!_subscriber) {
    // no subscriber: fallback to resolved false
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    try {
      _subscriber({ title, message, confirmText, cancelText, resolve });
    } catch (e) {
      resolve(false);
    }
  });
}

export default { subscribeConfirm, confirm };
