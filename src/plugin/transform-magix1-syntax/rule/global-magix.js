/**
 * @file 全局引用 Magix 的语法修正，主要是
 *  1. 去除 window.Magix 的 window.
 *  2. 如果引用了 Magix，但未引入模块，增加此模块的引用
 *  3. 尝试修改 a = window 然后 a.Magix 的引用
 *
 * @author Leo Wang(kemiao.wkm@alibaba-inc.com)
 */

const typelog = require('typelog');
const match = require('../../../estree-util/match');

const MODULE_SOURCE = {
  Magix: 'magix'
};

const DATA = {
  toAddModules: [],
  windowRedeclaration: []
};

const rule = {
  pre() {
    DATA.toAddModules.length = 0;
    DATA.windowRedeclaration.length = 0;
  },
  enter(node) {
    // 去掉 window.Magix 的 window. 前缀，并处理对应的 Module 引入
    if (match.isMemberReference(node, 'window.Magix')) {
      if (!DATA.toAddModules.includes('Magix')) {
        DATA.toAddModules.push('Magix');
      }
      return {
        type: 'Identifier',
        name: 'Magix'
      };
    } else if (node.type === 'Identifier' && node.name === 'Magix') {
      if (!DATA.toAddModules.includes('Magix')) {
        DATA.toAddModules.push('Magix');
      }
    } else if (match.isMemberReference(node, '*.Magix')) {
      // only alert, can't fix
      typelog.warn(`发现调用 *.Magix at Line ${node.loc.start.line}, Column ${node.loc.start.column}，如果是 Magix 的别名请自行修改。`);
    }
  },
  leave(node) {
    if (node.type === 'Program') {
      // 添加 Module
      DATA.toAddModules.forEach(mod => {
        if (node.body.some(item => item.type === 'ImportDeclaration' && item.source.value === MODULE_SOURCE[mod] && item.specifiers.some(sp => sp.type === 'ImportDefaultSpecifier' && sp.local.name === mod))) {
          return;
        }
        node.body.unshift({
          type: 'ImportDeclaration',
          specifiers: [
            {
              type: 'ImportDefaultSpecifier',
              local: {
                type: 'Identifier',
                name: mod
              }
            }
          ],
          source: {
            type: 'Literal',
            value: MODULE_SOURCE[mod],
            raw: `'${MODULE_SOURCE[mod]}'`
          }
        });
      });
    }
  }
};

module.exports = rule;
