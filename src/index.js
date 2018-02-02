/**
 * @file to support dispatched command
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const workflow = require('./workflow/format');

workflow.process({
  src: '/Users/leowang/work/magix-transform/test',
  pattern: '*.+(js|es)'
});
