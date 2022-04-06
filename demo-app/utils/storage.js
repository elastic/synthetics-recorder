const storage = typeof window === "undefined" ? {} : window.sessionStorage;

export function get(key) {
  if (!storage) {
    return;
  }
  const str = JSON.parse(storage.getItem(key));
  return str;
}

export function set(key, value) {
  if (!storage) {
    return;
  }
  value = JSON.stringify(value);
  return storage.setItem(key, value);
}

export function del(key) {
  if (!storage) {
    return;
  }
  return storage.removeItem(key);
}
