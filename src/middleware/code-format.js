/**
 * @file middleware format code
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const path = require('path');
const util = require('../util');
const typelog = require('typelog');

module.exports = function (opts = {}) {
  return async function (ctx, next) {
    try {
      await util.exeshell(
        path.resolve(__dirname, '../../node_modules/.bin', 'eslint'),
        [
          ctx.input.path,
          '--fix'
        ]
      );
    } catch(e) {
      typelog.warn('生成的文件有以上无法自动处理的 code style 问题，请手动解决。');
    }
    next();
  };
};
