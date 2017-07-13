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

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo.status === 'complete'){
    onLoad();
  }
});


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
        selection(request);
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
    selection( new BrowserEvent({}).goToAttrs(recordTab.url) )
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
    selection( new BrowserEvent({}).onLoadAttrs() )
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

function dataURItoBlob(dataURI, item) {
  dataURI = dataURI.split(',');
  var type = dataURI[0].split(':')[1].split(';')[0],
  byteString = atob(dataURI[1]),
  byteStringLength = byteString.length,
  arrayBuffer = new ArrayBuffer(byteStringLength),
  intArray = new Uint8Array(arrayBuffer);
  for (var i = 0; i < byteStringLength; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }
  var blob = new Blob([intArray], {
    type: type
  });

  var promise = new Promise(function(resolve, reject) {
    if (blob.size > 0) {
      resolve(blob);
    }
  });

  promise.then(function(result) {
    item.uploaded_file = result;
    recordingList.push(item);
    show_notification();
  });
}

function selection(item) {
  item.order_number = recordingList.length + 1;
  if(item.trigger == 'File') {
    dataURItoBlob(item.uploaded_file, item);
  } else {
    if (recordingList.length > 1) {

      // Time diffrence between events should be atlease 20 miliseconds
      let prevItem = recordingList[recordingList.length - 1];
      if(item.trigger != 'Submit' && item.trigger != 'Click'){
        if (Math.abs(item.time - prevItem.time) < 20) {
          return;
        }
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
}

function show_notification(){
  var item = recordingList[recordingList.length - 1];

  if(!item.display_message) { return; }

  name = + new Date()
  var notifOptions = {
    type: "basic",
    iconUrl: "images/icon-48.png",
    title: item.trigger.toUpperCase() + " Event",
    message: item.display_message
  };

  chrome.notifications.create(name,  notifOptions);
}

function recordingStarted(){
  return (recordingList.length == 0)
}
