'use strict';

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
  clearHighlights() {
    var els = document.querySelectorAll('.xh-highlight');
    if (els.length > 0){
      els[0].classList.remove('xh-highlight');
    }
  },

  highlight(element){
    Selection.clearHighlights();
    element.className += ' xh-highlight';
  },

  unSelected() {
    var els = document.querySelectorAll('.xh-selected');
    var i;
    for (i = 0; i < els.length; i++) {
      els[i].classList.remove('xh-selected');
    }
  },

  selected(element){
    element.className += ' xh-selected';
  },

  parse(time, element){
    Selection.selected(element)

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
