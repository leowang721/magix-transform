/**
 * @file format
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const moment = require('moment');
const Workflow = require('k-core/Workflow');
const getFiles = require('../util/get-files');
const codeFormat= require('../middleware/code-format');

module.exports = {
  process(options = {}) {
    const list = getFiles(options.src, options.pattern);
    const main = new Workflow();

    main.use(async (ctx, next) => {
      const start = moment();
      console.log(`process [${ctx.input.path}] at ${start.format()}`);
      await next();
      console.log(`finish ${ctx.input.path} after ${moment() - start} ms`);
    });

    main.use(codeFormat());
    list.forEach(file => main.work(file));
  }
};
