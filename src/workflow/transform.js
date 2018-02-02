/**
 * @file tranform
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const moment = require('moment');
const Workflow = require('k-core/Workflow');
const getFiles = require('../util/get-files');
const codeParse = require('../middleware/code-parse');
const codeTransform = require('../middleware/code-transform');
const codeGenerate= require('../middleware/code-generate');
const codeOutput= require('../middleware/code-output');
const codeFormat= require('../middleware/code-format');

module.exports = {
  process(options = {}) {
    const list = getFiles(options.src, options.pattern);
    console.log(list.map(i => i.path));
    const main = new Workflow();

    main.use(async function (ctx, next) {
      const start = moment();
      console.log(`process [${ctx.input.path}] at ${start.format()}`);
      await next();
      console.log(`finish ${ctx.input.path} after ${moment() - start} ms`);
    });

    main.use(codeParse(options.parseOpts));
    main.use(codeTransform(options.transOpts || {
      plugins: [require('../plugin/transform-kissy-module')]
    }));
    main.use(codeGenerate(options.dist));
    main.use(codeOutput());
    main.use(codeFormat());
    list.forEach(file => main.work(file));
  }
};
