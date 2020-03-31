import { debug, MESSAGES, modifyPage } from "lumos-shared-js";
import { loadOrUpdateDrawer } from "./drawer";
import { loadOrUpdateSidebar } from "./sidebar";
import {loadHiddenMessenger, nativeBrowserPostMessageToReactApp, nativeBrowserAddReactAppListener } from "./messenger";

debug("executing content script on", location.href)
function main(window: Window, document: Document, location: Location): void {
    // mutates document
    handleUrlUpdated(window, document, new URL(location.href))
}

function handleUrlUpdated(window: Window, document: Document, url: URL): void {
    debug("function call - handleUrlUpdated:", url)
    
    // load or update the drawer
    loadOrUpdateDrawer(document, url)
    // load or update the sidebar
    loadOrUpdateSidebar(document, url)

    document.addEventListener("DOMContentLoaded", () => { 
        debug("DOMContentLoaded:", url)
        // hidden messenger component to fetch data from react app
        loadHiddenMessenger(url, document, window)
        // load or update inline content            
        nativeBrowserPostMessageToReactApp({"command": "isUserLoggedIn", "data": {}})
        nativeBrowserAddReactAppListener({
            "window": window,
            "message": "isUserLoggedIn",
            "callback": (msg) => {
                let data = msg.data;
                console.log('isUserLoggedIn', data)
                localStorage.setItem('user', data.user);
                localStorage.setItem('userMemberships', data.memberships);
            }
        })
        modifyPage(url, window, document, nativeBrowserPostMessageToReactApp, nativeBrowserAddReactAppListener)
    }, false)
    
}

debug("messages - setting up listener for bg messages")
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    debug("message received from background: ", msg.message)
    if (msg.message === MESSAGES.BROWSERBG_BROWSERFG_URL_UPDATED) {
        handleUrlUpdated(window, document, new URL(msg.data.url))
    } else {
        sendResponse('Color message is none.');
    }
});

// Structure of the content script
// Loads a sidebar hidden
// Loads a drawer hidden

// Whenever the url changes (sync or async), calls APIs drawer and sidebar
// When sidebar API returns true, 

main(window, document, location);
