'use strict';

var clearHighlights = function() {
  var els = document.querySelectorAll('.xh-highlight');
  if (els.length > 0){
    els[0].classList.remove('xh-highlight');
  }
};

var highlight = function(element){
  element.className += ' xh-highlight';
}

///////  Function to evaulate xpath /////////
var XPath = {
  get(element){
    if (element && element.id) {
      return '//' + element.nodeName.toLowerCase() + '[@id="' + element.id + '"]';
    } else {
      return XPath.getElementTreeXPath(element);
    }
  },

  getElementTreeXPath(element) {
    var paths = [];
    // Use nodeName (instead of localName) so namespace prefix is included (if any).
    for (; element && element.nodeType == 1; element = element.parentNode) {
      if (element.nodeName === 'BODY') { break; }
      var index = 0;
      for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
        // Ignore document type declaration.
        if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE) continue;
        if (sibling.nodeName == element.nodeName) ++index;
      }

      var tagName = element.nodeName.toLowerCase();
      var pathIndex = ('[' + (index+1) + ']');
      paths.splice(0, 0, tagName + pathIndex);
    }
    return paths.length ? '//' + paths.join('/') : null;
  }
}

///////// Main Function /////////
var Selection = {
  parse(time, element){
    clearHighlights();
    highlight(element)

    var attr = {
      time: time,
      type: "element_contain",
      xpath: XPath.get(element),
      value: element.innerText,
      trigger: 'assertion'
    }
    return attr;
  }
}
