/**
 * initializes a dropdown
 * @param {HTMLElement} el the trigger element
 * @param {Object} options additional options
 * @param {('left'|'right')} options.attachment which side of the element to attach the target to
 */
function initDropdown(el, options) {
  let target = document.getElementById(el.getAttribute('data-target'));

  /**@type {('left'|'right')} */
  let attachment;
  if(typeof options === 'object' && options !== null) {
    attachment = options.attachment;
  }

  el.addEventListener('click', function() {
    if(target.classList.contains('shown')) {
      target.classList.remove('shown');
    } else {
      target.classList.add('shown');
    }
  });

  if(attachment === 'left') {
    // attach to left
  } else if(attachment === 'right') {
    // attach to right
  } else {
    // attach to center
  }
}

document.addEventListener('DOMContentLoaded', function() {
  /**@type {Array.<HTMLElement>} */
  let trigger = Array.prototype.slice.call(document.querySelectorAll('.dropdown-tigger'));
  trigger.forEach(initDropdown);
});