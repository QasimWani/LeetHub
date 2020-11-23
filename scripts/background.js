function handleMessage(request, sender, sendResponse) {
    if(request && request.closeWebPage == true && request.isSuccess == true)
    {
        /* Set username */
        chrome.storage.sync.set({"leethub_username": request.username}, (data)=>{
            window['localStorage']['leethub_username'] = request.username;
        });
        
        /* Set token */
        chrome.storage.sync.set({"leethub_token": request.token}, (data)=>{
            window['localStorage'][request.KEY] = request.token;
        });

        /* Close pipe */
        chrome.storage.sync.set({"pipe_leethub": false}, data=>{
            console.log("Closed pipe.");
        });

        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.remove(tab.id);
        });

        /* Go to onboarding for UX */
        let url_onboarding = `chrome-extension://${chrome.runtime.id}/welcome.html`;
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