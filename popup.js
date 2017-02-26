'use strict';

var host = chrome;
const storage = host.storage.local;

function toggle(e){
  if (e.target.id === 'record') {
    document.getElementById('record').classList.add('hidden');
    document.getElementById('testCaseNameDiv').classList.add('hidden');
    document.getElementById('postUrlDiv').classList.add('hidden');
    document.getElementById('assert').classList.remove('hidden');
    document.getElementById('stop').classList.remove('hidden');
  } else if ((e.target.id == 'stop')) {
    document.getElementById('assert').classList.add('hidden');
    document.getElementById('stop').classList.add('hidden');
    document.getElementById('record').classList.remove('hidden');
    document.getElementById('testCaseNameDiv').classList.remove('hidden');
    document.getElementById('postUrlDiv').classList.remove('hidden');
  }
}

function operation(e) {
  toggle(e);
  host.runtime.sendMessage({ operation: e.target.id });
  if(e.target.id == 'record'){
    var url = document.getElementById('postUrl').value;
    var name = document.getElementById('testCaseName').value;
    storage.set({url: url, name: name});
  }
}

document.addEventListener('DOMContentLoaded', () => {
  storage.get('operation', (state) => {
    toggle({ target: { id: state.operation } });
  });

  document.getElementById('record').addEventListener('click', operation);
  document.getElementById('assert').addEventListener('click', operation);
  document.getElementById('stop').addEventListener('click', operation);
}, false);
