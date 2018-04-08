/**
 * @file to support dispatched command
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const workflow = require('./workflow/transform');

workflow.process({
  src: '/Users/leowang/work/magix-transform/test/t.js',
  pattern: '*.+(js)',
  dist: '/Users/leowang/work/magix-transform/test1'
}).catch(e => {
  console.error(e);
});
