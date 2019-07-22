/**
 * parses a string of a javascript RegExp to a RegExp object
 * @param {String|RegExp} val
 * @returns {RegExp}
 */
module.exports = function parseRegularExpression(val) {
  if(typeof val === 'object' && val !== null && val instanceof RegExp) {
    return val;
  } else if(typeof val === 'string' && Boolean(val)) {
    const regex = /^\/(.*?)\/([a-z]*?)$/gm;
    let m, pat, flg;
    while((m = regex.exec(val)) !== null) {
      if(m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      pat = m[1];
      flg = m[2];
    }
    return new RegExp(pat, flg);
  }
};