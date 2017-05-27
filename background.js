"use strict";

var host = chrome;

var recordingList = [];
var storage = host.storage.local;
var content = host.tabs;
var recordTab = 0;
//List of trigger name for which no notification should be showed
var noNotificationList = ['Wait For Condition', 'Set Window Size', 'Open Browser']
const tab = {active: true, currentWindow: true};

storage.set({operation: 'stop'});

host.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    let operation = request.operation;


    //Ignore operation on load if recordingList recording is not started
    if(recordingStarted() && operation == 'load'){
      return;
    }

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
      case 'locator':
        getLocator();
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
  recordingList = [];
  ContextMenu.add();
  content.query(tab, (tabs) => {
    recordTab = tabs[0];
    selection({
      url: recordTab.url,
      time: 0,
      trigger: 'Open Browser',
      message: 'Open Browser'
    })
    selection({
      trigger: 'Set Window Size',
      time: 21,
      message: 'Set window size'
    })
    content.sendMessage(tabs[0].id, { operation: 'record' });
  })
}

function stopRecording(){
  ContextMenu.remove();
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
  chrome.tabs.getSelected(null,function(tab) {
    var tablink = tab.url;
    selection({ trigger: 'Wait For Condition',
                condition: "return document.readyState == 'complete'",
                time: new Date().getTime(),
                message: 'Go to page' + tablink
              });
  });
}

function postList(){
  storage.get({url: '', name: '', authToken: ''}, (state) =>{
    Xhr.post(recordingList, state.url, state.name, state.authToken);
  })
}

function startAssertion(){
  content.query(tab, (tabs) => {
    content.sendMessage(tabs[0].id, {
      operation: 'assert',
    });
  });
}

function getLocator(){
  content.query(tab, (tabs) => {
    content.sendMessage(tabs[0].id, {
      operation: 'getLocator'
    });
  });
}

function selection(item) {
  item.order_number = recordingList.length + 1;
  if (recordingList.length > 1) {
   
    // Time diffrence between events should be atlease 20 miliseconds
    let prevItem = recordingList[recordingList.length - 1];
    if (Math.abs(item.time - prevItem.time) < 20) {
      return;
    }

    // if (item.trigger == "click")
    // return;

    // //For change in input values
    // if ((item.trigger == "change") && (prevItem.trigger == "click")) {
    //   recordingList[recordingList.length - 1] = item;
    //   return;
    // }
  }

  recordingList.push(item);
  show_notification();
}

function show_notification(){
  var item = recordingList[recordingList.length - 1];

  if(noNotificationList.indexOf(item.trigger) > -1) { return; }

  var message = item.trigger + '-' + item.value;
  var notifOptions = {
    type: "basic",
    iconUrl: "images/icon-48.png",
    title: "Event Added",
    message: message
  };
  chrome.notifications.create('Event', notifOptions);
}

function recordingStarted(){
  return (recordingList.length == 0)
}
