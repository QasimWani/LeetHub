function handleMessage(request, sender, sendResponse) {
    console.log(request, sendResponse);
    if(request && request.closeWebPage == true && request.isSuccess == true)
    {
        chrome.storage.sync.set({"leethub_token": request.token}, (data)=>{
            console.log("successfully set token for user");
            window['localStorage'][this.KEY] = request.token;
        });
        /* Close pipe */
        chrome.storage.sync.set({"pipe_leethub": false}, data=>{
            console.log("Closed pipe.");
        });

        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.remove(tab.id);
        });
        /* Create template for UX */
        let url_onboarding = "chrome-extension://oipbbaikfkcbnfcnjapepjlpfhpchedj/welcome.html";
        chrome.tabs.create({url: url_onboarding, selected: true}); //creates new tab
    }
    else if(request && request.closeWebPage == true && request.isSuccess == true)
    {
        alert("Something went wrong while trying to authenticate your profile!");
        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.remove(tab.id);
        });
    }
}

chrome.runtime.onMessage.addListener(handleMessage);