/**
 * @file Magix.pathToObject 的语法修正
 *
 * @author Leo Wang(kemiao.wkm@alibaba-inc.com)
 */

// const typelog = require('typelog');
const match = require('../../../estree-util/match');

const rule = {
  pre() {
    this.hasCallee = false;
  },
  process: {
    enter(node) {
      if (match.isMethodCall(node, 'Magix.pathToObject')) {
        // mark
        this.hasCallee = true;
      }
      if (match.isReDeclaration(node, 'Magix.pathToObject')) {
        this.hasReDeclaration = true;
        this.reDeclaratedTo = node.left;
      }
    }
  }
};

module.exports = rule;
