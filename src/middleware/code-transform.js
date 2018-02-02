/**
 * @file middleware transform code
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

// const astravel = require('astravel');
const estraverse = require('estraverse');

module.exports = function (opts = {}) {
  const plugins = opts.plugins || [];
  const processed = {};
  // plugins.forEach(pl => {
  //   pl.pre && pl.pre();
  //   Object.keys(pl.visitor).forEach(key => {
  //     processed[key] = processed[key] || {
  //       enter: [],
  //       leave: []
  //     };
  //     if (typeof pl.visitor[key] === 'function') {
  //       processed[key].enter.push(pl.visitor[key]);
  //     } else {
  //       processed[key].enter.push(pl.visitor[key].enter);
  //       processed[key].leave.push(pl.visitor[key].leave);
  //     }
  //   });
  // });

  return async function (ctx, next) {
    plugins.forEach(plugin => {
      plugin.pre && plugin.pre();
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
          const toExecute = typeof visitor === 'function' ? null : visitor.leave;
          if (toExecute) {
            toExecute(node);
          }
        },
        fallback(node) {
          return node;
        }
      });
    });
    next();
  };
}
