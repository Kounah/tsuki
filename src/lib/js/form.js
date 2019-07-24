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

    input.addEventListener('change', function() {
      if(this.getAttribute('validate')) {
        let valid = eval('(function() { return ' + input.getAttribute('validate') + ' }.bind(input))()');
        if(valid) {
          input.parentElement.classList.remove('invalid');
          input.parentElement.classList.add('valid');
        } else {
          input.parentElement.classList.add('invalid');
          input.parentElement.classList.remove('valid');
        }
      }
    });

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
 * @returns {[Boolean, Object]}
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

    if(i.getAttribute('validate')) {
      console.log(i.getAttribute('validate'));
      var valid = eval('(function(i) { return ' + i.getAttribute('validate') + ' }.bind(i))(i)');
      console.log(valid);
      if(!valid) {
        i.parentElement.classList.add('invalid');
        r[0] = false;
      } else {
        i.parentElement.classList.remove('invalid');
      }
    }

    if(k.endsWith('[]')) {
      k = k.substring(0, k.length - 2);
      if(typeof r[1][k] == 'object' && r[1][k] instanceof Array) {
        r[1][k].push(v);
      } else {
        r[1][k] = [v];
      }
    } else {
      r[1][k] = v;
    }

    return r;
  }, [true, {}]);
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

      var data = jsonFormData(form);
      var valid = data[0];
      data = data[1];

      if(!valid) return;

      xhr.open(form.method, form.action, true);
      xhr.withCredentials = true;

      if(form.getAttribute('enctype') === 'application/json') {
        data = JSON.stringify(data);
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
        console.log(this.getAllResponseHeaders());

        // content type
        var ct = this.getResponseHeader('Content-Type');

        // response body
        var rb;
        if(/^application\/json[;.*]/.test(ct)) {
          rb = JSON.parse(this.responseText);
        } else {
          rb = this.responseText;
        }

        console.log(rb);


        if(/^text\/html[;.*]/.test(ct)) {
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
          console.error(form.method.toUpperCase() + ' ' + form.action + ':\n', rb.message, '\n', rb);

          if(typeof onfail === 'function') {
            onfail.call(form, rb);
          }
        }
      });

      xhr.addEventListener('progress', function(ev) {
        progress.max(ev.total);
        progress.val(ev.loaded);
      });

      xhr.send(data);
    });
  });
}
module.exports.initApiForm = initApiForm;

document.addEventListener('DOMContentLoaded', function() {
  initLabels();
  initApiForm();

  document.querySelector('form[data-focus] input:not([hidden])').focus();
});
