(function (win, S, EMPTY, NULL) {
  var Site = (function () {
    var scripts = document.getElementsByTagName('script');
    var script = scripts[scripts.length - 1];
    var src = script.getAttribute('src');
    var base = src.replace(/\/?app\/(?:.+?)$/g, '/');
    var tag = /^[^=]+=(.+)$/.exec(src);
    base = /(?:https?:)?\/\//g.test(base) ? base : [
      window.location.origin,
      base === '/' ? EMPTY : base
    ].join('/');
    return {
      base: base,
      // 本地开发模式
      debug: !!~src.indexOf('debug'),
      // Mock数据模式
      mock: !!~src.indexOf('mock'),
      // 日常环境和预发环境
      daily: !!~win.location.href.indexOf('daily') || !!~src.indexOf('daily'),
      tag: tag ? tag[1] : NULL
    };
  })();

  // NOTE 第三方js类库分为在渲染页面前加载和渲染后并行的懒加载js，一般来说与业务相关的请放在Libs4PreLoad数组中，与业务无关的放在Libs4LazyLoad数组中
  var Prefix = win.location.protocol + '//g.alicdn.com';
  var Libs4PreLoad = [
    '/mm/bpc/2.2.1/bpc-min.js'
  ];

  var Libs4LazyLoad = [
    '/mm/mmlogs/2.0.5/easytrace.min.js',
    '/mm/fbsdk/1.2.0/theme/default/feedback.css',
    '/mm/fbsdk/1.2.0/feedback.min.js'
  ].concat(Site.tag && !Site.debug && !Site.mock ? ['/tb/tracker/4.0.3/p/index/index.js', '/alilog/mlog/aplus_v2.js'] : []);

  var GetBaseUri = function (url) {
    return (url + EMPTY).replace(/[^\/]+$/, EMPTY);
  };
  var Boot = function () {
    // bpc路径进行订正
    var packages = [{
      name: 'app',
      base: Site.base
    }, {
      name: 'bpc',
      base: GetBaseUri(Prefix + Libs4PreLoad[0]) + 'bpc/'
    }, {
      name: 'common',
      base: Site.base + 'common/',
      ignorePackageNameInUri: true
    }];
    packages = S.map(packages, function (v) {
      return S.mix(v, {
        combine: 1,
        debug: Site.debug,
        tag: S.__BUILD_TIME
      });
    });
    S.config({
      packages: packages
    });
    S.use('magix/magix', function (S, Magix) {
      Magix.start({
        iniFile: 'app/ini',
        rootId: 'magix_vf_root',
        appName: 'app',
        appHome: Site.base,
        appCombine: !!Site.tag,
        // extensions: ['app/extview', 'app/router', 'app/features', 'app/spm'].concat(Site.debug ? ['app/cssloader'] : []),
        extensions: ['app/extview', 'app/router', 'app/features', 'app/spm', 'app/datamap'],
        appTag: Site.tag ? Site.tag : (~new Date()).toString(36),
        debug: Site.debug,
        mock: Site.mock,
        daily: Site.daily,
        beta: win.D && win.D.isBeta,
        bpcCdn: GetBaseUri(Prefix + Libs4PreLoad[0]),
        teslaCdn: GetBaseUri(Prefix + Libs4LazyLoad[0])
      });
    });
  };

  // Start Boot
  S.getScript(Prefix + '/??' + Libs4PreLoad.join(','), {
    success: Boot,
    error: Boot
  });

  S.each(Libs4LazyLoad, function (v) {
    S.getScript(Prefix + v);
  });

  win.Site = Site;

})(window, window.KISSY, '', null);
