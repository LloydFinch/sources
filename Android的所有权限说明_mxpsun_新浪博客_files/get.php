
  (function () {
  if (!document.getElementById('gt_lib')) {
    var s = document.createElement('script');
    s.id = 'gt_lib';
    s.src = 'http://static.geetest.com/static/js/geetest.3.0.34.js';
    s.charset = 'UTF-8';
    s.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(s);
    var loaded = false;
    s.onload = s.onreadystatechange = function () {
      if (!loaded && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
        loaded = true;
        if (typeof window.gtcallback == 'function') {
          window.gtcallback()
        }
      }
    };
  }
}());
