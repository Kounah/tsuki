const os = require('os');
const fs = require('fs');
const path = require('path');
// eslint-disable-next-line no-unused-vars
const express = require('express');
const mime = require('mime');
const sass = require('node-sass');
const shell = require('shelljs');
const webmake = require('webmake');
const error = require('../lib/error');

/**
 * @param {express.Application} app
 */
module.exports = function router(app) {
  app.get('/src/*', error.handler, (req, res) => {
    let relp = path.relative('/src/', req.path);
    let p = path.join(__dirname, '../../src/', relp);

    let cache = path.join(os.tmpdir(), 'tsuki', 'cache');

    let compile = typeof req.query.compile !== 'undefined';
    let nocache = typeof req.query.nocache !== 'undefined';

    if(fs.existsSync(p)) {
      let type = mime.getType(p);

      let cached = path.join(cache, relp);

      //#region text/x-scss
      if(type == 'text/x-scss') {
        if(compile) {
          cached = path.join(cache, relp + '.css');

          if(!fs.existsSync(cached) || fs.statSync(p).atime > fs.statSync(cached).atime || nocache) {
            // actual compilation of the sass is needed

            let result = sass.renderSync({
              file: p
            });

            if(nocache) {
              res.set('Content-Type', 'text/css').send(result.css);
            } else {
              if(!fs.existsSync(path.parse(cached).dir))
                shell.mkdir('-p', path.parse(cached).dir);
              fs.writeFileSync(cached, result.css.toString('utf-8'));
              res.set('Content-Type', mime.getType(cached)).sendFile(cached);
            }
          } else {
            // sending cached file is ok if it exists
            res.set('Content-Type', mime.getType(cached)).sendFile(cached);
          }
        } else {
          res.set('Content-Type', mime.getType(p)).sendFile(p);
        }
        return;
      }
      //#endregion

      //#region application/javascript
      if(type == 'application/javascript') {
        if(compile) {
          cached = path.join(cache, relp + '.bundle.js');

          if(!fs.existsSync(cached) || fs.statSync(p).atime > fs.statSync(cached).atime || nocache) {
            // compilation of the javascript

            webmake(p, {
              sourceMap: true,
              cache: false
            }, function(err, content) {
              if(err) {
                console.error(err);
                throw error;
              }

              console.log(content);
              if(nocache) {
                res.set('Content-Type', 'application/javascript').end(content);
              } else {
                if(!fs.existsSync(path.parse(cached).dir))
                  shell.mkdir('-p', path.parse(cached).dir);
                fs.writeFileSync(cached, content);
                res.set('Content-Type', mime.getType(cached)).sendFile(cached);
              }
            });
          } else {
            res.set('Content-Type', mime.getType(cached)).sendfile(cached);
          }
        } else {
          res.set('Content-Type', mime.getType(p)).sendFile(p);
        }
        return;
      }
      //#endregion

      if(!fs.existsSync(cached) || fs.statSync(p).atime > fs.statSync(cached) || nocache) {
        let buf = fs.readFileSync(p);

        if(nocache) {
          res.set('Content-Type', mime.getType(p)).send(buf);
        } else {
          if(!fs.existsSync(path.parse(cached).dir))
            shell.mkdir('-p', path.parse(cached).dir);
          fs.writeFileSync(cached, buf.toString('utf-8'));
          res.set('Content-Type', mime.getType(cached)).send(buf);
        }
      } else {
        res.set('Content-Type', mime.getType(cached)).sendFile(cached);
      }
    }
  });
};