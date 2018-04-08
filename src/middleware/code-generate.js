/**
 * @file middleware generate code from ast
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const typelog = require('typelog');
const moment = require('moment');
const astring = require('astring');
// const escodegen = require('escodegen');

const customGenerator = Object.assign({}, astring.baseGenerator, {
  FieldDefinition(node, state) {
    this[node.key.type](node.key, state);
    state.write(' = ');
    this[node.value.type](node.value, state);
  },
  ClassProperty(node, state) {
    state.write('static ');
    this[node.key.type](node.key, state);
    state.write(' = ');
    this[node.value.type](node.value, state);
    state.write(';');
  },
  ClassDeclaration(node, state) {
    if (node.decorators) {
      // write expression
      node.decorators.forEach(decorator => {
        state.write('@');
        this[decorator.expression.type](decorator.expression, state);
        state.write(state.lineEnd);
      });
    }
    astring.baseGenerator.ClassDeclaration.call(this, node, state);
  }
});

module.exports = function (opts = {}) {
  return async function (ctx, next) {
    typelog.info(`[${moment().format('YYYY/MM/DD hh:mm:ss')}] CodeGenerate`);
    try {
      ctx.input.content = astring.generate(ctx.input.ast, {
        generator: customGenerator,
        indent: '  ',
        lineEnd: '\n',
        comments: true
      });
      // ctx.input.content = escodegen.generate(ctx.input.ast, {
      //   format: {
      //     indent: {
      //       style: '  ',
      //       adjustMultilineComment: false
      //     }
      //   },
      //   comment: true,
      //   parse: acorn.parse
      // });
    } catch (e) {
      console.error(e);
    }
    next();
  };
};
