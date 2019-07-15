document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('nav-button-menu').addEventListener('click', function() {
    document.querySelector('main').classList.toggle('open-sidenav');
  });
});