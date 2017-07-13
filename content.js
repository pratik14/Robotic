"use strict";

var host = chrome;

var SHIFT_KEYCODE = 16;
var ESC_KEYCODE = 27;
var currEl = null;
var contextMenuClickedItem = '';
var copyLocation = false;

host.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch(request.operation){
      case 'record':
        startListeningClickAndChange()
        break;
      case 'stop':
        Selection.unSelected();
        Selection.clearHighlights();
        stopListening()
        break;
      case 'load':
        host.runtime.sendMessage({operation: "load"});
        break;
      case 'contextMenuClick':
        contextMenuClickedItem = request.opt_name;
        trackMouseMovement()
        break;
      case 'getLocator':
        copyLocation = true;
        trackMouseMovement()
        break;
    }
  }
);

function startListeningClickAndChange(){
  document.addEventListener("change", addEvent, true);
  document.addEventListener("click", addEvent, true);
}

function stopListening(){
  document.removeEventListener("change", addEvent, true);
  document.removeEventListener("click", addEvent, true);
  document.removeEventListener('keydown', recordKeyDown, true);
  document.removeEventListener('mousemove', recordMouseMovement, true);
}

function trackMouseMovement(){
  document.addEventListener('keydown', recordKeyDown, true);
  document.addEventListener('mousemove', recordMouseMovement, true);
}

function getTime(){
  return new Date().getTime();
}

function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function addEvent(event){
  let browserEvent = new BrowserEvent(event)
  if( browserEvent.valid() ){
    //Mark selected section if trigger is green
    if(event.type == 'keydown'){ Selection.selected(currEl) }

    var item = browserEvent.getAttrs();

    if(item.trigger == 'File'){
      var reader = new FileReader();
      reader.onload = function(){
        item.uploaded_file = reader.result;
        host.runtime.sendMessage( item );
      };
      var input = getElementByXpath(item.locator);
      reader.readAsDataURL(input.files[0])
    } else {
      host.runtime.sendMessage( item );
    }
  }
}

function recordMouseMovement(event) {
  // return if cursor is on same position
  if (currEl === event.toElement) {
    return;
  }
  currEl = event.target;
  Selection.highlight(currEl);
};

function recordKeyDown(event) {
  let browserEvent = new BrowserEvent(event)
  if( browserEvent.valid() ){
    if( copyLocation ){
      copyLocation = false;
      stopAsserting();
      copyTextToClipboard( XPath.get(currEl) );
      alert('Location is copied to clipboard');
    } else {
      Selection.selected(currEl)
      host.runtime.sendMessage( browserEvent.keydownAttrs(currEl, contextMenuClickedItem) );
    }
  }
  stopTrackingMouse(event)
};

function stopTrackingMouse(event){
  var ctrlKey = event.ctrlKey || event.metaKey;

  if (!ctrlKey && event.keyCode === ESC_KEYCODE) {
    contextMenuClickedItem = '';
    stopAsserting();
  }
}

function stopAsserting(){
  Selection.unSelected();
  Selection.clearHighlights();
  document.removeEventListener('keydown', recordKeyDown, true);
  document.removeEventListener('mousemove', recordMouseMovement, true);
}

function copyTextToClipboard(text) {
  var copyFrom = document.createElement("textarea");
  copyFrom.textContent = text;
  var body = document.getElementsByTagName('body')[0];
  body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  body.removeChild(copyFrom);
}
