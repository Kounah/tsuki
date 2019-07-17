var Progress = require('./progress');
var Modal = require('./modal');

function initLabels() {
  /**@type {Array.<HTMLFormElement>} */
  var labels = Array.prototype.slice.call(document.querySelectorAll('label[for]'));

  labels.forEach(function(label) {
    var input = document.getElementById(label.getAttribute('for'));

    if(input.value.length <= 0) {
      label.style.transform = 'translateY(' + input.getBoundingClientRect().height + 'px)';
    }

    input.addEventListener('focus', function() {
      label.classList.add('focused');
      label.style.transform = '';
    });

    input.addEventListener('focusout', function() {
      label.classList.remove('focused');
      if(input.value.length <= 0) {
        label.style.transform = 'translateY(' + input.getBoundingClientRect().height + 'px)';
      }
    });
  });
}

/**
 * @param {HTMLFormElement} form
 */
function jsonFormData(form) {
  var formData = new FormData(form);

  return Array.from(formData.entries()).reduce(function(r, e) {
    var k = e[0];
    var v = e[1];
    /**@type {HTMLInputElement} */
    var i = form.querySelector('input[name=\'' + k + '\']');

    if(i.type == 'checkbox') {
      if(v == 'on') v = true;
      else if(v == 'off') v = false;
      else v = undefined;
    }

    if(i.type == 'number') {
      v = Number(v);
    }

    if(k.endsWith('[]')) {
      k = k.substring(0, k.length - 2);
      if(typeof r[k] == 'object' && r[k] instanceof Array) {
        r[k].push(v);
      } else {
        r[k] = [v];
      }
    } else {
      r[k] = v;
    }

    return r;
  }, {});
}
module.exports.initLabels = initLabels;


function initApiForm() {
  /**@type {Array.<HTMLFormElement>} */
  var forms = Array.prototype.slice.call(document.querySelectorAll('form.api'));

  forms.forEach(function(form) {
    var onsuccess, onfail;
    try {
      onsuccess = eval.call(form, form.getAttribute('onsuccess'));
      onfail = eval.call(form, form.getAttribute('onfail'));
    } catch(err) {
      console.log(err);
    }

    var progress = new Progress(form.querySelector('.progress'), {
      indeterminate: true,
      running: false
    });

    form.addEventListener('submit', function(ev) {
      ev.preventDefault();

      var xhr = new XMLHttpRequest();

      var data;
      if(form.enctype === 'application/json') {
        data = JSON.stringify(jsonFormData(form));
        xhr.setRequestHeader('Content-Type', 'application/json');
      } else {
        data = new FormData(form);
      }

      xhr.addEventListener('loadstart', function() {
        progress.indeterminate(true).start();
      });

      xhr.addEventListener('loadend', function() {
        progress.stop();
      });

      xhr.addEventListener('load', function() {
        // content type
        var ct = this.getResponseHeader('Content-Type');

        // response body
        var rb;
        if(/^application\/json.*/.test(ct)) {
          rb = JSON.parse(this.responseText);
        } else {
          rb = this.responseText;
        }

        if(/^text\/html.*/.test(ct)) {
          var modal = new Modal(null, {
            iframe: {
              content: this.responseText
            },
            header: 'Response'
          });

          modal.open();
        }

        progress.stop();
        if(this.status == 200 || this.status == 201) {
          console.log(form.method + ' ' + form.action + ':', rb);

          if(typeof onsuccess === 'function') {
            onsuccess.call(form, rb);
          }
        } else {
          console.error(form.method + ' ' + form.action + ':', rb);

          if(typeof onfail === 'function') {
            onfail.call(form, rb);
          }
        }
      });

      xhr.addEventListener('progress', function(ev) {
        progress.max(ev.total);
        progress.val(ev.loaded);
      });

      xhr.open(form.method, form.action);
      xhr.send(data);
    });
  });
}
module.exports.initApiForm = initApiForm;

document.addEventListener('DOMContentLoaded', function() {
  initLabels();
  initApiForm();
});
