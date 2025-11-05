/**
 * @jest-environment jsdom
 */

const fs = require('fs');
document.body.innerHTML = fs.readFileSync('index.html');

require('../script.js');

test('toggles dark mode', () => {
  const toggleBtn = document.getElementById('theme-toggle');
  toggleBtn.click();
  expect(document.body.classList.contains('dark')).toBe(true);
  toggleBtn.click();
  expect(document.body.classList.contains('dark')).toBe(false);
});

test('section reveal observer adds class', () => {
  const section = document.querySelector('.reveal');
  const observerCallback = IntersectionObserver.prototype.constructor.mock.calls[0][0];
  observerCallback([{ target: section, isIntersecting: true }]);
  expect(section.classList.contains('visible')).toBe(true);
});
