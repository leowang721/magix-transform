/**
 * @file util
 *
 * @author Leo Wang(kemiao.wkm@alibaba-inc.com)
 */

const spawn = require('child_process').spawn;

module.exports = exports = {
  exeshell(command, args, opts = []) {
    const winCmd = process.env.comspec;
    const osCommand = winCmd || command;
    const osArgs = winCmd ? ['/c'].concat(command, args) : args;

    return new Promise((resolve, reject) => {
      const thread = spawn(
        osCommand,
        osArgs,
        Object.assign({
          stdio: 'inherit',
          cwd: process.cwd()
        }, opts)
      );

      thread.on('close', code => {
        if (code !== 0) {
          reject({ code });
        }
        resolve();
      })
    });
  }
};
