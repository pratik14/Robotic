"use strict";

var host = chrome;

var SHIFT_KEYCODE = 16;
var ESC_KEYCODE = 27;
var currEl = null;
var contextMenuClickedItem = '';
  
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

function addEvent(event){
  let browserEvent = new BrowserEvent(event)
  if( browserEvent.valid() ){
    //Mark selected section if trigger is green
    if(event.type == 'keydown'){ Selection.selected(currEl) }

    host.runtime.sendMessage( browserEvent.getAttrs() );
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
    Selection.selected(currEl)
    host.runtime.sendMessage( browserEvent.keydownAttrs(currEl, contextMenuClickedItem) );
  }
  stopTrackingMouse(event)
};

function stopTrackingMouse(event){
  var ctrlKey = event.ctrlKey || event.metaKey;

  if (!ctrlKey && event.keyCode === ESC_KEYCODE) {
    stopAsserting();
    contextMenuClickedItem = '';
  }
}

function copyLocator(event) {
  var ctrlKey = event.ctrlKey || event.metaKey;
  var shiftKey = event.shiftKey;

  if (!ctrlKey && event.keyCode === SHIFT_KEYCODE) {
    Selection.selected(currEl)
    stopAsserting();
    alert(XPath.get(currEl));
  }
};

function stopAsserting(){
  Selection.unSelected();
  Selection.clearHighlights();
  document.removeEventListener('keydown', recordKeyDown, true);
  document.removeEventListener('mousemove', recordMouseMovement, true);
}
