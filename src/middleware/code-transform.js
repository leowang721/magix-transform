/**
 * @file middleware transform code
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const typelog = require('typelog');
const moment = require('moment');
// const astravel = require('astravel');
const estraverse = require('estraverse');

module.exports = function (opts = {}) {
  const plugins = opts.plugins || [];

  return async function (ctx, next) {
    typelog.info(`[${moment().format('YYYY/MM/DD hh:mm:ss')}] CodeTransform`);
    plugins.forEach(plugin => {
      typelog.info(`[${moment().format('YYYY/MM/DD hh:mm:ss')}] Patching plugin: ${plugin.name}`);
      plugin.pre && plugin.pre();
      try {
        estraverse.traverse(ctx.input.ast, {
          enter(node) {
            const visitor = plugin.visitor[node.type];
            if (!visitor) {
              this.skip();
              return;
            }
            const toExecute = typeof visitor === 'function' ? visitor : visitor.enter;
            if (toExecute) {
              toExecute(node);
            }
          },
          leave(node) {
            const visitor = plugin.visitor[node.type];
            if (!visitor) {
              this.skip();
              return;
            }
            if (visitor.leave) {
              visitor.leave(node);
            }
          },
          fallback(node) {
            return node;
          }
        });
      } catch (e) {
        console.error(e);
      }
    });
    next();
  };
};
