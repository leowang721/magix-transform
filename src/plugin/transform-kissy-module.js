/**
 * @file plugin transform module
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const estraverse = require('estraverse');
const typelog = require('typelog');

let toProcessModule = null;

function isKissyAdd(statement) {
  if (statement.type === 'ExpressionStatement' && statement.expression.type === 'CallExpression') {
    const callee = statement.expression.callee;
    return (
      callee.type === 'MemberExpression'
      // KISSY
      && (callee.object.type === 'Identifier' && callee.object.name === 'KISSY')
      // .add
      && (callee.property.type === 'Identifier' && callee.property.name === 'add')
    );
  }
}

function processKissAdd(statement) {
  if (isKissyAdd(statement)) {
    const args = statement.expression.arguments;
    if (args && args[0].type === 'Literal' && args[1].type === 'FunctionExpression') {
      // for factory
      const moduleName = args[0].value;
      const factory = args[1];
      const requires = args[2] && args[2].properties.find(item => item.key.name === 'requires');
      const cssRequires = args[2] && args[2].properties.find(item => item.key.name === 'cssRequires');

      toProcessModule = {
        moduleName,
        factory, // factory.params
        requires: requires && requires.value,
        cssRequires: cssRequires && cssRequires.value
      };
    }
  }
}

module.exports = {
  pre() {
    toProcessModule = null;
    typelog.info('here preparing');
  },
  visitor: {
    Program: {
      enter(node) {
        if (node.body.length === 1) {
          processKissAdd(node.body[0]);
        } else {
          console.error('当前处理文件包含多条语句');
        }
      },
      leave(node) {
        // 添加 import 语句
        if (toProcessModule) {
          const vars = toProcessModule.factory.params.slice(1).map(item => item.name); // 去掉第一个 KISSY 的生命
          const paths = toProcessModule.requires.elements.map(item => item.value);
          // 空行
          node.body.unshift({
            type: 'Literal',
            value: '',
            raw: ''
          });
          node.body.unshift(...paths.map((path, index) => {
            const importExpression = {
              type: 'ImportDeclaration',
              specifiers: [],
              source: {
                type: 'Literal',
                value: path,
                raw: `'${path}'`
              }
            };
            if (vars[index]) {
              importExpression.specifiers.push(
                {
                  type: 'ImportDefaultSpecifier',
                  local: {
                    type: 'Identifier',
                    name: vars[index]
                  }
                }
              )
            }
            return importExpression;
          }));

          // 替换body最后一个节点为 factory 的 body 内容
          // 但要先替换 return 为 export default
          const factoryBody = toProcessModule.factory.body.body; // BlockStatement 的 body，数组
          const toAddStatement = factoryBody.map(statement => {
            if (statement.type === 'ReturnStatement') {
              return {
                type: 'ExportDefaultDeclaration',
                declaration: statement.argument
              }
            }
            return statement;
          });
          node.body.splice(node.body.length - 1, 1, ...toAddStatement);
        }
      }
    },
    ExpressionStatement: {
      enter(node) {},
      leave(node) {
        // console.log('leave ExpressionStatement');
      }
    }
  }
}
