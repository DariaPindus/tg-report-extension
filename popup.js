

function reportPages() {
	console.log("popup js reportPages");
	chrome.storage.sync.get('content', function (items) {

		/*const openLink = function (href) {
		    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		        var tab = tabs[0];
		        chrome.tabs.update(tab.id, {url: href});
		    });
		}*/
		/*const openLink = function (href) {
			window.location.href = href;
		}*/
		console.log("storage get read ", items['content']);
		const urls = items['content']['content'];
		window.location.href = urls[0];
	});
}

async function submitList() {
	console.log('submit list ');
	const list = document.getElementById("list");
	const content = list.value.split(';').map(s => s.trim());
	const messageElement = document.getElementById("message");
	const message = messageElement.value;
	console.log('list content ' + content);

	chrome.storage.sync.set({content: { content: content, message: message, state: {index: 0, state: 'init'}}});

		console.log ("storage.sync.set after");
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	
		chrome.scripting.executeScript({
		    target: { tabId: tab.id },
		    function: reportPages,
		});
	
	// window.location.href = content[0];
}

const submitEl = document.getElementById("submit");
submitEl.onclick = submitList;


/* 
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: setPageBackgroundColor,
  });
});

// The body of this function will be executed as a content script inside the
// current page
function setPageBackgroundColor() {
  chrome.storage.sync.get("color", ({ color }) => {
    document.body.style.backgroundColor = color;
  });
}
*/