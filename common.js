/* ============ COMMON JS - shared across all pages ============ */

// Loading screen
window.addEventListener('load', function() {
  var loader = document.querySelector('.loader');
  if (loader) {
    setTimeout(function() {
      loader.classList.add('hidden');
      document.body.classList.add('loaded');
    }, 300);
  } else {
    document.body.classList.add('loaded');
  }
});

// Navbar scroll effect (throttled)
var navbar = document.querySelector('.navbar');
var scrollTicking = false;
window.addEventListener('scroll', function() {
  if (!navbar || scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(function() {
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
    scrollTicking = false;
  });
});

// Mobile menu toggle
var menuBtn = document.getElementById('menuToggle');
var navLinks = document.getElementById('navLinks');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', function() {
    menuBtn.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      menuBtn.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// Theme toggle
var themeBtn = document.getElementById('themeToggle');
var root = document.documentElement;
var themeIdx = 0;
var themes = [
  { name: 'gold',   accent: '#e8a838' },
  { name: 'rose',   accent: '#ec4899' },
  { name: 'azure',  accent: '#3b82f6' },
  { name: 'silver', accent: '#94a3b8' },
];

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  var r = parseInt(hex.substr(0, 2), 16);
  var g = parseInt(hex.substr(2, 2), 16);
  var b = parseInt(hex.substr(4, 2), 16);
  return r + ', ' + g + ', ' + b;
}

if (themeBtn) {
  themeBtn.addEventListener('click', function() {
    themeIdx = (themeIdx + 1) % themes.length;
    var t = themes[themeIdx];
    var accentRgb = hexToRgb(t.accent);
    root.style.setProperty('--accent', t.accent);
    root.style.setProperty('--accent-dim', 'rgba(' + accentRgb + ', 0.15)');
    root.style.setProperty('--accent-glow', 'rgba(' + accentRgb + ', 0.08)');
    root.style.setProperty('--border-hover', 'rgba(' + accentRgb + ', 0.3)');
  });
}

// Fade-up animation on scroll (Intersection Observer)
var fadeElements = document.querySelectorAll('.fade-up');
if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  fadeElements.forEach(function(el) { observer.observe(el); });
} else {
  // Fallback: just show everything
  fadeElements.forEach(function(el) { el.classList.add('visible'); });
}
