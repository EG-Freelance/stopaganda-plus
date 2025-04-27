// toggle switch
function toggleSwitch(){
	// listen for changes
	tog = document.querySelector('.toggle');
	tog.addEventListener('click', function(e) {
		var toggle = this;

		e.preventDefault();

		toggle.classList.toggle('toggle--on')
		toggle.classList.toggle('toggle--off')
		toggle.classList.add('toggle-moving')

		document.querySelector('#badge-bias').checked = toggle.classList.contains('toggle--on')

		setTimeout(function() {
			toggle.classList.remove('toggle--moving');
		}, 200)
	});
}

// Save options to chrome.storage
function saveOptions(){
	// identify toggles
	var formElements = document.getElementById("stopaganda-options").elements;
	// identify names of toggles
	var targets = Array.from(formElements).map(function(e) { return {name: e.id, checked: e.checked} })
	// create empty settings hash
	var stopagandaSettings = {}
	// populate settings
	targets.forEach(function(e){ stopagandaSettings[e['name']] = e['checked'] })
	chrome.storage.sync.set({
		stopagandaSettings: stopagandaSettings
	}, function(){ 
		console.log("Stopaganda settings updated")
	});
}

// Restore radio buttons using preferences stored in chrome.storage
function restoreOptions(){
	var els = document.getElementById("stopaganda-options").elements;
	var keys = Array.from(els).map(function(e){ return e.id });
	var resubmit = false;
	chrome.storage.sync.get('stopagandaSettings', function(results){
		settings = {}
		if(!results['stopagandaSettings']){
			keys.forEach(function(key){
				settings[key] = true;
				resubmit = true
			})
		}else{
			keys.forEach(function(key){
				if(results['stopagandaSettings'][key] == undefined){
					// default setting for any site should be true
					settings[key] = true;
					resubmit = true;
				}else{
					settings[key] = results['stopagandaSettings'][key]
				}
			});
		}

		if(resubmit){
			chrome.storage.sync.set({
				stopagandaSettings: settings
			}, restoreOptions);
		}
		Object.keys(settings).forEach(function(k){
			document.getElementById(k).checked = settings[k];
		})

		// set bias/acc toggle
		tog = document.querySelector('.toggle');
		if(settings['badge-bias']){
			tog.classList = ['toggle toggle--on opt'];
		}else{
			tog.classList = ['toggle toggle--off opt']
		}
	});
}

document.addEventListener('DOMContentLoaded', function(){
	// Initialize options saving/loading
	restoreOptions();
	toggleSwitch();

	var elements = document.getElementsByClassName('opt');
	Array.from(elements).forEach(function(el){
		el.addEventListener('click', function(){ saveOptions() });
	});

	// Get info for popup
	// query active tab
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs){
		// send a request for source info
		chrome.tabs.sendMessage(
			tabs[0].id,
			{from: 'popup', subject: 'sourceInfo'},
			// also specify a callback to be called from the receiving end (content script)
			function(response){ 
				if(chrome.runtime.lastError){
					console.log(chrome.runtime.lastError);
					// do nothing
				}else{ 
					setSourceInfo(response);
				} 
			}
		);
	});

	// tab event listeners
	document.querySelector('#summary-btn').addEventListener('click', function(event){
		openTab(event, 'summary');
	});

	document.querySelector('#opts-btn').addEventListener('click', function(event){
		openTab(event, 'options');
	});
});

// switch tabs within the popup (between summary info and user options)
function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

const setSourceInfo = function(info){
	if(info){
		if(!info.status){
			const biasSummaries = { 
				'left': 'These media sources are moderately to strongly biased toward liberal causes through story selection and/or political affiliation.  They may utilize strong loaded words (wording that attempts to influence an audience by using appeals to emotion or stereotypes), publish misleading reports, and omit reporting of information that may damage liberal causes. Some sources in this category may be untrustworthy.',
				'left-center': 'These media sources have a slight to moderate liberal bias.  They often publish factual information that utilizes loaded words (wording that attempts to influence an audience by using appeals to emotion or stereotypes) to favor liberal causes.  These sources are generally trustworthy for information, but may require further investigation.',
				'least biased': 'These sources have minimal bias and use very few loaded words (wording that attempts to influence an audience by using appeals to emotion or stereotypes).  The reporting is factual and usually sourced.  These are the most credible media sources.',
				'pro-science': 'These sources consist of legitimate science or are evidence based through the use of credible scientific sourcing.  Legitimate science follows the scientific method, is unbiased, and does not use emotional words.  These sources also respect the consensus of experts in the given scientific field and strive to publish peer-reviewed science. Some sources in this category may have a slight political bias, but adhere to scientific principles.',
				'right-center': 'These media sources are slightly to moderately conservative in bias. They often publish factual information that utilizes loaded words (wording that attempts to influence an audience by using appeals to emotion or stereotypes) to favor conservative causes. These sources are generally trustworthy for information, but may require further investigation.',
				'right': 'These media sources are moderately to strongly biased toward conservative causes through story selection and/or political affiliation. They may utilize strong loaded words (wording that attempts to influence an audience by using appeals to emotion or stereotypes), publish misleading reports, and omit reporting of information that may damage conservative causes. Some sources in this category may be untrustworthy.',
				'conspiracy': 'Sources in the Conspiracy-Pseudoscience category may publish unverifiable information that is not always supported by evidence. These sources may be untrustworthy for credible/verifiable information, therefore fact checking and further investigation is recommended on a per article basis when obtaining information from these sources.',
				'conspiracy/pseudoscience': 'Sources in the Conspiracy-Pseudoscience category may publish unverifiable information that is not always supported by evidence. These sources may be untrustworthy for credible/verifiable information, therefore fact checking and further investigation is recommended on a per article basis when obtaining information from these sources.',
				'questionable': 'A questionable source exhibits one or more of the following: extreme bias, consistent promotion of propaganda/conspiracies, poor or no sourcing to credible information, a complete lack of transparency, and/or is fake news. Fake News is the deliberate attempt to publish hoaxes and/or disinformation for the purpose of profit or influence. Sources listed in the Questionable Category may be very untrustworthy and should be fact checked on a per article basis. Please note sources on this list are not considered fake news unless specifically written in the reasoning section for that source.',
				'satire': 'These sources exclusively use humor, irony, exaggeration, or ridicule to expose and criticize people’s stupidity or vices, particularly in the context of contemporary politics and other topical issues. Typically, these sources are clear that they are satire and do not attempt to deceive.',				
			}
			document.getElementById('bias-title').textContent = info.bias.toUpperCase();
			document.getElementById('bias-summary').textContent = biasSummaries[info.bias.toLowerCase()];
			document.getElementById('acc-rating').textContent = info.accuracy.toUpperCase();
			document.getElementById('mbfc-link').href = info.href;
			// set accuracy for satires that only have bias rating
			if(info.bias == "satire" && info.accuracy == ""){
				document.getElementById('acc-rating').textContent = info.bias.toUpperCase();
			}

		  switch(info.bias){
		    case 'left':
				document.querySelector('#bias-title').style.color = "white";
				document.querySelector('#bias-title').style.backgroundColor = "rgba(50,50,255,1)";
				document.querySelector('#bias-title').style.padding = "0px 8px 0px 8px";
				document.querySelector('#bias-title').style.borderRadius = "15px";
				break;
		    case 'left-center':
				document.querySelector('#bias-title').style.color = "white";
				document.querySelector('#bias-title').style.backgroundColor = "rgba(0,185,175,1)";
				document.querySelector('#bias-title').style.padding = "0px 5px 0px 5px";
				document.querySelector('#bias-title').style.borderRadius = "10px";
				break;
		    case 'least biased':
				document.querySelector('#bias-title').style.color = "white";
				document.querySelector('#bias-title').style.backgroundColor = "rgba(0,150,0,1)";
				document.querySelector('#bias-title').style.padding = "0px 8px 0px 8px";
				document.querySelector('#bias-title').style.borderRadius = "15px";
				break;
		    case 'pro-science':
				document.querySelector('#bias-title').style.color = "white";
				document.querySelector('#bias-title').style.backgroundColor = "rgba(0,150,0,1)";
				document.querySelector('#bias-title').style.padding = "0px 8px 0px 8px";
				document.querySelector('#bias-title').style.borderRadius = "15px";
				break;
		    case 'right-center':
				document.querySelector('#bias-title').style.color = "white";
				document.querySelector('#bias-title').style.backgroundColor = "rgba(200,125,0,1)";
				document.querySelector('#bias-title').style.padding = "0px 8px 0px 8px";
				document.querySelector('#bias-title').style.borderRadius = "15px";
				break;
		    case 'right':
				document.querySelector('#bias-title').style.color = "white";
				document.querySelector('#bias-title').style.backgroundColor = "rgba(200,0,0,1)";
				document.querySelector('#bias-title').style.padding = "0px 8px 0px 8px";
				document.querySelector('#bias-title').style.borderRadius = "15px";
				break;
		    case 'questionable':
				document.querySelector('#bias-title').style.color = "rgb(255,150,150)";
				document.querySelector('#bias-title').style.backgroundColor = "rgba(0,0,0,1)";
				document.querySelector('#bias-title').style.padding = "0px 8px 0px 8px";
				document.querySelector('#bias-title').style.borderRadius = "15px";
				break;
		    case 'conspiracy/pseudoscience':
				document.querySelector('#bias-title').style.color = "rgb(255,150,150)";
				document.querySelector('#bias-title').style.backgroundColor = "rgba(0,0,0,1)";
				document.querySelector('#bias-title').style.padding = "0px 8px 0px 8px";
				document.querySelector('#bias-title').style.borderRadius = "15px";
				break;
		    case 'conspiracy':
				document.querySelector('#bias-title').style.color = "rgb(255,150,150)";
				document.querySelector('#bias-title').style.backgroundColor = "rgba(0,0,0,1)";
				document.querySelector('#bias-title').style.padding = "0px 8px 0px 8px";
				document.querySelector('#bias-title').style.borderRadius = "15px";
				break;
		    case 'satire':
				document.querySelector('#bias-title').style.color = "white";
				document.querySelector('#bias-title').style.backgroundColor = "rgba(200,0,200,1)";
				document.querySelector('#bias-title').style.padding = "0px 8px 0px 8px";
				document.querySelector('#bias-title').style.borderRadius = "15px";
				// not all satire listings have accuracy ratings
				document.querySelector('#acc-rating').style.color = "white";
				document.querySelector('#acc-rating').style.backgroundColor = "rgba(200,0,200,1)";
				document.querySelector('#acc-rating').style.padding = "0px 8px 0px 8px";
				document.querySelector('#acc-rating').style.borderRadius = "15px";
				break;      
		    default:
				document.querySelector('#bias-title').style.textDecoration = "";
				break;
		  }

		  switch(info.accuracy){
		    case 'very low':
				document.querySelector('#acc-rating').style.color = "rgb(255,150,150)";
				document.querySelector('#acc-rating').style.backgroundColor = "rgba(0,0,0,1)";
				document.querySelector('#acc-rating').style.padding = "0px 8px 0px 8px";
				document.querySelector('#acc-rating').style.borderRadius = "15px";
				break;
		    case 'low':
				document.querySelector('#acc-rating').style.color = "white";
				document.querySelector('#acc-rating').style.backgroundColor = "rgba(125,50,50,1)";
				document.querySelector('#acc-rating').style.padding = "0px 8px 0px 8px";
				document.querySelector('#acc-rating').style.borderRadius = "15px";
				break;
		    case 'mixed':
				document.querySelector('#acc-rating').style.color = "white";
				document.querySelector('#acc-rating').style.backgroundColor = "rgba(225,175,0,1)";
				document.querySelector('#acc-rating').style.padding = "0px 8px 0px 8px";
				document.querySelector('#acc-rating').style.borderRadius = "15px";
				break;
		    case 'mostly factual':
				document.querySelector('#acc-rating').style.color = "white";
				document.querySelector('#acc-rating').style.backgroundColor = "rgba(175,200,0,1)";
				document.querySelector('#acc-rating').style.padding = "0px 8px 0px 8px";
				document.querySelector('#acc-rating').style.borderRadius = "15px";
				break;
		    case 'very high':
				document.querySelector('#acc-rating').style.color = "white";
				document.querySelector('#acc-rating').style.backgroundColor = "rgba(0,150,0,1)";
				document.querySelector('#acc-rating').style.padding = "0px 8px 0px 8px";
				document.querySelector('#acc-rating').style.borderRadius = "15px";
				break;
		    case 'high':
				document.querySelector('#acc-rating').style.color = "white";
				document.querySelector('#acc-rating').style.backgroundColor = "rgba(125,150,0,1)";
				document.querySelector('#acc-rating').style.padding = "0px 8px 0px 8px";
				document.querySelector('#acc-rating').style.borderRadius = "15px";
				break;
		    case 'unlisted':
				document.querySelector('#acc-rating').style.textDecoration = "";
				break;
		    case 'satire':
				document.querySelector('#acc-rating').style.color = "white";
				document.querySelector('#acc-rating').style.backgroundColor = "rgba(200,0,200,1)";
				document.querySelector('#acc-rating').style.padding = "0px 8px 0px 8px";
				document.querySelector('#acc-rating').style.borderRadius = "15px";
				break;      
		    default:
				document.querySelector('#acc-rating').style.textDecoration = "";
				break;
		  }
		}else{
			bSummary = document.getElementById('bias-summary');
			newSourceLink = document.createElement('a');
			newSourceLink.setAttribute('id', 'bias-summary');
			newSourceLink.setAttribute('href', 'https://mediabiasfactcheck.com/submit-source/');
			newSourceLink.setAttribute('target', '_blank');
			newSourceLink.textContent = 'Source not found... click here to submit new source';
			bSummary.replaceWith(newSourceLink);
			document.getElementById('bias-title').textContent = "N/A";
			document.getElementById('acc-rating').textContent = "N/A";
		}
	}
}