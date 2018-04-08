/**
 * @file get all files recursively from target path
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const fs = require('fs');
const path = require('path');
const minimatch = require('minimatch');
const readdir = require('fs-readdir-recursive');
const File = require('./file');

/**
 * get all files recursively from target path
 *
 * @param {string} target target path
 * @param {string} pattern minimatch pattern
 * @return {Promise} files array
 */
module.exports = function getFiles(target, pattern) {
  if (!fs.existsSync(target)) {
    return;
  }
  const stat = fs.statSync(target);
  let result = stat.isDirectory()
    ? readdir(target).map(file => path.join(target, file))
    : [target];
  return result.filter(minimatch.filter(pattern, { matchBase: true })).map(item => {
    const file = new File(item);
    file.read();
    return file;
  });
};
