(function () {
    var secs = document.getElementsByName("section");
    for (var i = 0; i < secs.length; i++) {
        setTabTouch(secs[i]);
    }
    var navs = document.getElementsByName("nav");
    for (var i = 0; i < navs.length; i++) {
        var arr = navs[i].getElementsByTagName('span');
        for (var j = 0; j < arr.length; j++) {
            setNavClick(arr[j], j); //i是第几个section

        }
    }
})();
var doing = false;
function setTabTouch(sec) {

    var uls = sec.getElementsByTagName('ul');
    setAttr(sec, 'page', 1);
    setAttr(sec, 'psize', uls.length);

    for (var i = 0; i < uls.length; i++) {
        uls[i].style.width = sec.offsetWidth + 'px';
    }
    Swipe(sec, function (e) {
        scroll(e, e.offsetWidth, 1);
    }, function (e) {
        scroll(e, e.offsetWidth * -1, 1);
    });

}
function setNavClick(nav, idx) {
    setAttr(nav, 'p', idx + 1);
    nav.onclick = function () {

        var idx = getAttr(this, 'p');
        
        var sec = next(this.parentNode);
        var p = getAttr(sec, 'page');
        scroll(sec, sec.offsetWidth * (idx - p > 0 ? 1 : -1), Math.abs(idx - p));
    };
}

function scroll(e, w, stp) {
    if (doing) return;
    doing = true;
    var p = getAttr(e, 'page');
    if (w > 0) {
        if (p == getAttr(e, 'psize')) return;
        p += stp;
        setAttr(e, 'page', p);
    } else {
        if (p == 1) return;
        p -= stp;
        setAttr(e, 'page', p);
    }

    var k = 0, st = w * stp / 10;
    var inter = setInterval(function () {
        e.scrollLeft += st;
        k += 1;
        if (k >= 10) {
            clearInterval(inter);
            inter = null;
            doing = false;
            return;
        }
    }, 5);
    var arr = e.parentNode.getElementsByTagName('span');
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].className == 'current') arr[i].className = '';
    }
    arr[p - 1].className = 'current';

    setMorehref(); //重置more的href属性
}
function getAttr(e, a) {
    return parseInt(e.getAttribute(a), 10);
}
function setAttr(e, a, v) {
    return e.setAttribute(a, v);
}
function next(obj) {
    var n = obj;
    do {
        n = n.nextSibling;
    }
    while (n.nodeType != 1);
    return n;
}

function Swipe(obj, onleft, onright) {
    var startPos = endPos = [0, 0];
    obj.ontouchstart = function (ev) {
        var t = ev['touches'][0];
        startPos = [t.clientX, t.clientY];
    };
    obj.ontouchmove = function (ev) {
        var t = ev['touches'][0];
        endPos = [t.clientX, t.clientY];
    };
    obj.ontouchend = function (ev) {
        var x = endPos[0] - startPos[0];
        var y = endPos[1] - startPos[1];
        if (Math.abs(x) > Math.abs(y)) {
            if (x < 0) {//left
                onleft(this);
            } else if (x > 0) {//right
                onright(this);
            }
        }
        ev.preventDefault();
        ev.stopPropagation();
return false;
    };
}
function setMorehref() {
    var navs = els("current");
    var arr = els("button");
    var root = arr[0].href.split('/')[3];
    var ch = arr[0].href.split('/')[4];
    for (var i = 0; i < navs.length; i++) {
        arr[i].href = '/' + root + '/'+ch+'/' + navs[i].lang; 
    }
}
function el(id) {
    return document.getElementById(id);
}
function els(classname) {
    return document.getElementsByClassName(classname);
}


function getUN() {
    var m = document.cookie.match(new RegExp("(^| )" + "UserName" + "=([^;]*)(;|$)"));
    if (m) return m[2];
    else return '';

}

// Google code
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-535605-6']);
_gaq.push(['_setDomainName', 'csdn.net']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();