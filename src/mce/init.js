/* eslint-disable no-unused-vars */
window.mce = {};

/**
 * creates the form that is used to create the project
 * @param {Object} options
 * @param {({name: String, grid: {width: Number, layers: Number, height: Number}}) => void} options.created
 */
function gen_CreateProjectForm(options) {
  var form = document.createElement('form');
  var name = document.createElement('input');
  var x = document.createElement('input');
  var y = document.createElement('input');
  var z = document.createElement('input');

  name.type = 'text';
  name.name = 'project_name';

  [ [x, 'grid_width'],
    [y, 'grid_layers'],
    [y, 'grid_height']
  ].forEach(function(item) {
    item[0].name = item[1];
  });

  [x, y, z].forEach(function(el) {
    el.type = 'number';
  });

  [name, x, y, z].forEach(function(el) {
    form.appendChild(el);
  });


  form.addEventListener('submit', function(ev) {
    ev.preventDefault();

    /**@type {Object} */
    let rawData = Array.from((new FormData(this)).entries()).reduce(function(p, c) {
      p[c[0]] = c[1];
    }, {});

    if(typeof options === 'object' && options !== null) {

      if(typeof options.created === 'function') {
        options.created({
          name: rawData['name'],
          grid: {
            width:  rawData['grid_width'],
            layers: rawData['grid_layers'],
            height: rawData['grid_height']
          }
        });
      }

    }
  });

  return form;
}

/**
 * Generates the editor div
 * @param {Object} data
 * @param {String} data.name
 * @param {Object} data.grid
 * @param {Number} data.grid.width
 * @param {Number} data.grid.layers
 * @param {Number} data.grid.height
 * @param {Object} options additional options
 */
function gen_Editor(data, options) {

}

/**
 * generates the material selector
 * @param {Object} options additional options
 */
function gen_MaterialSelector(options) {
  var list = document.createElement('ul');

  load_materials(function(materials) {
    window.mce.materials = materials;

    materials.map(function(material) {
      var item = document.createElement('li');
      item.classList.add('material-item');
      item.title = [
        material.name,
        '='.repeat(material.name.length),
        '',
        material.description,
        '',
        'itemId: ' + material.itemId
      ].join('\n');

      item.addEventListener('click', function(ev) {
        Array.prototype.slice.call(list.querySelectorAll('.material-item.selected')).forEach(function(el) {
          el.classList.remove('selected');
        });
      });

      var name = document.createElement('span');
      name.classList.add('name');
      name.textContent = material.name;

      var iconBlob = new Blob([
        material.icon.data
      ], {
        type: material.icon.mime
      });

      var icon = document.createElement('img');
      icon.classList.add('icon');
      icon.src = URL.createObjectURL(iconBlob);
      icon.style.backgroundColor = material.color;

      item.append(icon);
      item.append(name);

      return item;
    }).forEach(function(item) {
      list.append(item);
    });
  });
}

/**
 * @typedef {Object} Material
 * @prop {String} name
 * @prop {String} description
 * @prop {String} itemId
 * @prop {String} color
 * @prop {Object} icon
 * @prop {String} icon.data
 * @prop {String} icon.mime
 * @prop {String} _id
 */

/**
 * loads the materials saved on the server
 * @param {(materials: Array.<Material>) => void} cb
 * @param {Object} options additional options
 */
function load_materials(cb, options) {
  if(typeof cb !== 'function')
    throw new TypeError('\'cb\' is not a function');

  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/v1/mce/material', true);

  xhr.addEventListener('load', function(ev) {
    if(!/^[\s]*?application\/json.*?$/gm.test(this.getResponseHeader('Content-Type'))) {
      var resp = JSON.parse(this.responseText);

      cb(resp.data);
    } else throw new Error('The Response Content-Type was not application/json');
  });

  xhr.send();
}

module.exports.execute = function execute() {
  var app = document.getElementById('app');

  var createProjectForm = gen_CreateProjectForm({
    created: function(data) {
      gen_Editor(data);
    }
  });
};