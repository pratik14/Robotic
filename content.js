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
        startListeningMouseMovement()
        break;
      case 'getLocator':
        startListeningMouseMovement()
        break;
    }
  }
);

function startListeningClickAndChange(){
  document.addEventListener("change", recordChange, true);
  document.addEventListener("click", recordClick, true);
}

function stopListening(){
  document.removeEventListener("change", recordChange, true);
  document.removeEventListener("click", recordClick, true);
  document.removeEventListener('keydown', recordKeyDown, true);
  document.removeEventListener('mousemove', recordMouseMovement, true);
}

function startListeningMouseMovement(){
  document.addEventListener('keydown', recordKeyDown, true);
  document.addEventListener('mousemove', recordMouseMovement, true);
}

function getTime(){
  return new Date().getTime();
}

function recordChange(event){
  var value = event.target.value;
  if(typeof(event.target.value) == "undefined"){
    value = event.target.innerText;
  }

  if (handleByChange(event.target)) {
    let attr = {
      time: getTime(), 
      locator: XPath.get(event.target), 
      value: value,
      text: event.target.value, 
      trigger: "Input Text"
    };
    host.runtime.sendMessage({operation: "action", script: attr});
  }
}

function recordClick(event){
  let attr = {
      time: getTime(), 
      locator: XPath.get(event.target),
      trigger: "Click Element", 
      value: formSubmitOnEnter(event) ? "Submit Form" :event.target.innerText 
    };
  
  if (validClickEvent(event.target)) {
    host.runtime.sendMessage({operation: "action", script: attr});
  }
}

function recordMouseMovement(event) {
  if (currEl === event.toElement) {
    return;
  }
  currEl = event.target;
  Selection.highlight(currEl);
};

function recordKeyDown(event) {
  var ctrlKey = event.ctrlKey || event.metaKey;
  var shiftKey = event.shiftKey;
  var type = event.target.tagName.toUpperCase();

  if (!ctrlKey && event.keyCode === SHIFT_KEYCODE && type != 'INPUT') {
    Selection.selected(currEl)
    let attr = {time: getTime(), locator: XPath.get(currEl), expected: currEl.innerText, text: currEl.innerText, trigger: contextMenuClickedItem };
    host.runtime.sendMessage({operation: "action", script: attr});
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


function validClickEvent(target){
  return !handleByChange(target)
}

function handleByChange(target){
  var type = event.target.tagName.toUpperCase();
  if( formSubmitOnEnter(event) ){
    return false;
  }
  return ["INPUT", "FILE", "SELECT"].some(n => type === n);
}

function formSubmitOnEnter(event){
  var type = event.target.tagName.toUpperCase();
  return (type == 'INPUT' && event.target.type.toUpperCase() == 'SUBMIT')
}
