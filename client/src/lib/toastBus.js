export const TOAST_EVENT = "app:toast";

export function emitToast(type, message) {
  if (!message) return;
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: { type, message },
    }),
  );
}
