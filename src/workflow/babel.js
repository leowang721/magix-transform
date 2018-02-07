const path = require('path');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const generate = require('babel-generator').default;
const mkdirp = require('mkdirp');

const getFiles = require('../util/get-files');

module.exports = {
  process(options = {}) {
    const list = getFiles(options.src, options.pattern);
    list.forEach(file => {
      const ast = babylon.parse(file.content, {
        sourceType: 'module',
        ranges: true,
        tokens: true,
        plugins: [
          'decorators',
          'classProperties'
        ]
      });

      traverse(ast, {
        enter(path) {
          console.log(path);
        }
      });

      file.content = generate(ast, {
        comments: true,
        compact: false,
        retainLines: true
      }, file.content).code;

      const basename = path.basename(file.path);
      mkdirp.sync(options.dist);
      file.writeTo(path.resolve(options.dist, basename));
    });
  }
};
