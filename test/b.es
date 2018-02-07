import View from 'mxext/view';
import MM from 'app/common/models/modelmanager';
import 'css!components/table/index';

export default class datamap extends View {
  init(extra) {
    const me = this;
    me.cache = extra;
  }
  render() {
    const me = this;
    me.manage(MM.fetchOne({
      name: me.cache.model,
      postParams: me.cache.params
    }, m => {
      let map = m.get('list');
      const list = [];
      map = map[0] || {};
      for (const key in map) {
        let v = (map[key] || {}).value || '';
        v = S.unEscapeHTML(v);
        list.push({
          key,
          value: v,
          info: map[key].info
        });
      }
      me.vm.set({
        list
      });
      me.setViewPagelet(me.vm.toJSON());
    }));
  }
}
