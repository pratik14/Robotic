"use strict";

var host = chrome;

var SHIFT_KEYCODE = 16;
var ESC_KEYCODE = 27;
var currEl = null;
var contextMenuClickedItem = '';
  
host.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.operation == "record") {
      document.addEventListener("change", recordChange, true);
      document.addEventListener("click", recordClick, true);
    }
    else if (request.operation == "stop") {
      Selection.unSelected();
      Selection.clearHighlights();
      document.removeEventListener("change", recordChange, true);
      document.removeEventListener("click", recordClick, true);
      document.removeEventListener('keydown', recordKeyDown, true);
      document.removeEventListener('mousemove', recordMouseMovement, true);
    }
    else if(request.operation == 'load') {
      host.runtime.sendMessage({operation: "load"});
    }
    else if (request.operation == "contextMenuClick") {
      contextMenuClickedItem = request.opt_name;
      document.addEventListener('keydown', recordKeyDown, true);
      document.addEventListener('mousemove', recordMouseMovement, true);
    }
    else if (request.operation == "getLocator") {
      document.addEventListener('keydown', copyLocator, true);
      document.addEventListener('mousemove', recordMouseMovement, true);
    }
  }
);

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
  var value = event.target.value;
  if(typeof(event.target.value) == "undefined"){
    value = event.target.innerText;
  }
  let attr = {time: getTime(), locator: XPath.get(event.target), value: value };
  var type = event.target.tagName.toUpperCase();
  Object.assign(attr, {text: value, message: 'Click on button ' + value });
  if (!handleByChange(event.target)) {
    Object.assign(attr, {trigger: "Click Element"});
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

  if (!ctrlKey && event.keyCode === ESC_KEYCODE) {
    stopAsserting();
    contextMenuClickedItem = '';
  }
};

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


function handleByChange(target){
  var type = event.target.tagName.toUpperCase();
  if(type == 'INPUT' && event.target.type.toUpperCase() == 'SUBMIT'){
    return false;
  }
  return ["INPUT", "FILE", "SELECT"].some(n => type === n);
}
