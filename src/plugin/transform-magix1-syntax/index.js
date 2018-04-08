/**
 * @file plugin transform module
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const estraverse = require('estraverse');

const rules = [
  require('./rule/global-magix'),
  require('./rule/magix-method-is')
];

module.exports = {
  name: 'transform-magix-syntax',
  visitor: {
    Program: {
      enter(tree) {
        rules.forEach(rule => {
          rule.pre && rule.pre();
          estraverse.replace(tree, {
            enter: rule.enter,
            leave: rule.leave
          });
        });
      }
    }
  }
};
