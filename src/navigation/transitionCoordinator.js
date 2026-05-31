const handlers = new Map();

export function register(routeName, fn) {
  handlers.set(routeName, fn);
}

export function unregister(routeName) {
  handlers.delete(routeName);
}

export async function playExit(routeName) {
  const fn = handlers.get(routeName);
  if (!fn) return Promise.resolve();
  try {
    const result = fn();
    if (result && typeof result.then === "function") {
      return result;
    }
    return Promise.resolve();
  } catch (err) {
    return Promise.resolve();
  }
}

export default { register, unregister, playExit };
