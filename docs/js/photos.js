/* photos.js — PMCPA's own images, hotlinked from pmcpa.org.uk (V2 design layer).
   Each [data-photo] placeholder gets its image only once it has loaded; if it
   can't load, the illustrated brand placeholder from theme.css stays. Delete
   this file and theme.css to return to the greyscale prototypes.
   Images © PMCPA. */
(function () {
  'use strict';
  var BASE = 'https://www.pmcpa.org.uk/media/';
  var PHOTOS = {
    hero: BASE + 'mlnkhyna/hero-banner.png',
    logo: BASE + 'rarepjko/pmcpa-logo.png?width=360',
    hands: BASE + 'rvmep51q/hands-and-the-code-pic.jpg?width=800',
    hands2: BASE + 'rvmep51q/hands-and-the-code-pic.jpg?width=800',
    clause2: BASE + 'ohidazsd/clause-2.png?width=500&height=500',
    code: BASE + '4vfn2iau/2024-code-cover.png?height=584',
    report: BASE + 'ynzfwblg/pmcpa-annual-report-2025-front-cover.jpg?height=584'
  };
  function apply(el) {
    var src = PHOTOS[el.getAttribute('data-photo')];
    if (!src) return;
    var img = new Image();
    img.onload = function () {
      el.style.backgroundImage = 'url("' + src + '")';
      el.classList.add('has-photo');
    };
    img.src = src;
  }
  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('[data-photo]'), apply);
  });
})();
