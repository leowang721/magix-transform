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

@connect(WelcomeDialogVM)
export default class WelcomeDialog extends View {

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

  init() {}

  bindEvents() {
    const tab = this.getComponent('tab');
    tab && tab.on('toggle.tab', (e) => {
      this.vm.switchTask(e.tab);
    });
  }
}
