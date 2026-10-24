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
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.addEventListener('click', function() {
    var isOpen = menuBtn.classList.toggle('open');
    navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      menuBtn.classList.remove('open');
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
  // 点击导航区域外部关闭菜单
  document.addEventListener('click', function(e) {
    if (!navLinks.classList.contains('open')) return;
    if (!e.target.closest('.navbar')) {
      menuBtn.classList.remove('open');
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// 配色已锁定为设计规范 new-chat-6be（不提供主题切换）

// AI Copilot widget: inject on every page that loads common.js
(function() {
  var s = document.createElement('script');
  s.src = 'ai-copilot.js?v=20261018a';
  s.defer = true;
  document.head.appendChild(s);
})();

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
