"use strict";

var host = chrome;

var SHIFT_KEYCODE = 16;
var currEl = null;

host.runtime.sendMessage({operation: "load"});

host.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.operation == "record") {
      document.addEventListener("change", recordChange, true);
      document.addEventListener("click", recordClick, true);
    }
    else if (request.operation == "assert") {
      document.addEventListener('keydown', recordKeyDown, true);
      document.addEventListener('mousemove', recordMouseMovement, true);
    }
    else if (request.operation == "stop") {
      document.removeEventListener("change", recordChange, true);
      document.removeEventListener("click", recordClick, true);
      document.removeEventListener('keydown', recordKeyDown, true);
      document.removeEventListener('mousemove', recordMouseMovement, true);
    }
  }
);

function getTime(){
  return new Date().getTime();
}

function recordChange(event){
  let attr = {time: getTime(), xpath: XPath.get(event.target), value: event.target.value};
  if (handleByChange(event.target)) {
    Object.assign(attr, {trigger: "change"});
    host.runtime.sendMessage({operation: "action", script: attr});
  }
}

function recordClick(event){
  let attr = {time: getTime(), xpath: XPath.get(event.target)};
  if (!handleByChange(event.target)) {
    Object.assign(attr, {trigger: "click"});
    host.runtime.sendMessage({operation: "action", script: attr});
  }
}

function recordMouseMovement(event) {
  if (currEl === event.toElement) {
    return;
  }
  currEl = event.target;
  Selection.parse(getTime(), currEl)
};

function recordKeyDown(event) {
  var ctrlKey = event.ctrlKey || event.metaKey;
  var shiftKey = event.shiftKey;

  if (!ctrlKey && event.keyCode === SHIFT_KEYCODE) {
    let attr = Selection.parse(getTime(), currEl)

    host.runtime.sendMessage({operation: "action", script: attr});
    document.removeEventListener('keydown', recordKeyDown, true);
    document.removeEventListener('mousemove', recordMouseMovement, true);
  }
};


function handleByChange(target){
  var type = event.target.tagName.toUpperCase();
  if(type == 'INPUT' && event.target.type.toUpperCase() == 'SUBMIT'){
    return false;
  }
  return ["INPUT", "FILE", "SELECT"].some(n => type === n);
}
