"use strict";

var host = chrome;

var SHIFT_KEYCODE = 16;
var ESC_KEYCODE = 27;
var currEl = null;
var contextMenuClickedItem = '';

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
      Selection.unSelected();
      Selection.clearHighlights();
      document.removeEventListener("change", recordChange, true);
      document.removeEventListener("click", recordClick, true);
      document.removeEventListener('keydown', recordKeyDown, true);
      document.removeEventListener('mousemove', recordMouseMovement, true);
    }
    else if (request.operation == "yee") {
      contextMenuClickedItem = request.opt_name;
      document.addEventListener('keydown', recordKeyDown, true);
      document.addEventListener('mousemove', recordMouseMovement, true);
      // var cusid_ele = document.getElementsByClassName('xh-selected');
      // var time = getTime();
      // for (var i = 0; i < cusid_ele.length; ++i) {
      //   var item = cusid_ele[i];
      //   let attr = {time: time, xpath: XPath.get(item), value: item.innerText , trigger: request.opt_name };
      //   host.runtime.sendMessage({operation: "action", script: attr});
      //   time = time + 21;
      // }
      // stopAsserting();
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
  var value = event.target.value;
  if(typeof(event.target.value) == "undefined"){
    value = event.target.innerText;
  }
  let attr = {time: getTime(), xpath: XPath.get(event.target), value: value };
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
  Selection.highlight(currEl);
};

function recordKeyDown(event) {
  var ctrlKey = event.ctrlKey || event.metaKey;
  var shiftKey = event.shiftKey;

  if (!ctrlKey && event.keyCode === SHIFT_KEYCODE) {
    Selection.selected(currEl)
    let attr = {time: getTime(), xpath: XPath.get(currEl), value: currEl.innerText , trigger: contextMenuClickedItem };
    host.runtime.sendMessage({operation: "action", script: attr});
  }

  if (!ctrlKey && event.keyCode === ESC_KEYCODE) {
    stopAsserting();
    contextMenuClickedItem = '';
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
