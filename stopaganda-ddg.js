// set showDDG as a fail-safe in case storage.sync is not set
var showDDG = true

chrome.storage.sync.get('stopagandaSettings', function(results){
  if(!results['stopagandaSettings']){
    // default to showing if there are no saved settings
    showDDG = true;
  }else if(results['stopagandaSettings']['ddg'] == undefined){
    // default to showing if DDG is not set
    showDDG = true;
  }else{
    showDDG = results['stopagandaSettings']['ddg']
  }
  if(showDDG){
    runStopaganda();
  }
});

// only run if showDDG

function runStopaganda(){
  // function to add decal to target element
  function updateHTML(el, sourceHash){
    // SPECIAL CASES
    if(el[2].match(/borowitz-report/)){
      var sourceData = sourceHash["https://www.newyorker.com/humor/borowitz-report"];
    }else if(el[2].match(/bloomberg.com\/citylab/)){
      var sourceData = sourceHash["bloomberg.com/citylab"]
    }else if(el[2].match(/theguardian.com\/observer/)){
      var sourceData = sourceHash["theguardian.com/observer"]
    }else{ 
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
    }
    
    // unsure whether to include "blog" in regex -- better to have false negatives or false positives?
    var opRegex = /opinion/;
    var opinion = el[2].match(opRegex);

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

    var decalOpSpan = document.createElement("span");

    // size down if card
    if(el[3]){
      var size = "font-size: 75%; "
    }else{
      var size = ""
    }

    // create opinion HTML
    if(opinion != null){
      decalOpSpan.classList.add('stopaganda-txt');
      decalOpSpan.style = size + "white-space: nowrap; background-color: darkgray; color: white; border-radius: 5px; padding-left: 3px; padding-right: 2px; margin-right: 2px"
      decalOpSpan.textContent = "OpEd";
    }else{
      decalOpSpan.textContent = ' ';  
    }

    if(sourceData == null){
      el[0].insertAdjacentElement('afterend', decalOpSpan);
      console.log('Source ' + el[1] + ' not identified in MBFC master list');
      return true;
    }else{
      // create DOM elements to add
      var decalContainer = document.createElement("div");
      var decalLink = document.createElement("a");
      var decalAccSpan = document.createElement("span");
      var decalBiasSpan = document.createElement("span");
      if(el[3]){
        decalContainer.style = "margin-left: 5px; position: absolute; bottom: -5px;"
      }else if(el[4]){
        decalContainer.style = "margin-left: 0px; margin-top: 7px;"
      }else{
        decalContainer.style = "margin-left: 5px; margin-bottom: 7px"
      }
      // create acc HTML
      decalAccSpan.classList.add("stopaganda-txt");
      decalAccSpan.style = size + "white-space: nowrap; border-radius: 5px; padding-left: 3px; padding-right: 2px; margin-right: 5px; margin-left: 2px; " + accStyle;
      decalAccSpan.textContent = " Acc: " + sourceData['accuracy'].toUpperCase() + " ";
      // create bias HTML
      decalBiasSpan.classList.add("stopaganda-txt");
      decalBiasSpan.style = size + "white-space: nowrap; border-radius: 5px; padding-left: 3px; padding-right: 2px; margin-right: 5px; " + biasStyle;
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
      decalLink.addEventListener("click", function(e){
        e.stopPropagation();
      });
      decalLink.setAttribute('class', 'stopaganda-tag');
      decalLink.appendChild(decalAccSpan);
      decalLink.appendChild(decalBiasSpan);
      decalLink.appendChild(decalOpSpan);
      decalContainer.appendChild(decalLink);

      el[0].insertAdjacentElement('afterend', decalContainer);

      return true;
    }
  }

  // function to identify target elements
  function run(sourceHash){
    var tab = document.getElementsByClassName('SnptgjT2zdOhGYfNng6g');
    var i = 0;
    var j = 0;
    if(tab.length == 0){
      console.log("Not a Stopaganda-eligible page");
      return true;
    }else if(tab[0].textContent.indexOf("All") >= 0){
      // Default tab
      var linkClass = ".wLL07_0Xnd1QZpzpfR4W";
      var cardClass = ".module--carousel__item.has-image";

      // get link elements
      var standard = document.querySelectorAll(linkClass + ":not(.stopaganda)");
      standard.forEach(function(e){ e.classList.add('stopaganda') });
      var cards = document.querySelectorAll(cardClass + ":not(.stopaganda)");
      
      // convert to array
      var standardArray = Array.from(standard);
      var cardsArray = Array.from(cards);

      var linkRegex = /(?:https?\:\/\/)?(?:www\.)?([A-Za-z0-9\_\-\.]+)\/?/;
      // run script to add decals to each target identified
      // [targetEl, baseLink, fullLinkText, card]
      var standardLinks = standardArray.map(function(e){ return [e.querySelector('.OQ_6vPwNhCeusNiEDcGp'), e.textContent.match(linkRegex)[1], e.textContent, false] }).filter(function(e) { return e[0] });
      var cardLinks = cardsArray.map(function(e){ return [e.querySelector('.module--carousel__footer'), e.getAttribute('data-link').match(linkRegex)[1], e.getAttribute('data-link'), true] })

      // refactor carousel items to make room for decals and make links clickable
      var carouselContainer = document.querySelector('.js-ia-modules:not(.stopaganda)')
      var organicModuleContainer = document.querySelector('#organic-module')
      if(carouselContainer){
        // make sure we don't keep refactoring
        carouselContainer.style.height = String(carouselContainer.offsetHeight + 20) + "px";
        var carouselModule = carouselContainer.querySelector('.module--carousel-news:not(.stopaganda)');
        if(carouselModule){
          carouselModule.style.height = String(carouselModule.offsetHeight + 20) + "px";
          var carouselCardContainer = carouselModule.querySelector('.js-carousel-module-items:not(.stopaganda)');
          if(carouselCardContainer){
            carouselCardContainer.style.height = String(carouselCardContainer.offsetHeight + 20) + "px";
            var carouselCards = Array.from(carouselCardContainer.querySelectorAll('.module--carousel__item'));
            if(carouselCards.length == 0){
              if(i < 8){
                i++;
                setTimeout(function(){
                  run(sourceHash);
                },250);
              }else{
                console.log("No cards");
              }
            }else{
              i = 0;
            }
            if(carouselCards.length > 0){
              // add stopaganda class to each element to make sure that script isn't run multiple times on the same element
              cards.forEach(function(e){ e.classList.add('stopaganda') });
              carouselContainer.classList.add('stopaganda');
              carouselModule.classList.add('stopaganda');
              carouselCardContainer.classList.add('stopaganda');
              // isolate link activation to only the actual link span
              carouselCards.forEach(function(cCard){
                cCard.classList.add('stopaganda');
                cCard.removeAttribute('data-link');
                cCard.style.cursor = "default";
                cCard.style.height = String(cCard.offsetHeight + 20) + "px";
                cCard.querySelector(".module--carousel__footer").style.bottom = "23px";
              });
            }
          }
        }
      }
      if(organicModuleContainer){
        // make sure we don't keep refactoring
        organicModuleContainer.style.height = String(organicModuleContainer.offsetHeight + 20) + "px";
        var organicModule = organicModuleContainer.querySelector('.module--carousel-news:not(.stopaganda)');
        if(organicModule){
          organicModule.style.height = String(organicModule.offsetHeight + 20) + "px";
          var organicCardContainer = organicModule.querySelector('.js-carousel-module-items:not(.stopaganda)');
          if(organicCardContainer){
            organicCardContainer.style.height = String(organicCardContainer.offsetHeight + 20) + "px";
            var organicCards = Array.from(organicCardContainer.querySelectorAll('.module--carousel__item'));
            if(organicCards.length == 0){
              if(j < 8){
                j++;
                setTimeout(function(){
                  run(sourceHash);
                },250);
              }else{
                console.log("No cards (organic)");
              }
            }else{
              j = 0;
            }
            if(organicCards.length > 0){
              // add stopaganda class to each element to make sure that script isn't run multiple times on the same element
              cards.forEach(function(e){ e.classList.add('stopaganda') });
              organicModuleContainer.classList.add('stopaganda');
              organicModule.classList.add('stopaganda');
              organicCardContainer.classList.add('stopaganda');
              // isolate link activation to only the actual link span
              organicCards.forEach(function(oCard){
                oCard.classList.add('stopaganda');
                oCard.removeAttribute('data-link');
                oCard.style.cursor = "default";
                oCard.style.height = String(oCard.offsetHeight + 20) + "px";
                oCard.querySelector(".module--carousel__footer").style.bottom = "23px";
              });
            }
          }
        }
      }

      // combine
      var baseLinks = standardLinks.concat(cardLinks);
      
      baseLinks.forEach(function(e){
        updateHTML(e, sourceHash);
      });

    }else if(tab[0].textContent.indexOf("News") >= 0){
      // Default tab
      var linkClass = ".result--news";
      // get link elements
      var news = document.querySelectorAll(linkClass + ":not(.stopaganda)");
      news.forEach(function(e){ e.classList.add('stopaganda') });
      
      // convert to array
      var newsArray = Array.from(news);

      var linkRegex = /(?:https?\:\/\/)?(?:www\.)?([A-Za-z0-9\_\-\.]+)\/?/;
      // run script to add decals to each target identified
      // [targetEl, baseLink, fullLinkText, card]
      var baseLinks = newsArray.map(function(e){ return [e.querySelector('.result__extras'), e.getAttribute('data-link').match(linkRegex)[1], e.getAttribute('data-link'), false] }).filter(function(e) { return e[0] });

      // refactor newsArray items to make links clickable
      newsArray.forEach(function(link){ 
        dl = link.getAttribute('data-link');
        link.removeAttribute('data-link');
        link.style.cursor = "default";
        ri = link.querySelector('.result__image');
        if(ri){
          ri.setAttribute('data-link', dl);
          ri.style.cursor = "pointer";
        }
      })
      
      baseLinks.forEach(function(e){
        updateHTML(e, sourceHash);
      });

    }else if(tab[0].textContent.indexOf("Videos") >= 0){
      // Default tab
      var linkClass = ".tile--vid";
      // get link elements
      var vids = document.querySelectorAll(linkClass + ":not(.stopaganda)");
      vids.forEach(function(e){ e.classList.add('stopaganda') });
      
      // convert to array
      var vidArray = Array.from(vids);

      var linkRegex = /(?:https?\:\/\/)?(?:www\.)?([A-Za-z0-9\_\-\.]+)\/?/;
      // run script to add decals to each target identified
      // [targetEl, baseLink, fullLinkText, card, video]
      var baseLinks = vidArray.map(function(e){ return [e.querySelector('.tile__body__footer'), e.querySelector('a').href.match(linkRegex)[1], e.querySelector('a').href, false, true] }).filter(function(e) { return e[0] });

      // refactor vidArray items to make links clickable and make heights uniform
      vidArray.forEach(function(vid){ 
        dl = vid.getAttribute('data-link');
        vid.removeAttribute('data-link');
        vid.style.cursor = "default";
        tm = vid.querySelector('.tile__media');
        tm.setAttribute('data-link', dl);
        tm.style.cursor = "pointer";
        vid.style.height = String(vid.offsetHeight + 24) + "px";
      })
      
      baseLinks.forEach(function(e){
        updateHTML(e, sourceHash);
      });

    }else{
      console.log("Not a Stopaganda-eligible page");
      return true;
    }
  }

  // set observing vars to help frequency of observations possible
  var observing = false;
  var observingVid = false;

  // Wait until page is fully loaded then define observer
  function initObserver(){
    // targetNode is element with list of results displayed
    var targetNodeStd = document.querySelector('.results');
    var targetNodeVid = document.querySelector('.zci__main--tiles');
    if((!targetNodeStd || (targetNodeStd && targetNodeStd.childElementCount == 0)) && (!targetNodeVid || (targetNodeVid && targetNodeVid.childElementCount == 0))){ 
      // node or sourceHash doesn't exist yet; wait 250ms and try again
      window.setTimeout(function(){
        initObserver()
      }, 250);
      return;   
    }

    targetEl = targetNodeStd;
    targetElVid = targetNodeVid;
    if(!targetEl || !sourceHash){
      // node or sourceHash doesn't exist yet; wait 250ms and try again
      window.setTimeout(function(){
        initObserver()
      }, 250);
      return;
    }
    // set config for observer
    var config = { childList: true };

    // create observer protocol
    var observer = new MutationObserver(function(mutationsList, observer){
      for(var mutation of mutationsList){
        // only run if not within 100 ms of running
        if(!observing){
          observing = true;
          run(sourceHash);
        }        
        setTimeout(function(){
          observing = false;
        }, 100)
      }
    });

    var observerVid = new MutationObserver(function(mutationsList, observer){
      for(var mutation of mutationsList){
        // only run if not within 100 ms of running
        if(!observingVid){
          observingVid = true;
          run(sourceHash);
        }
        setTimeout(function(){
          observingVid = false;
        }, 100)
      }
    })

    // instantiate observer
    if(targetEl){
      observer.observe(targetEl, config);
    }
    if(targetElVid){
      observerVid.observe(targetElVid, config);
    }
  }

  // run initObserver whenever ddg location changes
  prevURL = '';
  setInterval(function(){
    currUrl = document.location.href;
    if(prevURL != currUrl){
      initObserver();
      run(sourceHash);
      prevURL = currUrl;
    }
  }, 500);

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