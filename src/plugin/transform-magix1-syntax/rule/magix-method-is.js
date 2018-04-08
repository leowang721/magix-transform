/**
 * @file Magix.is* 的语法修正
 *
 * @author Leo Wang(kemiao.wkm@alibaba-inc.com)
 */

const typelog = require('typelog');
const match = require('../../../estree-util/match');

const rule = {
  process: {
    enter(node) {
      ['isArray', 'isFunction', 'isObject', 'isString', 'isNumber', 'isNumeric'].forEach(method => {
        if (match.isMethodCall(node, `Magix.${method}`) || match.isReDeclaration(node, `Magix.${method}`)) {
          // only alert, can't fix
          typelog.error(`发现调用 Magix.${method} at Line ${node.loc.start.line}, Column ${node.loc.start.column}，请自行修改。`);
        }
      });
    }
  }
};

module.exports = rule;
