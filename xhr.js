'use strict';

var Xhr = {
  defaultUrl: "http://localhost:3000/robotcorder_web/test_cases",

  post(list, url, name){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    // xhr.onreadystatechange = function() {
    //   if (xhr.readyState == 4) {
    //     alert(xhr.responseText);
    //   }
    // }

    var params = {key: list, name: name};
    params = Xhr.serialize(params)
    xhr.send(params);
  },

  serialize(obj, prefix) {
    var str = [],
    p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = prefix ? prefix + "[" + p + "]" : p,
        v = obj[p];
        str.push((v !== null && typeof v === "object") ?
        Xhr.serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
      }
    }
    return str.join("&");
  }
}
