
console.log("background.js");

// chrome.storage.sync.set({content : {content: ['lala'], current:0}});

chrome.webNavigation.onCompleted.addListener((details) => {
  console.log("details ", details);



  const logic = (content) => {
    const contentVal = content['content'];
    console.log("background content", contentVal);
    const url = details.url;
    const currentIndex = contentVal['state']['index'];
    const message = contentVal['message'];
    if (currentIndex < contentVal['content'].length) {
      if (url == contentVal['content'][currentIndex]) {
        console.log("I'm on main page");
        contentVal['state']['state'] = 'in_progress';
        chrome.storage.sync.set(content);

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(details.tabId, {state: 'in_progress'}, function(response) {
            console.log("response from content-script 1");
          });
        });

      } else {
        console.log("different page", url);
        if (contentVal['state']['state'] == 'in_progress') {

          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(details.tabId, {message: message}, function(response) {
              console.log("response from content-script 1");
            });
          });

        } else {
            console.log("no matching logic")
        }
      }
    }
  };

  const content = chrome.storage.sync.get('content', (val) => logic(val));

})

/*  =======================DONT DELETE ME ======================================

var xp = "//div[@id='bubble-contextmenu']/div[span[contains(text(), 'Report')]]"

const reportElement = getElementByXpath(xp);
reportElement.click();

const otherXp = "//div[@class='popup-body']/button[span[contains(text(), 'Other')]]";
const otherRepButton = getElementByXpath(otherXp);
const reportInputElement = getElementByXpath("//div[@class='popup-body']//div[contains(@class, 'input-field-input')]");
reportInputElement.textContent = 'this is insane'; //set report value here
var submitReportBtn = getElementByXpath("//div[contains(@class, 'popup-container')]//button[contains(@class, 'rp')]");
submitReportBtn.click();
*/
// const info = document.getElementsByClassName("chat-info")[0];
// info.click();