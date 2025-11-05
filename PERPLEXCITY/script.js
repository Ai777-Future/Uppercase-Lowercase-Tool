// script.js
window.addEventListener('DOMContentLoaded', () => {
  const video = document.querySelector('.gym-video');
  if (video) {
    video.removeAttribute('controls');
  }
});
