/**
 * @file estree 的比较
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const astring = require('astring');

const match = {
  isLikePath(node, path) {
    let sourcePath = astring.generate(node);
    const reg = new RegExp('^' + path.replace(/([\.\[\]])/g, '\\$1').replace(/\*/g, '.*') + '$', 'g');
    return reg.test(sourcePath);
  },

  /**
   * 是否是匹配指定path 的 某个属性或方法的引用
   *
   * 例如：
   * 对于 window.Magix 可以直接用 window.Magix, window.* 这样的 path 来匹配，这时候不关心这个 node 本身是 call 还是 reDeclaration
   *
   * @param {Node} node node
   * @param {string} path 匹配路径
   *
   * @return {boolean} 是否
   */
  isMemberReference(node, path) {
    if (node.type === 'MemberExpression') {
      if (!path) {
        return true;
      }
      return match.isLikePath(node, path);
    }
    return false;
  },

  /**
   * 是否是方法调用
   * 对于一种状况要单独判断：例如 window.Magix，先指定 a = window，再 call a.Magix() 是不能使用这个方法判断的
   * 建议是在之前的遍历中找到这样的 redeclaration，然后作为 path 传入指定判断
   *
   * @param {Node} node node
   * @param {string} path 匹配路径
   *
   * @return {boolean} 是否
   */
  isMethodCall(node, path) {
    if (node.type === 'CallExpression') {
      if (!path) {
        return true;
      }
      return match.isLikePath(node.callee, path);
    }
    return false;
  },

  /**
   * 对于一种状况要单独判断：例如 window.Magix，先指定 a = window，再 redeclaration a.Magix 是不能使用这个方法判断的
   * 建议是在之前的遍历中找到这样的 redeclaration，然后作为 path 传入指定判断
   *
   * @param {Node} node 节点
   * @param {string} path 匹配路径
   *
   * @return {boolean} 是否
   */
  isReDeclaration(node, path) {
    if (!path) {
      throw new Error('必须指定 path 来匹配');
    }
    switch (node.type) {
      case 'VariableDeclarator':
        return node.init && match.isLikePath(node.init, path);
      case 'AssignmentExpression':
        return match.isLikePath(node.expression.right);
      case 'Property':
        return match.isLikePath(node.value, path);
      case 'ArrayExpression':
        return node.elements && node.elements.some(el => match.isLikePath(el, path));
      case 'FieldDefinition':
        return match.isLikePath(node.value, path);
      default:
        return false;
    }
  }
};

module.exports = exports = match;
