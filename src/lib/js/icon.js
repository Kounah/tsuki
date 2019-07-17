function make(key) {
  let icon = document.createElement('i');
  icon.classList.add('material-icons');
  icon.textContent = key;
  return icon;
}
module.exports.make = make;