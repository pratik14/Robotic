var menuItem = {
  "id": "Robotic",
  "title": "Robotic"
};

function isInt(value) {
  return !isNaN(value) &&
  parseInt(Number(value)) == value &&
  !isNaN(parseInt(value, 10));
}

chrome.contextMenus.create(menuItem);
// chrome.contextMenus.create({
//   id: 'Element',
//   title: 'Element',
//   parentId: 'Robotic'
// });
//
// chrome.contextMenus.create({
//   id: 'Mouse Over',
//   title: 'Mouse Over',
//   parentId: 'Robotic'
// });

subMenu = [
  'Element',
  'Mouse Over',
]

for(i=0;i<subMenu.length;i++){
  chrome.contextMenus.create({
    id: elementOpts[i],
    title: elementOpts[i],
    parentId: 'Robotic'
  });
}

elementOpts = [
  'Should Be Disabled',
  'Should Be Enabled',
  'Should Be Visible',
  'Should Not Be Visible',
  'Should Contain',
  'Should Not Contain'
]

allOpt = elementOpts + subMenu;

for(i=0;i<elementOpts.length;i++){
  chrome.contextMenus.create({
    id: elementOpts[i],
    title: elementOpts[i],
    parentId: 'Element'
  });
}

chrome.contextMenus.onClicked.addListener(function(clickData){
  var roboticOpt = allOpt.indexOf(clickData.menuItemId) != -1;
  if (roboticOpt){
    var content = host.tabs;
    content.query({active: true}, (tabs) => {
      var opt_name = clickData.menuItemId;
      if(clickData.parentMenuItemId == 'Element'){
        opt_name = 'Element ' + opt_name
      }
      content.sendMessage(tabs[0].id, { operation: "yee", opt_name: opt_name });
    });
  }
});

chrome.storage.onChanged.addListener(function(changes, storageName){
});
