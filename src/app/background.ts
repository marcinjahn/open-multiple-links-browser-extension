import {LinksResponse} from "./models/links-response";
import {FromBackgroundScript} from "./utils/communication";

let contextMenuEnabled = false;

FromBackgroundScript.listenToContentScript("ENABLE_CONTEXT_MENU", () => {
    setupContextMenu();
    return Promise.resolve();
});

FromBackgroundScript.listenToContentScript("DISABLE_CONTEXT_MENU", () => {
    tearDownContextMenu();
    return Promise.resolve();
});

setUpClickListener();

function setUpClickListener() {
    chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => {
        if (!contextMenuEnabled) {
            return;
        }
        
        (async () => {
            const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
            
            const response = await FromBackgroundScript.sendToContentScript<LinksResponse>(tab.id, "CONTEXT_MENU_CLICKED");

            if (response?.success !== true) {
                console.error("Content script had some issues retrieving links");
            } else {
                openNewTabs(response.links);
            }
        })();

        return true;
    });
}


function setupContextMenu() {
    if (contextMenuEnabled) {
        return;
    }
    
    chrome.contextMenus.create({
        id: "1",
        title: "Open links in new tabs",
        contexts: ['selection']
    });

    contextMenuEnabled = true;
}

function tearDownContextMenu() {
    if (contextMenuEnabled) {
        chrome.contextMenus.removeAll();
        contextMenuEnabled = false;
    }
}

function openNewTabs(links: string[]) {
    links.map(url => {
        chrome.tabs.create(
            {
                active: false,
                url
            }
        );
    });
}