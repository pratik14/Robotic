'use strict';

var ContextMenu = {
  add(){
    var menuItem = {
      "id": "Robotic",
      "title": "Robotic"
    };

    var allOpt = [];

    chrome.contextMenus.create(menuItem);

    Object.keys(contextMenuOptions).forEach(function(key,index) {
      chrome.contextMenus.create({
        id: key,
        title: key,
        parentId: 'Robotic'
      });
      for(var propt in contextMenuOptions[key]){
        var subMenu = contextMenuOptions[key][propt];
        chrome.contextMenus.create({
          id: subMenu,
          title: subMenu,
          parentId: key
        });
      }
    });



    chrome.contextMenus.onClicked.addListener(function(clickData){
      // var roboticOpt = allOpt.indexOf(clickData.menuItemId) != -1;
      var roboticOpt = true;
      if (roboticOpt){
        var content = host.tabs;
        content.query({active: true}, (tabs) => {
          var opt_name = clickData.menuItemId;
          content.sendMessage(tabs[0].id, { operation: "contextMenuClick", opt_name: opt_name });
        });
      }
    });
  },

  remove(){
    chrome.contextMenus.remove('Robotic')
  }
}
