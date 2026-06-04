import { buildDisplayName } from "./normalizers.js";

export function mergeUsers(localUsers = []) {
  const map = new Map();
  localUsers.forEach((item) => {
    if (!item?.id) return;
    map.set(item.id, item);
  });
  return [...map.values()];
}

export { buildDisplayName };
