/**
 * @file 站点欢迎页浮层
 *
 * @author Leo Wang(keimiao.wkm@alibaba-inc.com)
 */

import { connect } from 'common/connect';
import View from 'mxext/view';
import WelcomeDialogVM from './dialog-vm';
import eventBus from '../../eventBus';

import 'css!app/guide/assets/css/index.css';
import aaa from './aaa';

/**
 * @class WelcomeDialog
 */
@connect(WelcomeDialogVM)
@aaa
class WelcomeDialog extends View {

  static a = 1;
  static b() {
    console.log('hi');
  }

  events = {
    click: {
      doTask(e) {
        e.view.vm.get('currentTask').execute()
          .then(() => {
            e.view.vm.dispatch(e.view.vm.ACTION.NEXT_TASK);
          });
      },
      switchStory(e) {
        e.view.vm.switchStory(e.params.id);
      }
    }
  };

  get name() {
    return 'Leo';
  }

  // @log('set name')
  set name(v) {
    console.error('not changable.');
  }

  // @asyncMethod
  async init(...args) {
    console.log(...args);
    const [a, b] = args;
    console.log(a, b);
    const {name} = a;
    console.log(name);
  }

  // @log('event bind')
  bindEvents() {
    const tab = this.getComponent('tab');
    tab && tab.on('toggle.tab', e => {
      this.vm.switchTask(e.tab);
    });
  }
}

export default WelcomeDialog;
