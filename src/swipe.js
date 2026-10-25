// Keep vertical scrolling native; capture only gestures that commit horizontally.
export function attachSwipe(host, onChoose, canStart) {
  let drag;
  function reset() {
    if (!drag) return;
    const { card, id } = drag;
    drag = null;
    card.classList.remove('dragging', 'swipe-ready');
    card.style.removeProperty('transform');
    card.style.removeProperty('--love');
    card.style.removeProperty('--pass');
    host.removeAttribute('data-direction');
    if (host.hasPointerCapture(id)) host.releasePointerCapture(id);
  }
  host.addEventListener('pointerdown', e => {
    const card = e.target.closest('.name-card');
    if (drag || !e.isPrimary || e.button !== 0 || !card || e.target.closest('button') || !canStart()) return;
    drag = { card, id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, horizontal: false };
  });
  host.addEventListener('pointermove', e => {
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.horizontal) {
      if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) { reset(); return; }
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
      drag.horizontal = true;
      host.setPointerCapture(e.pointerId);
      drag.card.classList.add('dragging');
    }
    drag.dx = dx;
    const threshold = Math.min(100, drag.card.clientWidth * .24);
    const amount = Math.min(1, Math.abs(dx) / threshold);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    drag.card.style.transform = reduced ? `translateX(${Math.sign(dx) * amount * 12}px)` : `translate(${dx}px, ${Math.min(18, Math.abs(dx) * .045)}px) rotate(${Math.max(-12, Math.min(12, dx / 22))}deg)`;
    drag.card.style.setProperty('--love', dx > 0 ? amount : 0);
    drag.card.style.setProperty('--pass', dx < 0 ? amount : 0);
    drag.card.classList.toggle('swipe-ready', amount === 1);
    host.dataset.direction = dx > 0 ? 'like' : 'pass';
  });
  host.addEventListener('pointerup', e => {
    if (!drag || drag.id !== e.pointerId) return;
    const { card, dx, horizontal } = drag;
    const chosen = horizontal && Math.abs(dx) >= Math.min(100, card.clientWidth * .24);
    // Preserve the release pose so the exit animation continues from the finger.
    const pose = card.style.transform;
    reset();
    if (chosen) { card.style.transform = pose; onChoose(dx > 0 ? 'like' : 'pass'); }
  });
  host.addEventListener('pointercancel', reset);
  host.addEventListener('lostpointercapture', reset);
  window.addEventListener('blur', reset);
  return reset;
}

export async function animateChoice(card, value) {
  if (!card) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sign = value === 'like' ? 1 : -1;
  card.style.setProperty(value === 'like' ? '--love' : '--pass', 1);
  card.classList.add('leaving', 'swipe-ready');
  const from = getComputedStyle(card).transform;
  const animation = card.animate([
    { transform: from === 'none' ? 'translateX(0)' : from, opacity: 1 },
    { transform: reduced ? 'translateX(0)' : `translate(${sign * (window.innerWidth + card.clientWidth)}px, 45px) rotate(${sign * 22}deg)`, opacity: 0 }
  ], { duration: reduced ? 90 : 320, easing: 'cubic-bezier(.32,.02,.66,.6)', fill: 'forwards' });
  try { await animation.finished; } catch { /* A new collection may replace the card. */ }
}
