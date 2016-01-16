/*=================================
* Author: zhuhz
* Email: zhuhz@csdn.net
* Blog: http://blog.csdn.net/sq_zhuyi
=================================*/

var Ajax = function () {

};

Ajax.getHttpRequest = function () {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    } else if (window.createRequest) {
        return window.createRequest();
    }
    var prefixes = ["MSXML2", "Microsoft", "MSXML", "MSXML3"];
    for (var i = 0; i < prefixes.length; i++) {
        try { return new ActiveXObject(prefixes[i] + ".XmlHttp"); }
        catch (ex) { }
    }
    throw new Error("Could not find an installed XML parser.");
};

Ajax.get = function (url, callback) {
    var req = Ajax.getHttpRequest();
    req.open("GET", url, true);
    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            if (callback) callback(req.responseText);
        }
    };
    req.send(null);
};

Ajax.post = function (url, data, callback) {
    var req = Ajax.getHttpRequest();
    req.open("POST", url, true);
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            if (callback) callback(req.responseText);
        }
    };
    req.send(data);
};