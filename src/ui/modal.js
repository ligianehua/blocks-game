export function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = false;
}

export function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}

export function isOpen(id) {
  const el = document.getElementById(id);
  return el && !el.hidden;
}
