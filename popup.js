'use strict';

var host = chrome;
const storage = host.storage.local;

function hideDiv(array_ids){
  for (let i = 0; i < array_ids.length; i++) {
    document.getElementById(array_ids[i]).classList.add('hidden');
  }
}

function showDiv(array_ids){
  for (let i = 0; i < array_ids.length; i++) {
    document.getElementById(array_ids[i]).classList.remove('hidden');
  }
}

function toggle(e){
  if (e.target.id === 'record') {
    hideDiv(['record', 'testCaseNameDiv', 'postUrlDiv', 'authTokenDiv'])
    showDiv(['stop'])
  } else if ((e.target.id == 'stop')) {
    showDiv(['record', 'testCaseNameDiv', 'postUrlDiv', 'authTokenDiv'])
    hideDiv(['stop'])
  }
}

function operation(e) {
  toggle(e);
  host.runtime.sendMessage({ operation: e.target.id });
  if(e.target.id == 'record'){
    var url = document.getElementById('postUrl').value;
    var name = document.getElementById('testCaseName').value;
    var authToken = document.getElementById('authToken').value;

    storage.set({url: url, name: name, authToken: authToken});
    window.close();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  storage.get(['operation', 'url', 'authToken'], (state) => {
    toggle({ target: { id: state.operation } });
    document.getElementById('postUrl').value = state.url || '';
    document.getElementById('authToken').value = state.authToken || '';
  });

  document.getElementById('record').addEventListener('click', operation);
  document.getElementById('stop').addEventListener('click', operation);
  document.getElementById('locator').addEventListener('click', operation);
}, false);
