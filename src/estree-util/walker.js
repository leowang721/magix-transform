/**
 * @file estree 的各种 Get
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

const walker = {
  walking: false,
  enter() {
    if (!this.walking) {
      this.walking = true;
    }
  }
};

module.exports = exports = walker;
