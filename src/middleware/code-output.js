/**
 * @file middleware output code
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const typelog = require('typelog');
const moment = require('moment');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = function (dist) {
  return async function (ctx, next) {
    typelog.info(`[${moment().format('YYYY/MM/DD hh:mm:ss')}] CodeOutput`);
    if (dist) {
      const basename = path.basename(ctx.input.path);
      mkdirp.sync(dist);
      ctx.input.writeTo(path.resolve(dist, basename));
    } else {
      ctx.input.write();
    }
    next();
  };
};
