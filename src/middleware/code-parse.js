/**
 * @file middleware parse code to ast
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const typelog = require('typelog');
const moment = require('moment');
const acorn = require('acorn-stage3');
const injectAcornObjectRestSpread = require('acorn-object-rest-spread/inject');
const injectAcornEs7 = require('acorn-es7');
const injectAcornStaticClassPropertyInitializer = require('acorn-static-class-property-initializer/inject');
injectAcornObjectRestSpread(acorn);
injectAcornEs7(acorn);
injectAcornStaticClassPropertyInitializer(acorn);

const astravel = require('astravel');
Object.assign(astravel.defaultTraveler, {
  FieldDefinition(node, state) {
    this.go(node.key, state);
    this.go(node.value, state);
  },
  ClassProperty(node, state) {
    this.go(node.key, state);
    this.go(node.value, state);
  }
});

// const escodegen = require('escodegen');

module.exports = function (opts = {}) {
  return async function (ctx, next) {
    const comments = [];
    const tokens = [];
    typelog.info(`[${moment().format('YYYY/MM/DD hh:mm:ss')}] CodeParse`);
    try {
      const ast = acorn.parse(ctx.input.content, Object.assign({
        ecmaVersion: 9,
        sourceType: 'module',
        locations: true,
        ranges: true,
        onComment: comments,
        onToken: tokens,
        plugins: {
          stage3: true,
          staticClassPropertyInitializer: true,
          objectRestSpread: true,
          es7: true
        }
      }, opts));

      astravel.attachComments(ast, comments);
      // escodegen.attachComments(ast, comments, tokens);
      ctx.input.ast = ast;
    } catch (e) {
      console.error(e);
    }
    next();
  };
};
