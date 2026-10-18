/* Cursor parallax is progressive enhancement; the CSS scene moves on its own. */
(function () {
  'use strict';

  var hero = document.getElementById('hero');
  var rig = hero && hero.querySelector('.hero-spatial__rig');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!rig || !finePointer.matches || reducedMotion.matches) return;

  var targetX = 0, targetY = 0, x = 0, y = 0, frame = 0;

  function paint() {
    frame = 0;
    x += (targetX - x) * 0.12;
    y += (targetY - y) * 0.12;
    rig.style.setProperty('--pointer-x', (x * 18).toFixed(2) + 'px');
    rig.style.setProperty('--pointer-y', (y * 10).toFixed(2) + 'px');
    rig.style.setProperty('--tilt-x', (y * -3).toFixed(2) + 'deg');
    rig.style.setProperty('--tilt-y', (x * 5).toFixed(2) + 'deg');
    if (Math.abs(targetX - x) > 0.002 || Math.abs(targetY - y) > 0.002) frame = requestAnimationFrame(paint);
  }

  function schedule() {
    if (!frame && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(paint);
  }

  hero.addEventListener('pointermove', function (event) {
    var bounds = hero.getBoundingClientRect();
    targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .5) * 2));
    targetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2));
    schedule();
  }, { passive: true });

  hero.addEventListener('pointerleave', function () {
    targetX = targetY = 0;
    schedule();
  });

  reducedMotion.addEventListener('change', function () {
    if (reducedMotion.matches) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      targetX = targetY = x = y = 0;
      ['--pointer-x', '--pointer-y', '--tilt-x', '--tilt-y'].forEach(function (name) { rig.style.removeProperty(name); });
    }
  });
})();
