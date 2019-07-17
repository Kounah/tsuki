/**
 * @param {HTMLDivElement} progress the .progress element
 * @param {Object} options the options
 * @param {Number} options.min min value of the progress bar
 * @param {Number} options.max max value of the progress bar
 * @param {Number} options.val value of the progress bar
 * @param {Number} options.step the value that val is increased by when calling step()
 * @param {Boolean} options.indeterminate is the progress bar indeterminate
 * @param {Boolean} options.running is the progress bar running
 */
function Progress(progress, options) {
  console.log(arguments);

  /**@type {HTMLDivElement} */
  var inner;
  if(!progress.classList.contains('.progress')) {
    inner = progress.querySelector('.inner');
    if(!inner) {
      inner = document.createElement('div');
      inner.classList.add('.inner');
      progress.appendChild(inner);
    }
  }

  this._progress = progress;
  this._inner = inner;

  this._min = 0;
  this._max = 100;
  this._val = 0;
  this._step = 1;
  this._indeterminate = false;
  this._running = true;

  if(typeof options === 'object') {
    this._min = options.min || this._min;
    this._max = options.max || this._max;
    this._val = options.val || this._val;
    this._step = options.step || this._step;
    this._indeterminate = options.indeterminate || this._indeterminate;
    this._running = typeof options.running == 'boolean' ? options.running : this._running;
  }

  function percent() {
    return ((this._val - this._min) / (this._max - this._min)) * 100;
  }
  this.percent = percent.bind(this);

  function update() {
    if(this._running) {
      this._progress.classList.add('shown');
      if(this._indeterminate) {
        this._progress.classList.add('indeterminate');
        this._inner.style.width = '100%';
      } else {
        this._progress.classList.remove('indeterminate');
        this._inner.style.width = this.percent() + '%';
      }
    } else {
      this._progress.classList.remove('shown');
    }
  }
  this.update = update.bind(this);

  /**
   * get/set this._min
   * @param {Number} v value
   */
  function min(v) {
    if(typeof v == 'number') {
      this._min = v;
      this.update();
      return this;
    } else {
      return this._min;
    }
  }
  this.min = min.bind(this);

  /**
   * get/set this._max
   * @param {Number} v value
   */
  function max(v) {
    if(typeof v == 'number') {
      this._max = v;
      this.update();
      return this;
    } else {
      return this._max;
    }
  }
  this.max = max.bind(this);

  /**
   * get/set this._val
   * @param {Number} v value
   */
  function val(v) {
    if(typeof v == 'number') {
      this._val = v;
      this.update();
      return this;
    } else {
      return this._val;
    }
  }
  this.val = val.bind(this);

  /**
   * get/set this._indeterminate
   * @param {Boolean} v value
   */
  function indeterminate(v) {
    if(typeof v == 'boolean') {
      this._indeterminate = v;
      this.update();
      return this;
    } else {
      return this._indeterminate;
    }
  }
  this.indeterminate = indeterminate.bind(this);

  function step() {
    this.val(this.val() + this._step);
  }
  this.step = step.bind(this);

  function start() {
    this._running = true;
    this.update();
  }
  this.start = start.bind(this);

  function stop() {
    this._running = false;
    this.update();
  }
  this.stop = stop.bind(this);

  this.update();
}

module.exports = Progress;