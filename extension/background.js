// Create an ID for each screenshot
let id = 0;

// Listen for messages from the webpage
window.addEventListener("message", (event) => {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    if (event.data.type && event.data.type === "CAPTURE_SCREENSHOT") {
        console.log("Content script received currentIndex: " + event.data.payload.currentIndex);
        
        // Trigger screenshot capture
        chrome.tabs.captureVisibleTab(null, {}, (screenshotUrl) => {
            // We'll just log the screenshot for now.
            // You need to handle this screenshot URL according to your needs.
            console.log(screenshotUrl);
        });
    }
}, false);
