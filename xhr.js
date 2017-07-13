'use strict';

var Xhr = {
  defaultUrl: "http://localhost:3000/robotcorder_web/test_cases",

  post(list, url, name, authToken){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    // xhr.setRequestHeader("Content-type", "multipart/form-data");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        alert(xhr.responseText);
      }
    }

    var data = Xhr.objectToFormData(list, data, 'key')
    data.append('name', name)
    data.append('auth_token', authToken)
    xhr.send(data);
  },

  objectToFormData(obj, form, namespace) {
    var fd = form || new FormData();
    var formKey;

    for(var property in obj) {
      if(obj.hasOwnProperty(property)) {

        if(namespace) {
          //TODO remove below hardcoded string key
          formKey = 'key' + '[' + namespace + ']' + '[' + property + ']';
        } else {
          formKey = property;
        }

        // if the property is an object, but not a Blob,
        // use recursivity.
        if(typeof obj[property] === 'object' && !(obj[property] instanceof Blob)) {
          Xhr.objectToFormData(obj[property], fd, property);
        } else {
          // if it's a string or a File object
          fd.append(formKey, obj[property]);
        }
      }
    }

    return fd;
  }
}
