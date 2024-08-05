function getBadgeInfo(msg, badgeDisplay){
  switch(msg['sourceData'][badgeDisplay]){
    // biases
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
    // accuracies
    case 'very low':
      badgeColor = { 'color': '#000000' };
      text = { 'text': 'VL' }
      break;
    case 'low':
      badgeColor = { 'color': '#7d3232' };
      text = { 'text': 'L' }
      break;
    case 'mixed':
      badgeColor = { 'color': '#e1b000' };
      text = { 'text': 'M' }
      break;
    case 'mostly factual':
      badgeColor = { 'color': '#afc800' };
      text = { 'text': 'MF' }
      break;
    case 'high':
      badgeColor = { 'color': '#7d9600' };
      text = { 'text': 'H' }
      break;
    case 'very high':
      badgeColor = { 'color': '#009600' };
      text = { 'text': 'VH' }
      break;
    case 'unlisted':
      badgeColor = { 'color': '#7d7d7d' };
      text = { 'text': 'U' }
      break;
    default:
      badgeColor = { 'color': "#FFFFFF" };
      text = { 'text': " " }
      break;
  }

  return [text, badgeColor];
}

function checkBadgeSetting(){
  // init needs to be run within this function in order to retain the badge setting
  // set badgeBias as a fail-safe in case storage.sync is not set
  var badgeBias = true

  chrome.storage.sync.get('stopagandaSettings', function(results){
    if(!results['stopagandaSettings']){
      // default to showing bias if there are no saved settings
      badgeBias = true;
    }else if(results['stopagandaSettings']['badge-bias'] == undefined){
      // default to showing bias if badge-bias is not set
      badgeBias = true;
    }else{
      badgeBias = results['stopagandaSettings']['badge-bias']
    }

    if(badgeBias){
      badgeDisplay = 'bias';
    }else{
      badgeDisplay = 'accuracy';
    }
    init(badgeDisplay);
  });
}

function init(badgeDisplay){
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
      // chrome.action.show(sender.tab.id);
    }else{
      // handle requests to update badge info
      if(!msg['sourceData']){
        // clear badge
        chrome.action.setBadgeText({ 'text': '' });
        return
      }else{
        chrome.tabs.get(sender.tab.id, function(tab){
          if(chrome.runtime.lastError) {
            return // the prerendered tab has been nuked, happens in omnibox search
          }
          if(tab.index >= 0) { // tab is visible
            var badgeBias = true

            chrome.storage.sync.get('stopagandaSettings', function(results){
              if(!results['stopagandaSettings']){
                // default to showing bias if there are no saved settings
                badgeBias = true;
              }else if(results['stopagandaSettings']['badge-bias'] == undefined){
                // default to showing bias if badge-bias is not set
                badgeBias = true;
              }else{
                badgeBias = results['stopagandaSettings']['badge-bias']
              }

              if(badgeBias){
                badgeDisplay = 'bias';
              }else{
                badgeDisplay = 'accuracy';
              }
              var [text, badgeColor] = getBadgeInfo(msg, badgeDisplay);
              text['tabId'] = tab.id
              badgeColor['tabId'] = tab.id
              chrome.action.setBadgeText(text);
              chrome.action.setBadgeBackgroundColor(badgeColor);
              if(browser == "firefox"){
                chrome.action.setBadgeTextColor({ 'color': '#FFFFFF' });
              }
            });
          }else{ // prerendered tab, invisible yet, happens quite rarely
            var tabId = sender.tab.id;
            var [text, badgeColor] = getBadgeInfo(msg, badgeDisplay);
            text['tabId'] = tabId;
            badgeColor['tabId'] = tabId;
            chrome.webNavigation.onCommitted.addListener(function update(details){
              if(details.tabId == tabId){
                chrome.action.setBadgeText(text);
                chrome.action.setBadgeBackgroundColor(badgeColor);
                if(browser == "firefox"){
                  chrome.action.setBadgeTextColor({ 'color': '#FFFFFF' });
                }
                chrome.webNavigation.onCommitted.removeListener(update);
              }
            })
          }
        })
      }
    }
  });
}

checkBadgeSetting();