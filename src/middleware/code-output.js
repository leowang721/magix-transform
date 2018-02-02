/**
 * @file middleware output code
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

module.exports = function (opts = {}) {
  return async function (ctx, next) {
    ctx.input.write();
    next();
  };
}
