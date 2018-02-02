KISSY.add("app/common/views/default", function (S, Node, View, VOM, Mu, Tryout, MM, Guider, NewGuider, Stage, Storage, Dialog, Alert) {
  var FirstUserGuider = '_alibaba_app_bp_fug_20130807';
  var Statistics = Magix.local('Statistics');
  var $ = Node.all;

  return View.extend({
      init: function () {
          var me = this;
    //hack
          me.fixLowerIE();
          me.showTdCode = me.location.pathname === '/home';
        me.showCalendar = me.location.pathname === '/home';
          me.observeClick = function (e) {
              var currentObj = S.one(e.target);
              var mdata;
              var nodename = currentObj.nodeName().toLowerCase();
              var num = 0;
              while (currentObj && !currentObj.attr('mdata') && nodename != 'body' && num < 5) {
                  currentObj = currentObj.parent();
                  if (currentObj) {
                      nodename = currentObj.nodeName().toLowerCase();
                      num++;
                  }
              }
              if (currentObj) {
                  mdata = currentObj.attr('mdata') || null;
                  if (mdata) {
                      Statistics.glog(mdata);
                  }
              }
          };
          me.on('destroy', function () {
              me.unfixLowerIE();
              S.one(window).detach('scroll', me.$scroll);
          });
          me.on('alter', function (e) {
              me.owner.fire('childrenAlter')
              var node = S.one('#right');
              if (node) {
                  node.css('height', node.outerHeight());
              }
              // var isPathnameChanged = 1;
              // if (Magix.Router) {
              //     var diff = Magix.Router.diff();
              //     var isPathname = diff.isPathname();
              //     isPathnameChanged = isPathname && isPathname.from && isPathname.to && isPathname.from !== isPathname.to;
              // }
              if (!e.cancelScroll && !Magix.Router) {
                  window.scrollTo(0, 0);
              }
              me.$pageReady = false;
          });
          me.on('created', function (e) {
              me.owner.fire('childrenCreated');

              var node = S.one('#right');
              if (node) {
                  node.css('height', 'auto');
              }
              me.$pageReady = true;
              console.log(e);
          });

          if (Magix.Router) {
              Magix.Router.on('changed', function(e) {
                  if (e.isPathname()) {
                      window.scrollTo(0, 0);
                  }
              });
          }

          me.$scroll = S.throttle(me.scroll, 30, me);
          S.one(window).on('scroll', me.$scroll);
      },
      /**
      * 兼容低版本的IE
      */
      fixLowerIE: function () {
          if (S.UA.ie < 8) {
              var zone = S.one(document.body);
              var focus = function (e) {
                  S.one(e.target).addClass('focus');
              };
              var blur = function (e) {
                  S.one(e.target).removeClass('focus');
              };

              zone.delegate('focusin', 'input,textarea', this.$ieFocus = focus);
              zone.delegate('focusout', 'input,textarea', this.$ieBlur = blur);
          }
      },
      unfixLowerIE: function () {
          if (S.UA.ie < 8) {
              var zone = S.one(document.body);
              zone.undelegate('focusin', 'input,textarea', this.$ieFocus);
              zone.undelegate('focusout', 'input,textarea', this.$ieBlur);
          }
      },
      render: function () {
          var me = this;
        var expandNav = Storage.getItem('GLOBAL_MENU_STATUS') != 'collapse';
          var renderUI = function () {
              me.showCalendar = me.showCalendar && !Storage.getItem('GLOBAL_SHOWCALENDAR') && (Tryout.TRYOUT_SID_172 || Tryout.TRYOUT_SID_177);
              Magix.local('GLOBAL_SHOWCALENDAR', me.showCalendar);
              if (!Storage.getItem('GLOBAL_SHOWCALENDAR')) {
                  Storage.setItem('GLOBAL_SHOWCALENDAR', 1);
              }
              me.setViewPagelet({
                  staticFilePrefix: Magix.config().appHome,
                expandNav: expandNav,
                showCalendar: me.showCalendar,
                  showCalendarBanner: Tryout.TRYOUT_SID_172 || Tryout.TRYOUT_SID_177
              });
              me.mountMainFrame();
          };

          me.fetchTryout()
          .then(function() {
              return Stage.fetchCalendarConfig();
          })
          .then(function() {
              me.getGuideInfos();
              renderUI();
          });

          /*
          1.加载当前页面用到的brix css
          2.加载当前页面用到的项目中组件的css
          3.加载当前页面的page css
          4.加载all brix css
          5.加载all coms css
          6.加载当前app page-all css

          后面的覆盖前面的
          */
      },
      fetchTryout: function() {
          var me = this;
          var defer = S.Defer();
          var promise = defer.promise;
          var r = MM.fetchAll([
              {
                  name: 'Auth_Tryout'
              }
          ], function (m, e) {
              if (!e || !e[0]) {
                  Tryout.update(m.get('list'));
              }
              defer.resolve();
          });
          me.manage(r);
          return promise;
      },
      getGuideInfos: function() {
          var me = this;
          var defer = S.Defer();
          var promise = defer.promise;

          if (NewGuider.map) {
              defer.resolve();
              return promise;
          }

          if (me.guideInfosLoading) {
              me.guideInfosTimer = setTimeout(function() {
                  clearTimeout(me.guideInfosTimer);
                  if (NewGuider.map) {
                      me.guideInfosLoading = me.guideInfosTimer = null;
                      return defer.resolve();
                  }
                  me.guideInfosTimer = setTimeout(arguments.callee, 25);
              }, 25);
              return promise;
          }

          me.guideInfosLoading = true;
          var request = MM.fetchAll({
              name: 'message/getGuideInfos'
          }, function(model) {
              NewGuider.update(model.get('list') || []);
              me.guideInfosLoading = null;
              defer.resolve();
          });

          me.manage(request);
          me.manage(defer);

          return promise;
      },
      mountMainFrame: function () {
          var me = this;
          var loc = me.location;
          var pathname = loc.pathname;
          var vframe = VOM.get('magix_vf_main');
          if (vframe) {
              var pns = pathname.split('/');
              pns.shift();
              var folder = pns.shift() || 'home';
              var view = pns.join('/') || 'index';
              if (S.endsWith(view, '/')) {
                  view += 'index';
              }
              var CSSLoader = Magix.local('CSSLoader');
              var viewPath = 'app/' + folder + '/views/' + view;

              // 更新viewPath
              if (me.showCalendar) {
                  viewPath = 'app/marketing-calendar/views/index';
              }

              clearTimeout(me.vframeCreatedTimer);
              if (me.vframeCreatedListener) {
                  vframe.un('created', me.vframeCreatedListener);
              }
              vframe.on('created', me.vframeCreatedListener = function () {
                  if (CSSLoader) {
                      Statistics.send();
                      setTimeout(function () {
                          CSSLoader.lazyload(function () {
                              CSSLoader.fetch(appCSS);
                          });
                      }, 0);
                  }

                  /**
                   * 监听所有view，包括手动mount的view渲染完成的方法
                   */
                  var i, j, vfs;
                  me.vframeCreatedTimer = setTimeout(function() {
                      vfs = vframe.owner.all();
                      i = S.keys(vfs).length;
                      j = 0;
                      S.each(vfs, function(vf) {
                          if (!vf || !vf.view || !vf.view.rendered) {
                              return false;
                          }
                          j++;
                      });

                      clearTimeout(me.vframeCreatedTimer);
                      if (i !== j) {
                          me.vframeCreatedTimer = setTimeout(arguments.callee, 25);
                      } else {
                          me.getGuideInfos()
                          .then(function() {
                              // TODO me.location.pathname 定位当前path路径
                              NewGuider.mountGuider(me.location.pathname);
                              VOM.fire('pagerendered', {
                                  target: me
                              });
                          });
                      }
                  }, 25);
              }, true);
              if (CSSLoader) {
                  var appCSS = 'app/' + folder + '/assets/css/all';
                  if (CSSLoader.isComplete()) {
                      CSSLoader.fetch(appCSS, function () {
                          vframe.mountView(viewPath);
                      });
                  } else {
                      vframe.mountView(viewPath);
                  }
              } else {
                  vframe.mountView(viewPath);
              }
          }
      },
      locationChange: function (e) {
          var me = this;
          if (e.changed.isPathname()) {
              if (me.$displayGuider) {
                  Guider.destroyGuider();
                  delete me.$displayGuider;
              }
              NewGuider.destroy();
              me.mountMainFrame();
              Dialog.hide();
              e.toChildren('magix_vf_menus,magix_vf_col-menus,magix_vf_header,magix_vf_surveys');
          } else {
              Statistics.send();
          }
      },
      showGuider: function (path) {
          var me = this;
          var loc = me.location;
          var pn = loc.pathname;
          var resume = function () {
              if (pn == me.location.pathname) {
                  if (me.$displayGuider) {
                      Guider.destroyGuider();
                  }
                  me.$displayGuider = true;
                  Guider.showGuider(path);
              }
          };
          if (me.$pageReady) {
              resume();
          } else {
              me.on('created', resume, true);
          }
      },
      showHomeFirstGuider: function () {
          if (!Storage.getItem(FirstUserGuider)) {
              this.showGuider('/home/first');
              Guider.on('close', function (e) {
                  Storage.setItem(FirstUserGuider, 'true');
              }, true);
          }
      },
      receiveMessage: function (e) {
          if (e.action == 'showGuider') {
              this.showGuider();
          } else if (e.action == 'showHomeFirstGuider') {
              this.showHomeFirstGuider();
          }
      },
      scroll: function () {
          var me = this;
          var vm = me.vm;
          var top = S.DOM.scrollTop();

          if (me.$showToTop && top <= 20) {
              me.$showToTop = false;

              vm.set({
                  showTopIcon: false
              })
          } else if (!me.$showToTop && top >= 20) {
              me.$showToTop = true;

              vm.set({
                  showTopIcon: true
              })
          }

          me.setViewPagelet(vm.toJSON());
      },
      isShowCalendar: function() {
          return this.showCalendar;
      },
    toggleCalendar: function (view) {
      var me = view || this;
      me.showCalendar = !me.showCalendar;
          Magix.local('GLOBAL_SHOWCALENDAR', me.showCalendar);
          // TODO hack 4 ie8
          if (S.UA.ie <= 8) {
              me.setViewHTML(Mu.render(me.template, {
                  staticFilePrefix: Magix.config().appHome,
                  showCalendar: me.showCalendar,
                  showCalendarBanner: Tryout.TRYOUT_SID_172 || Tryout.TRYOUT_SID_177
              }));
          } else {
              me.setViewPagelet({
                  showCalendar: me.showCalendar
              });
          }
      me.mountMainFrame();
    },
      events: {
          click: {
              toTop: function (e) {
                  var me = e.view;
                  var vm = me.vm;
                  S.DOM.scrollTop(0);

                  vm.set({
                      showTopIcon: false
                  })

                  me.setViewPagelet(vm.toJSON());
              },
              toggleWanxiang: function (e) {
                  VOM.get('magix_vf_header').view.toggleWanxiang();
              },
            toggleCalendar: function (e) {
              var me = e.view;
              me.toggleCalendar(me);
              }
          }
          // mouseenter: {
          //     showIconTip: function (e) {
          //         var me = e.view;toggleWanxiang
          //         var type = e.params.type
          //         var vm = me.vm;

          //         vm.set('show' + type + 'Tip', true);

          //         me.setViewPagelet(vm.toJSON());
          //     }
          // },
          // mouseleave: {
          //     hideIconTip: function (e) {
          //         var me = e.view;
          //         var type = e.params.type
          //         var vm = me.vm;

          //         vm.set('show' + type + 'Tip', false);

          //         me.setViewPagelet(vm.toJSON());
          //     }
          // }
      }
  });
}, {
  requires: [
      'node',
      'mxext/view',
      'magix/vom',
      'brix/gallery/mu/index',
      'app/common/helpers/tryout',
      'app/common/models/modelmanager',
      'app/common/views/guiders/guider',
      'app/common/views/guiders/new-guider',
      'app/marketing-calendar/helpers/stage',
      'gallery/local-storage/1.0/index',
      "components/dialog/util",
      'components/alert/index',
      'app/guide/views/newbie-guide/interface/entry'
  ]
});
