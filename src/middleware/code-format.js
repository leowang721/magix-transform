/**
 * @file middleware format code
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const typelog = require('typelog');
const moment = require('moment');
const path = require('path');
const util = require('../util');

module.exports = function (opts = {}) {
  return async function (ctx, next) {
    typelog.info(`[${moment().format('YYYY/MM/DD hh:mm:ss')}] CodeFormat`);
    try {
      await util.exeshell(
        path.resolve(__dirname, '../../node_modules/.bin', 'eslint'),
        [
          ctx.input.path,
          '--fix'
        ]
      );
    } catch (e) {
      typelog.warn('生成的文件有以上无法自动处理的 code style 问题，请手动解决。');
    }
    next();
  };
};
