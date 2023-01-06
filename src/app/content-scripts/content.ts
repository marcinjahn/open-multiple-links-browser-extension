import {getLinksFromSelection, selectionContainsLinks} from "../utils/selection";
import {LinksResponse} from "../models/links-response";
import {FromContentScript} from "../utils/communication";

let contextMenuEnabled = false;

document.onmouseup = async () => {
    if (selectionContainsLinks()) {
        await enableContextMenu();
    } else if (contextMenuEnabled) {
        await disableContextMenu();
    }
};

FromContentScript.listenToBackground("CONTEXT_MENU_CLICKED", async () => {
    let response: LinksResponse;
    
    try {
        const links = getLinksFromSelection();
        response = { success: true, links };
    } catch(_) {
        response = { success: false };
    }
    
    return response;
});

async function enableContextMenu() {
    if (contextMenuEnabled) {
        return;
    }

    await FromContentScript.sendToBackground("ENABLE_CONTEXT_MENU");
    contextMenuEnabled = true;
}

async function disableContextMenu() {
    if (!contextMenuEnabled) {
        return;
    }

    await FromContentScript.sendToBackground("DISABLE_CONTEXT_MENU");
    contextMenuEnabled = false;
}