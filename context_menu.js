'use strict';

var ContextMenu = {
  add(){
    var menuItem = {
      "id": "Robotic",
      "title": "Robotic"
    };

    chrome.contextMenus.create(menuItem);

    for (var key in contextMenuOptions) {
      chrome.contextMenus.create({
        id: key,
        title: contextMenuOptions[key],
        parentId: 'Robotic'
      });
    };

    chrome.contextMenus.onClicked.addListener(function(clickData){
      var content = host.tabs;

      content.query({active: true}, (tabs) => {
        var opt_name = clickData.menuItemId;
        content.sendMessage(tabs[0].id, { operation: "contextMenuClick", opt_name: opt_name });
      });
    });
  },

  remove(){
    chrome.contextMenus.remove('Robotic')
  }
}
