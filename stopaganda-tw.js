// set showTwitter as a fail-safe in case storage.sync is not set
var showTwitter = true

chrome.storage.sync.get('stopagandaSettings', function(results){
  if(!results['stopagandaSettings']){
    // default to showing if there are no saved settings
    showTwitter = true;
  }else if(results['stopagandaSettings']['twitter'] == undefined){
    // default to showing if Twitter is not set
    showTwitter = true;
  }else{
    showTwitter = results['stopagandaSettings']['twitter']
  }
  if(showTwitter){
    runStopaganda();
  }
});

// only run if showTwitter

function runStopaganda(){

  // function to add decal to target element
  function updateHTML(el, sourceHash){
    // NOTE: Because Twitter obscures full links, can't dig for special cases like Borowitz Report
    var sourceMatch = el[1];
    // dig one level deeper for domain if no match exists in sourceHash
    if(sourceHash[sourceMatch] != null){
      var sourceData = sourceHash[sourceMatch];
    }else{
      var sourceMatch = sourceMatch.match(/(?:.*?)\.(.*)/);
      if(sourceMatch){
        var sourceData = sourceHash[sourceMatch[1]];
      }
    }
    
    // Do not include "opinion" parsing for now (twitter doesn't include full URLs, so there's no way to parse)
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
      decalAccSpan.style = "white-space: nowrap; border-radius: 5px; padding-left: 3px; padding-right: 2px; margin-right: 5px; margin-left: 2px; " + accStyle;
      decalAccSpan.textContent = " Acc: " + sourceData['accuracy'].toUpperCase() + " ";
      // create bias HTML
      decalBiasSpan.classList.add("stopaganda-txt");
      decalBiasSpan.style = "white-space: nowrap; border-radius: 5px; padding-left: 3px; padding-right: 2px; margin-right: 5px; " + biasStyle;
      decalBiasSpan.textContent = " Bias: " + sourceData['bias'].toUpperCase() + " ";
      // create and populate link HTML
      decalLink.href = url;
      decalLink.target = "_blank";
      decalLink.style = "text-decoration: none"
      decalLink.addEventListener("mouseover", function(){
        this.setAttribute('style', 'opacity: 0.3; text-decoration: none');
      });
      decalLink.addEventListener("mouseout", function(){
        this.setAttribute('style', 'opacity: 1.0; text-decoration: none');
      });
      decalLink.setAttribute('class', 'stopaganda-tag');
      decalLink.appendChild(decalAccSpan);
      decalLink.appendChild(decalBiasSpan);
      decalContainer.appendChild(decalLink);
      decalContainer.style = "margin-left: 5px; margin-bottom: 7px"

      el[0].insertAdjacentElement('afterend', decalContainer);
      return true;
    }
  }

  // function to identify target elements
  function run(sourceHash){
    var tweetClass = ".css-1dbjc4n.r-my5ep6.r-qklmqi.r-1adg3ll";
    var linkIcon = 'path[d="M11.96 14.945c-.067 0-.136-.01-.203-.027-1.13-.318-2.097-.986-2.795-1.932-.832-1.125-1.176-2.508-.968-3.893s.942-2.605 2.068-3.438l3.53-2.608c2.322-1.716 5.61-1.224 7.33 1.1.83 1.127 1.175 2.51.967 3.895s-.943 2.605-2.07 3.438l-1.48 1.094c-.333.246-.804.175-1.05-.158-.246-.334-.176-.804.158-1.05l1.48-1.095c.803-.592 1.327-1.463 1.476-2.45.148-.988-.098-1.975-.69-2.778-1.225-1.656-3.572-2.01-5.23-.784l-3.53 2.608c-.802.593-1.326 1.464-1.475 2.45-.15.99.097 1.975.69 2.778.498.675 1.187 1.15 1.992 1.377.4.114.633.528.52.928-.092.33-.394.547-.722.547z"]'
    // get individual tweets
    var sourcesArray = Array.from(document.querySelectorAll(tweetClass + ':not(.stopaganda)')).filter(function(e) { return e.querySelector(linkIcon) });
    
    // add stopaganda class to each element to make sure that script isn't run multiple times on the same element
    sourcesArray.forEach(function(e){ e.classList.add('stopaganda') });
    // get tags only for entries that identify as one of base subs if this is a collection page
    var linkRegex = /(?:https?\:\/\/)?(?:www\.)?([A-Za-z0-9\_\-\.]+)\/?/;
    // run script to add decals to each target identified
    // [fullLink, baseLink]
    var baseLinks = sourcesArray.map(function(e){
      link = e.querySelector(linkIcon).closest('span').nextElementSibling.textContent;
      return [e.querySelector(linkIcon).closest('a'), link.match(linkRegex)[1]];
    });

    baseLinks.forEach(function(e){
      updateHTML(e, sourceHash);
    });
  }

  // Wait until page is fully loaded then define observer
  function initObserver(){
    // targetNode is element with list of cards (tweets) displayed
    var targetNode = document.querySelectorAll('section');
    if(targetNode.length == 0){ 
      // node or sourceHash doesn't exist yet; wait 250ms and try again
      window.setTimeout(initObserver, 250);
      return;   
    }

    // targetEl = targetNode[0].querySelector('div[style^="padding-bottom:"]') // deprecated 2020.09.11?
    targetEl = targetNode[0].querySelector('div[style^="position: relative"]') // targeting div under "Timeline: Search timeline"
    console.log(targetEl);
    if(!targetEl){
      // node or sourceHash doesn't exist yet; wait 250ms and try again
      window.setTimeout(initObserver, 250);
      return;
    }
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