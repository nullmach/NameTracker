// Touch events own finger gestures; pointer events handle mouse and pen only.
export function attachSwipe(host, onChoose, canStart) {
  let drag;
  function reset() {
    if (!drag) return;
    const { card, id, kind } = drag;
    drag = null;
    card.classList.remove('dragging', 'swipe-ready');
    for (const property of ['transform', '--love', '--pass']) card.style.removeProperty(property);
    host.removeAttribute('data-direction');
    if (kind === 'pointer' && host.hasPointerCapture(id)) host.releasePointerCapture(id);
  }
  function begin(target, id, x, y, kind) {
    const card = target.closest('.name-card');
    if (drag || !card || target.closest('button') || !canStart()) return;
    drag = {card, id, x, y, dx:0, horizontal:false, kind};
  }
  function move(x, y) {
    if (!drag) return false;
    const dx = x - drag.x, dy = y - drag.y;
    if (!drag.horizontal) {
      if (Math.abs(dy) > 6 && Math.abs(dy) >= Math.abs(dx)) { reset(); return false; }
      if (Math.abs(dx) < 6 || Math.abs(dx) <= Math.abs(dy)) return false;
      drag.horizontal = true;
      if (drag.kind === 'pointer') host.setPointerCapture(drag.id);
      drag.card.classList.add('dragging');
    }
    drag.dx = dx;
    const threshold = Math.min(90, drag.card.clientWidth * .22);
    const amount = Math.min(1, Math.abs(dx) / threshold);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    drag.card.style.transform = reduced ? `translateX(${Math.sign(dx) * amount * 12}px)` : `translate(${dx}px, ${Math.min(18, Math.abs(dx) * .045)}px) rotate(${Math.max(-12, Math.min(12, dx / 22))}deg)`;
    drag.card.style.setProperty('--love', dx > 0 ? amount : 0);
    drag.card.style.setProperty('--pass', dx < 0 ? amount : 0);
    drag.card.classList.toggle('swipe-ready', amount === 1);
    host.dataset.direction = dx > 0 ? 'like' : 'pass';
    return true;
  }
  function finish() {
    if (!drag) return;
    const {card, dx, horizontal} = drag;
    const chosen = horizontal && Math.abs(dx) >= Math.min(90, card.clientWidth * .22);
    const pose = card.style.transform;
    reset();
    if (chosen) { card.style.transform = pose; onChoose(dx > 0 ? 'like' : 'pass'); }
  }
  host.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) { reset(); return; }
    const t = e.touches[0];
    begin(e.target, t.identifier, t.clientX, t.clientY, 'touch');
  }, {passive:true});
  host.addEventListener('touchmove', e => {
    if (drag?.kind !== 'touch') return;
    if (e.touches.length !== 1) { reset(); return; }
    const t = Array.from(e.touches).find(t => t.identifier === drag.id);
    // Cancel native panning only after horizontal intent; vertical scroll stays native.
    if (t && move(t.clientX, t.clientY) && e.cancelable) e.preventDefault();
  }, {passive:false});
  host.addEventListener('touchend', e => {
    if (drag?.kind !== 'touch') return;
    if (Array.from(e.changedTouches).some(t => t.identifier === drag.id)) finish();
  });
  host.addEventListener('touchcancel', () => { if (drag?.kind === 'touch') reset(); });
  host.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' || !e.isPrimary || e.button !== 0) return;
    begin(e.target, e.pointerId, e.clientX, e.clientY, 'pointer');
  });
  host.addEventListener('pointermove', e => {
    if (drag?.kind === 'pointer' && drag.id === e.pointerId) move(e.clientX, e.clientY);
  });
  host.addEventListener('pointerup', e => {
    if (drag?.kind === 'pointer' && drag.id === e.pointerId) finish();
  });
  for (const event of ['pointercancel', 'lostpointercapture']) host.addEventListener(event, () => {
    if (drag?.kind === 'pointer') reset();
  });
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
