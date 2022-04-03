function reportPages() {
	chrome.storage.sync.get('content', function (items) {

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
	
}

async function refreshSettings() {
	console.log("storage cleared");
	await chrome.storage.sync.clear();
}

const submitEl = document.getElementById("submit");
submitEl.onclick = submitList;

const refreshEl = document.getElementById("refresh");
refreshEl.onclick = refreshSettings;