/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('nav-button-menu').addEventListener('click', function() {
    document.querySelector('main').classList.toggle('open-sidenav');
  });

  if(typeof Hammer == 'function') {
    let mc = new Hammer.Manager(document.body);

    mc.add(new Hammer.Swipe({
      direction: Hammer.DIRECTION_RIGHT,
      threshold: 0,
      event: 'swiperight'
    }));

    mc.on('swiperight', function(ev) {
      console.log(ev.distance);
    });
  }
});