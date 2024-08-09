// set showFb as a fail-safe in case storage.sync is not set
var showFb = true

chrome.storage.sync.get('stopagandaSettings', function(results){
  if(!results['stopagandaSettings']){
    // default to showing if there are no saved settings
    showFb = true;
  }else if(results['stopagandaSettings']['facebook'] == undefined){
    // default to showing if FB is not set
    showFb = true;
  }else{
    showFb = results['stopagandaSettings']['facebook']
  }
  if(showFb){
    runStopaganda();
  }
});

// only run if showFb

function runStopaganda(){

  // function to add decal to target element
  function updateHTML(el, sourceHash){
    // SPECIAL CASES
    if(el[3].match(/borowitz-report/)){
      var sourceData = sourceHash["https://www.newyorker.com/humor/borowitz-report"];
    }else if(el[3].match(/bloomberg\.com\/citylab/)){
      var sourceData = sourceHash["bloomberg.com/citylab"]
    }else if(el[3].match(/theguardian\.com\/observer/)){
      var sourceData = sourceHash["theguardian.com/observer"]
    }else{ 
      var sourceMatch = el[1];
      if(sourceHash[sourceMatch] != null){
        var sourceData = sourceHash[sourceMatch]
      }else{
        // dig one level deeper for domain if no match exists in sourceHash
        var sourceMatch = el[3].match(/(?:https?\:\/\/)?(?:www\.)?([A-Za-z0-9\_\-]+\.(?:com|gov|edu|net|org|mil))/)
        if(sourceMatch){
          var sourceData = sourceHash[sourceMatch[1]];
        }
      }
    }
  
    // Do not include "opinion" parsing for now
    // var opRegex = /opinion/;
    // var opinion = el[0].href.match(opRegex);

    if(sourceData != null){
      if(sourceData['href'] != "NO URL FOUND"){
        var url = sourceData['href'];
      }else{
        var url = '#';
      }
      switch(sourceData['bias']){
        case 'left':
          biasStyle = "background-color: rgb(0,0,150); color: white";
          break;
        case 'left-center':
          biasStyle = "background-color: rgb(0,185,175); color: white";
          break;
        case 'least biased':
          biasStyle = "background-color: rgb(0,150,0); color: white";
          break;
        case 'pro-science':
          biasStyle = "background-color: rgb(0,150,0); color: white";
          break;
        case 'right-center':
          biasStyle = "background-color: rgb(150,125,0); color: white";
          break;
        case 'right':
          biasStyle = "background-color: rgb(150,0,0); color: white";
          break;
        case 'questionable':
          biasStyle = "background-color: rgb(0,0,0); color: rgb(255,150,150)";
          break;
        case 'conspiracy/pseudoscience':
          biasStyle = "background-color: rgb(0,0,0); color: rgb(255,150,150)";
          break;
        case 'conspiracy':
          biasStyle = "background-color: rgb(0,0,0); color: rgb(255,150,150)";
          break;
        case 'unlisted':
          biasStyle = "background-color: rgb(225,225,225); color: black";
          break;
        case 'satire':
          biasStyle = "background-color: rgb(200,0,200); color: white";
          break;      
        default:
          biasStyle = "background-color: rgb(225,225,225); color: black";
          break;
      }

      switch(sourceData['accuracy']){
        case 'very low':
          accStyle = "background-color: rgb(0,0,0); color: rgb(255,150,150)";
          break;
        case 'low':
          accStyle = "background-color: rgb(125,50,50); color: white";
          break;
        case 'mixed':
          accStyle = "background-color: rgb(225,175,0); color: white";
          break;
        case 'mostly factual':
          accStyle = "background-color: rgb(175,200,0); color: white";
          break;
        case 'very high':
          accStyle = "background-color: rgb(0,150,0); color: white";
          break;
        case 'high':
          accStyle = "background-color: rgb(125,150,0); color: white";
          break;
        case 'unlisted':
          accStyle = "background-color: rgb(225,225,225); color: black";
          break;
        case 'satire':
          accStyle = "background-color: rgb(200,0,200); color: white";
          break;      
        default:
          if(sourceData['bias'] == "satire"){
            accStyle = biasStyle;
            sourceData['accuracy'] = "satire";
          }else{
            accStyle = "background-color: rgb(225,225,225); color: black";
          }
          break;
      }
    }else{
      accStyle = "background-color: rgb(225,225,225); color: black";
      biasStyle = "background-color: rgb(225,225,225); color: black";
    }

    // if(opinion != null){
    //   opHTML = "<span class='stopaganda-txt' style='font-size: 75%; white-space: nowrap; background-color: darkgray; color: white; border-radius: 5px'>&nbsp;OpEd&nbsp;</span>";
    // }else{
    //   opHTML = " ";
    // }

    if(sourceData == null){
      console.log('Source ' + el[1] + ' not identified in MBFC master list');
      return true;
    }else{
      // create DOM elements to add
      var decalContainer = document.createElement("div");
      var decalLink = document.createElement("a");
      var decalAccSpan = document.createElement("span");
      var decalBiasSpan = document.createElement("span");
      // create acc HTML
      decalAccSpan.classList.add("stopaganda-txt");
      decalAccSpan.style = "font-size: 75%; white-space: nowrap; border-radius: 5px; padding-left: 3px; padding-right: 2px; margin-right: 5px; margin-left: 2px; " + accStyle;
      decalAccSpan.textContent = " Acc: " + sourceData['accuracy'].toUpperCase() + " ";
      // create bias HTML
      decalBiasSpan.classList.add("stopaganda-txt");
      decalBiasSpan.style = "font-size: 75%; white-space: nowrap; border-radius: 5px; padding-left: 3px; padding-right: 2px; margin-right: 5px; " + biasStyle;
      decalBiasSpan.textContent = " Bias: " + sourceData['bias'].toUpperCase() + " ";
      // create and populate link HTML
      decalLink.href = url;
      decalLink.target = "_blank";
      decalLink.addEventListener("mouseover", function(){
        this.setAttribute('style', 'opacity: 0.3; text-decoration: none');
      });
      decalLink.addEventListener("mouseout", function(){
        this.setAttribute('style', 'opacity: 1.0; text-decoration: none');
      });
      decalLink.setAttribute('class', 'stopaganda-tag');
      decalLink.appendChild(decalAccSpan);
      decalLink.appendChild(decalBiasSpan);
      // create and populate container div HTML
      if(el[2]){
        decalContainer.style = "font-size: 16px; right: 20px; position: absolute;"
      }else{
        decalContainer.style = "font-size: 16px";
      }

      decalContainer.appendChild(decalLink);
      // place decalContainer before existing HTML
      if(el[2]){
        el[0].appendChild(decalContainer);
      }else{
        el[0].insertAdjacentElement('beforebegin', decalContainer);
      }
      return true;
    }
  }

  // function to identify target elements
  function run(sourceHash){
    // Primary links
    var linkTextClass = ".x1e56ztr.xtvhhri";
    // get link element parents
    var sources = document.querySelectorAll(linkTextClass + ':not(.stopaganda)');
    // add stopaganda class to each element to make sure that script isn't run multiple times on the same element
    sources.forEach(function(e){ e.classList.add('stopaganda') });
    var sourcesArray = Array.from(sources);

    // Comment links
    // var commentSourceClass = ".oi732d6d.ik7dh3pa.d2edcug0.qv66sw1b.c1et5uql.a8c37x1j.hop8lmos.enqfppq2.e9vueds3.j5wam9gi.lrazzd5p.m9osqain.hzawbc8m"
    // var commentSources = document.querySelectorAll(commentSourceClass + ':not(.stopaganda)');
    // commentSources.forEach(function(e){ e.classList.add('stopaganda') });
    // commentSourcesArray = Array.from(commentSources);
    // get tags only for entries that identify as one of base subs if this is a collection page
    var linkRegex = /(?:https?\:\/\/)?(?:www\.)?([A-Za-z0-9\_\-\.]+)\/?/;
    // run script to add decals to each target identified
    // [linkElement, base link, comment, full link]
    var baseLinks = sourcesArray.map(function(e){ return [e.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector('a'), e.textContent, false, e.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector('a').href] } );
    baseLinks.forEach(function(e){
      updateHTML(e, sourceHash);
    });

    // // set baseLinks for comments
    // try {  
    //   var commentBaseLinks = commentSourcesArray.map(function(e){
    //     if(e.parentElement.parentElement.nextElementSibling.tagName == "A"){
    //       link = e.textContent.toLowerCase();
    //       targetEl = e.parentElement.parentElement.nextElementSibling;
    //       if(link == "newyorker.com"){
    //         specialCaseLink = targetEl.href
    //       }else{
    //         specialCaseLink = "N/A";
    //       }
    //       return [e.parentElement.parentElement.nextElementSibling, link.match(linkRegex)[1], true, specialCaseLink];
    //     }else{
    //       console.log("Did not return expected format")
    //       return [' ', ' '];
    //     }
    //   });

    //   // combine baseLinks and commentBaseLinks
    //   baseLinks = baseLinks.concat(commentBaseLinks);

    //   baseLinks.forEach(function(e){
    //     updateHTML(e, sourceHash);
    //   });
    // }catch{
    //   console.log("Did not return expected format");
    // }
  }


  // Wait until page is fully loaded then define observer
  function initObserver(){
    var targetNode = document.querySelectorAll('.xw7yly9');
    if(targetNode.length == 0 || sourceHash == null){ 
      // node or sourceHash doesn't exist yet; wait 250ms and try again
      window.setTimeout(initObserver, 250);
      return;   
    }
    targetEl = targetNode[targetNode.length - 1];
    // set config for observer
    var config = { childList: true, subtree: true };

    // create observer protocol
    var observer = new MutationObserver(function(mutationsList, observer){
      for(var mutation of mutationsList){
        run(sourceHash);
      }
    });

    // instantiate observer
    observer.observe(targetEl, config);
  }

  // run initObserver whenever location changes
  prevURL = '';
  setInterval(function(){
    if(prevURL != document.location.href){
      initObserver();
      prevURL = document.location.href;
    }
  },1000);

  // load initial observer after data are loaded
  url = chrome.runtime.getURL('sources/sources.json');

  var sourceHash;

  async function getData(){
    const response = await fetch(url);
    const json = await response.json();

    return json
  }

  getData().then(json => {
    sourceHash = json;
  }).then(function(){
    initObserver();
    run(sourceHash);
  });
}

/////// POPUP INFO ///////
function setInfo(){
  // there is no match
  chrome.runtime.sendMessage({ sourceData: null }, function(result){ if (chrome.runtime.lastError){} });
  console.log("Current page is a supported aggregator of sources;");
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
    // Validate message's structure
    if((msg.from === 'popup') && (msg.subject === 'sourceInfo')){
      // return necessary info
      sendResponse({'status': 'N/A'});
    }
  });
  return;
}

var preloadListener = function(msg, sender, sendResponse){
  if((msg.from === 'popup') && (msg.subject === 'sourceInfo')){
    sendResponse(null);
  }
}
// Listen for messages from popup
chrome.runtime.onMessage.addListener(preloadListener)

// retrieve sourceHash
sourceUrl = chrome.runtime.getURL('sources/sources.json');

var sourceHash;

async function getData(){
  const response = await fetch(sourceUrl);
  const json = await response.json();

  return json
}

getData().then(json => {
  sourceHash = json;
}).then(function(){
  chrome.runtime.onMessage.removeListener(preloadListener);
  setInfo(sourceHash);
});