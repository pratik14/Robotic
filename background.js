"use strict";

var host = chrome;

var list = [];
var storage = host.storage.local;
var content = host.tabs;
var recordTab = 0;
const tab = {active: true, currentWindow: true};

storage.set({operation: 'stop'});

host.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    let operation = request.operation;

    setStateOperation(operation);

    switch(operation) {
      case 'record':
        startRecording();
        break;
      case 'stop':
        stopRecording();
        postList();
        break;
      case 'action':
        selection(request.script);
        break;
      case 'load':
        onLoad();
        break;
      case 'assert':
        startAssertion();
        break;
    }
  }
);

function setStateOperation(operation){
  if(["record", "stop"].indexOf(operation) != -1){
    storage.set({ operation: operation });
  }
}

function startRecording(){
  content.query(tab, (tabs) => {
    recordTab = tabs[0];
    list = [{
      value: recordTab.url,
      time: 0,
      trigger: 'record'
    },
    {
       trigger: 'set_window_size'
    }];
    content.sendMessage(tabs[0].id, { operation: 'record' });
  });
}

function stopRecording(){
  recordTab = 0;
  content.query(tab, (tabs) => {
    content.sendMessage(tabs[0].id, { operation: "stop" });
  });
}

function onLoad(){
  storage.get('operation', (state) => {
    content.query(tab, (tabs) => {
      content.sendMessage(tabs[0].id, { operation: state.operation });
    })
  });
  selection({ trigger: 'load', time: new Date().getTime() });
}

function postList(){
  storage.get({url: '', name: ''}, (state) =>{
    Xhr.post(state.url, state.name);
  })
}

function startAssertion(){
  content.query(tab, (tabs) => {
    recordTab = tabs[0];
    content.sendMessage(tabs[0].id, {
      operation: 'assert',
    });
  });
}

function selection(item) {
  if (list.length == 0) {
    list.push(item);
    return;
  }

  let prevItem = list[list.length - 1];

  // console.log(Math.abs(item.time - prevItem.time), item.time, prevItem.trigger, item.trigger, item);

  if (Math.abs(item.time - prevItem.time) > 20) {
    list.push(item);
    return;
  }

  if (item.trigger == "click")
  return;

  if ((item.trigger == "change") && (prevItem.trigger == "click")) {
    list[list.length - 1] = item;
    return;
  }

  list.push(item);
}
