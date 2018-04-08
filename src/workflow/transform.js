/**
 * @file tranform
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const Workflow = require('k-core/Workflow');
const getFiles = require('../util/get-files');
const codeParse = require('../middleware/code-parse');
const codeTransform = require('../middleware/code-transform');
const codeGenerate = require('../middleware/code-generate');
const codeOutput = require('../middleware/code-output');
const codeFormat = require('../middleware/code-format');
const typelog = require('typelog');
const moment = require('moment');

module.exports = {
  process(options = {}) {
    const list = getFiles(options.src, options.pattern) || [];
    const main = new Workflow();

    main.use(async function (ctx, next) {
      const start = moment();
      typelog.info(`[${start.format('YYYY/MM/DD hh:mm:ss')}] Start Processing: ${ctx.input.path}`);
      await next();
      typelog.info(`[${moment().format('YYYY/MM/DD hh:mm:ss')}] Finish Processing: ${ctx.input.path}, after ${moment() - start} ms`);
    });

    main.use(codeParse(options.parseOpts));
    main.use(codeTransform(options.transOpts || {
      plugins: [
        require('../plugin/transform-kissy-module'),
        require('../plugin/transform-magix1-syntax')
      ]
    }));
    main.use(codeGenerate(options.generate));
    main.use(codeOutput(options.dist));
    main.use(codeFormat());
    // list.forEach(file => main.work(file));
    return Promise.all(list.map(file => main.work(file))).catch(e => {
      console.error(e);
    });
  }
};
