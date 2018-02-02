/**
 * @file middleware generate code from ast
 *
 * @author Leo Wang(leowang721@gmail.com)
 */


const astring = require('astring');
// const escodegen = require('escodegen');

const customGenerator = Object.assign({}, astring.baseGenerator, {
  FieldDefinition(node, state) {
    this[node.key.type](node.key, state);
    state.write(' = ');
    this[node.value.type](node.value, state);
  }
});

module.exports = function (opts = {}) {
  return async function (ctx, next) {
    try {
      ctx.input.content = astring.generate(ctx.input.ast, Object.assign({
        generator: customGenerator,
        indent: '  ',
        lineEnd: '\n',
        comments: true
      }, opts));
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
}
