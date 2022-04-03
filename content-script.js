const sleep = ms => new Promise(r => setTimeout(r, ms));

function resolveWithRetry(func, condition, n) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
        const res = func();
        console.log("resolveWithRetry " + n, res);
        if (condition(res)) {
            resolve(res);
        } else {
            if (n >= 15) 
                reject('no result');
            else 
                resolveWithRetry(func, condition, n + 1);
        }
    }, 1000);
  });
}

function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function getElementsByXpath(path) {
  const xPathResult = document.evaluate(path, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    const nodes = [];
    let node = xPathResult.iterateNext();
    while (node) {
      nodes.push(node);
      node = xPathResult.iterateNext();
    }
    return nodes;
}

function waitForElm(xpathSelector) {
    return new Promise(resolve => {

        console.log("waitForElm ", xpathSelector);
        
        const element = getElementByXpath(xpathSelector);

        if (element) {
            return resolve(element);
        }

        const observer = new MutationObserver(mutations => {
            if (getElementByXpath(xpathSelector)) {
                resolve(getElementByXpath(xpathSelector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}  

function openInWeb() {
    console.log("exec openInWeb");
    const openInWeb = document.getElementsByClassName("tgme_action_web_button")[0];
    openInWeb.click();
}


function rightClick(element) {
  var e = element.ownerDocument.createEvent('MouseEvents');

  e.initMouseEvent('contextmenu', true, true,
   element.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,
   false, false, false,2, null);


  return !element.dispatchEvent(e);
}

async function finishCurrentReport(content) {
    debugger;
    const contentVal = content['content'];

    const currentIndex = contentVal['state']['index'];

    const nextIndex = currentIndex + 1;
    contentVal['state']['index'] = nextIndex;
    contentVal['state']['state'] = 'init';
    console.log("updated on finish content", content);
    chrome.storage.sync.set(content);

    if (nextIndex < contentVal['content'].length) {
        window.location.href = contentVal['content'][nextIndex];
    } else {
        console.log("execute last element");
        await chrome.storage.sync.clear();
    }
}

async function executeReport (message) {
    // debugger;
    console.log("execute report");
    const postNumber = 5;

    const initialPost =  await waitForElm("//div[contains(@class, 'channel-post')]");
    console.log("initialPost ", initialPost);
    const posts = document.getElementsByClassName("channel-post");
    console.log("posts ", posts);

    for (var i = 1; i <= postNumber; i++) { 

        const post = posts[posts.length - i];
        rightClick(post);

        const reportElement = await waitForElm("//div[@id='bubble-contextmenu']/div[span[contains(text(), 'Report')]]");
        reportElement.click();
        await sleep(2000);
        
        const otherElement = await waitForElm("//div[@class='popup-body']/button[span[contains(text(), 'Other')]]");
        otherElement.click();
        await sleep(2000);

        const reportInputElement = await waitForElm("//div[@class='popup-body']//div[contains(@class, 'input-field-input')]");
        reportInputElement.textContent = message;
        await sleep(2000);

        debugger;
        var submitReportBtn = await waitForElm("//div[contains(@class, 'popup-container')]//button[contains(@class, 'rp')]");
        submitReportBtn.click();
        await sleep(2000);

        await resolveWithRetry(() => document.getElementsByClassName("popup-container"), elems => !elems || elems.length == 0, 0);
    }

    console.log("executeReport finished");


    const content = chrome.storage.sync.get('content', async (val) => finishCurrentReport(val));

/*    waitForElm("//div[@id='bubble-contextmenu']/div[span[contains(text(), 'Report')]]")
    .then((reportElement) => {
        console.log('Element report is ready');
        reportElement.click();
        waitForElm("//div[@class='popup-body']/button[span[contains(text(), 'Other')]]")
        .then((otherElement) => {
            console.log("other element is found");
            otherElement.click();
        });
    });
*/

}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.state === "in_progress") {
        openInWeb();
    }
    else if (request.message) {
        executeReport(request.message);
    }
    sendResponse("ok");
  }
);