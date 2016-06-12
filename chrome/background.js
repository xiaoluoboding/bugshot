chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.getSelected(null, function (tab) {
        openBugShot(tab);
    });
});
chrome.commands.onCommand.addListener(function (command) {
    if(command == 'toggle-bugshot-on') {
        chrome.tabs.getSelected(null, function (tab) {
            openBugShot(tab);
        });
    }
});

function openBugShot(tab) {
    chrome.tabs.captureVisibleTab(null, {
        format: "png"
    }, function (data) {
        localStorage.setItem("screenshot", data);
        chrome.tabs.create({
            index: tab.index + 1,
            url: "common/editor.html"
        }, function (tab) {
            // DOES NOTHING FOR NOW
        });
    });
}
