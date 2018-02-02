/**
 * @file simple file
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const fs = require('fs');

module.exports = class File {
  constructor(path, opts = {}) {
    this.path = path;
    this.encoding = opts.encoding || 'utf8';
    this.content = opts.content || '';
  }
  read() {
    this.content = fs.readFileSync(this.path, this.encoding);
  }

  write() {
    fs.writeFileSync(this.path, this.content, {
      encoding: this.encoding
    })
  }

  writeTo(path) {
    fs.writeFileSync(path, this.content, {
      encoding: this.encoding
    });
  }
}
