function getBrowser(){
  if(typeof chrome !== "undefined"){
    if(typeof browser !== "undefined"){
      return "firefox"; 
    }else{
      return "chrome";
    }
  }else{
    return "Edge";
  }
}

var browser = getBrowser();
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
  if(msg.subject === 'popup'){
    // handle requests for popup page info
    // chrome.browserAction.show(sender.tab.id);
  }else{
    // hendle requests to update badge info
    function getBadgeInfo(msg){
      switch(msg['sourceData']['bias']){
        case 'left':
          badgeColor = { 'color': "#3232FF" };
          text = { 'text': "L" }
          break;
        case 'left-center':
          badgeColor = { 'color': "#00B9AF" };
          text = { 'text': "LC" }
          break;
        case 'least biased':
          badgeColor = { 'color': "#009600" };
          text = { 'text': "C" }
          break;
        case 'pro-science':
          badgeColor = { 'color': "#009600" };
          text = { 'text': "PS" }
          break;
        case 'right-center':
          badgeColor = { 'color': "#C87F00" };
          text = { 'text': "RC" }
          break;
        case 'right':
          badgeColor = { 'color': "#C80000" };
          text = { 'text': "R" }
          break;
        case 'questionable':
          badgeColor = { 'color': "#000000" };
          text = { 'text': "Q" }
          break;
        case 'conspiracy/pseudoscience':
          badgeColor = { 'color': "#000000" };
          text = { 'text': "C/P" }
          break;
        case 'conspiracy':
          badgeColor = { 'color': "#000000" };
          text = { 'text': "C/P" }
          break;
        case 'satire':
          badgeColor = { 'color': "#C800C8" };
          text = { 'text': "S" }
          break;      
        default:
          badgeColor = { 'color': "#FFFFFF" };
          text = { 'text': " " }
          break;
      }

      return [text, badgeColor];
    }
    if(!msg['sourceData']){
      // clear badge
      chrome.browserAction.setBadgeText({ 'text': '' });
      return
    }else{
      chrome.tabs.get(sender.tab.id, function(tab){
        if(chrome.runtime.lastError) {
          return // the prerendered tab has been nuked, happens in omnibox search
        }
        if(tab.index >= 0) { // tab is visible
          var [text, badgeColor] = getBadgeInfo(msg);
          text['tabId'] = tab.id
          badgeColor['tabId'] = tab.id
          chrome.browserAction.setBadgeText(text);
          chrome.browserAction.setBadgeBackgroundColor(badgeColor);
          if(browser == "firefox"){
            chrome.browserAction.setBadgeTextColor({ 'color': '#FFFFFF' });
          }
        }else{ // prerendered tab, invisible yet, happens quite rarely
          var tabId = sender.tab.id;
          var [text, badgeColor] = getBadgeInfo(msg);
          text['tabId'] = tabId;
          badgeColor['tabId'] = tabId;
          chrome.webNavigation.onCommitted.addListener(function update(details){
            if(details.tabId == tabId){
              chrome.browserAction.setBadgeText(text);
              chrome.browserAction.setBadgeBackgroundColor(badgeColor);
              if(browser == "firefox"){
                chrome.browserAction.setBadgeTextColor({ 'color': '#FFFFFF' });
              }
              chrome.webNavigation.onCommitted.removeListener(update);
            }
          })
        }
      })
    }
  }
});