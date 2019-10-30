var tabId = null;
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log('inininin')
        console.log(request);

        new Promise(function (reslove, reject) {
            chrome.tabs.query({ url: 'http://211.156.200.95:8081/*' }, function (tabs) {
                reslove(tabs);
            })
        }).then(tabs => {
            chrome.tabs.sendMessage(tabs[0].id, request, function (response) {
                console.log(response);
                sendResponse(response);
            });
        });
        return true;  // indicat async

    });

