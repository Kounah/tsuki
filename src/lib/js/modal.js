var icon = require('./icon');

/**@type {Array.<Modal>} */
var modals = [];
/**@type {HTMLDivElement} */
var overlay;
/**@type {HTMLDivElement} */
var container;
/**@type {HTMLDivElement} */
var stash;

function getOpenModals() {
  var _ = modals.filter(function(modal) { return !modal.closed; });
  console.log(_);
  return _;
}

function updateOverlay() {
  if(getOpenModals().length > 0) {
    overlay.classList.add('shown');
    return true;
  } else {
    overlay.classList.remove('shown');
    return false;
  }
}

function makeOverlay() {
  var overlay = document.createElement('div');
  overlay.setAttribute('id', 'modal-overlay');
  overlay.addEventListener('click', function() {
    modals.filter(function(modal) { return !modal.closed; }).pop().close();
  });
  document.body.appendChild(overlay);
  return overlay;
}


/**
 * @typedef {Object} ModalOptions
 * @prop {String} header
 * @prop {(this: Modal) => String} width
 * @prop {(this: Modal) => String} height
 * @prop {Object} iframe can use either src or content
 * @prop {String} iframe.src the src property for the iframe
 * @prop {String} iframe.content the iframe content
 */

/**
 * @class
 * create a new modal from an Element
 * @param {HTMLElement} el the element
 * @param {ModalOptions} options additional options
 */
function Modal(el, options) {
  modals.push(this);

  //#region PROPERTIES

  /**@type {HTMLDivElement} */
  this.el;

  /**
   * is the modal closed
   * @type {Boolean}
   */
  this.closed;
  /**
   * is the modal dismissed
   * @type {Boolean}
   */
  this.dismissed;
  /**
   * the element that was focused before `focus()` has been called
   * @type {HTMLElement}
   */
  this.focusedBy;

  //#endregion

  //#region FUNCTIONS


  /**
   *
   */
  function focus() {
    this.focusedBy = document.activeElement;
    this.el.focus();
    return this;
  }
  this.focus = focus.bind(this);

  /**
   * opens the modal
   */
  function open() {
    this.el.classList.add('shown');
    this.closed = false;
    this.focus();
    updateOverlay();
    return this;
  }
  this.open = open.bind(this);

  /**
   * closes the modal
   */
  function close() {
    this.el.classList.remove('shown');
    this.opened = true;
    updateOverlay();
    return this;
  }
  this.close = close.bind(this);

  /**
   * toggles the modal
   */
  function toggle() {
    this.el.classList.toggle('shown');
    this.opened = el.classList.contains('shown');
    return this;
  }
  this.toggle = toggle.bind(this);

  function move(target) {
    if(typeof target == 'object' && target !== 'null') {
      this.el.parentElement.removeChild(this.el);
      target.appendChild(this.el);
    }
    return this;
  }
  this.move = move.bind(this);

  function dismiss() {
    this.el.classList.add('dismissing');
    modals.splice(modals.indexOf(this), 1);
    if(!updateOverlay()) {
      this.focusedBy.focus();
    }
    setTimeout(function() {
      this.el.classList.remove('dismissing');
      this.el.parentElement.removeChild(this.el);
    }.bind(this), 350);
  }
  this.dismiss = dismiss.bind(this);

  //#endregion


  console.log('creating modal', el, options);

  /**@type {HTMLDivElement} */
  var content;
  /**@type {HTMLDivElement} */
  var footer;

  if(typeof el !== 'object' || el === null) {
    this.el = document.createElement('div');
    this.el.classList.add('modal');
    this.el.setAttribute('tabindex', '-1');

    this.el.addEventListener('keydown', function(ev) {
      console.log(ev);

      if(ev.key == 'Tab') {
        ev.preventDefault();
        footer.querySelector('button[tabindex]').focus();
      }

      if(ev.key == 'Escape') {
        ev.preventDefault();
        this.dismiss();
      }
    }.bind(this));

    content = document.createElement('div');
    content.classList.add('modal-content');

    footer = document.createElement('div');
    footer.classList.add('modal-footer');

    this.el.appendChild(content);
    this.el.appendChild(footer);

    var closeBtn = document.createElement('button');
    closeBtn.setAttribute('type', 'button');
    closeBtn.classList.add('btn');
    closeBtn.addEventListener('click', function() {
      this.close();
    }.bind(this));
    closeBtn.appendChild(icon.make('close'));

    var closeText = document.createElement('span');
    closeText.textContent = 'Close';
    closeBtn.appendChild(closeText);

    var dismissBtn = document.createElement('button');
    dismissBtn.setAttribute('type', 'button');
    dismissBtn.classList.add('btn');
    dismissBtn.addEventListener('click', function() {
      this.dismiss();
    }.bind(this));
    dismissBtn.appendChild(icon.make('delete'));
    dismissBtn.setAttribute('tabindex', '-1');

    var dismissText = document.createElement('span');
    dismissText.textContent = 'Dismiss';
    dismissBtn.appendChild(dismissText);

    // footer.appendChild(closeBtn);
    footer.appendChild(dismissBtn);

    container.appendChild(this.el);
  }

  if(typeof options == 'object') {
    // handle options

    if(typeof options.iframe == 'object') {
      var iframe = document.createElement('iframe');

      if(options.iframe.src) {
        iframe.src = options.iframe.src;
      } else if(options.iframe.content) {
        iframe.src = 'data:text/html; base64,' + btoa(options.iframe.content);
      }

      iframe.addEventListener('load', function() {
        iframe.width  = iframe.contentWindow.document.body.scrollWidth;
        iframe.height = iframe.contentWindow.document.body.scrollHeight;
      });
      content.appendChild(iframe);
    }

    if(typeof options.header == 'string') {
      var header = document.createElement('div');
      header.classList.add('modal-header');
      header.textContent = options.header;
      this.el.insertBefore(header, content);
    }
  }

  console.log('created modal', this);
}

document.addEventListener('DOMContentLoaded', function() {
  overlay = makeOverlay();

  stash = document.createElement('div');
  stash.setAttribute('id', 'modal-stash');
  document.body.appendChild(stash);

  container = document.createElement('div');
  container.setAttribute('id', 'modal-container');
  document.body.appendChild(container);
});

module.exports = Modal;