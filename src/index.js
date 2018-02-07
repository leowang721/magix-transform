/**
 * @file to support dispatched command
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const workflow = require('./workflow/transform');

workflow.process({
  src: '/Users/leowang/work/magix-transform/test/d.es',
  pattern: '*.+(js|es)',
  dist: '/Users/leowang/work/magix-transform/test1'
});
