function getSourceData(sourceHash){
	// get current website URL
	var url = document.location.href
	var linkRegex = /(?:https?\:\/\/)?(?:www\.)?([A-Za-z0-9\_\-\.]+)\/?/;
	var sourceMatch = url.match(linkRegex)[1]
	if(sourceMatch == 'bloomberg.com'){
		// handle bloomberg/citylab
		if(url.indexOf('bloomberg.com/citylab'.toLowerCase()) >= 0){
			sourceMatch = 'bloomberg.com/citylab'
		}
	}else if(sourceMatch == 'theguardian.com'){
		// handle theguardian/observer
		if(url.indexOf('theguardian.com/observer'.toLowerCase()) >= 0){
			sourceMatch = 'theguardian.com/observer'
		}
	}else if(sourceMatch == 'huffpost.com'){
		// handle theguardian/observer
		if(url.indexOf('huffpost.com/highline'.toLowerCase()) >= 0){
			sourceMatch = 'huffpost.com/highline'
		}
	}

	// check to see if scrubbed link is in source list
	if(sourceHash[sourceMatch] != null){
		var sourceData = sourceHash[sourceMatch];
	}else{
		// dig one level deeper for domain if no match exists in sourceHash
		var sourceMatch = sourceMatch.match(/(?:.*?)\.(.*)/);
		var sourceData = sourceHash[sourceMatch[1]];
	}

	return sourceData;
}

function setInfo(sourceHash){
	sourceData = getSourceData(sourceHash);

	if(sourceData){
	  	// send badge info
	  	chrome.runtime.sendMessage({ sourceData: sourceData }, function(result){ if (chrome.runtime.lastError){ } });
		// inform background that this tab should have popup info
		chrome.runtime.sendMessage({ subject: 'popup' }, function(result){ if (chrome.runtime.lastError){ } });
		// Listen for messages from popup
		chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
			// Validate message's structure
			if((msg.from === 'popup') && (msg.subject === 'sourceInfo')){
				// return necessary info
				sendResponse(sourceData);
			}
		})
  	}else{
	  	// there is no match
	  	chrome.runtime.sendMessage({ sourceData: null }, function(result){ if (chrome.runtime.lastError){} });
	  	console.log("Current page was not found in source list;");
			// Listen for messages from popup
			chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
				// Validate message's structure
				if((msg.from === 'popup') && (msg.subject === 'sourceInfo')){
					// return necessary info
					sendResponse({'status': 'no match'});
				}
			});
	  	return;
  	}
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

chrome.storage.onChanged.addListener(function(){
	sourceData = getSourceData(sourceHash);

	chrome.runtime.sendMessage({ sourceData: sourceData}, function(result){ if (chrome.runtime.lastError){} });
});

getData().then(json => {
	sourceHash = json;
}).then(function(){
	chrome.runtime.onMessage.removeListener(preloadListener);
	setInfo(sourceHash);
});



