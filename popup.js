var action = false;

$("#authenticate").on('click', ()=>{
    if(action)
    {
        oAuth2.begin();
    }
});

/* Get URL for welcome page */
$("#welcome_URL").attr("href", `chrome-extension://${chrome.runtime.id}/welcome.html`);
$("#hook_URL").attr("href", `chrome-extension://${chrome.runtime.id}/welcome.html`);

chrome.storage.sync.get("leethub_token", (data)=>{
    const token = data.leethub_token;
    if(token == null || token == undefined)
    {
        action = true;
        $("#auth_mode").show();
    }
    else
    {
        // To validate user, load user object from GitHub.
        const AUTHENTICATION_URL = "https://api.github.com/user";
        
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', function(event) {
            if(xhr.readyState == 4) {
                if(xhr.status == 200) {
                    /* Show MAIN FEATURES */
                    chrome.storage.sync.get("mode_type", data=>{
                        if(data && data.mode_type == "commit")
                        {
                            $("#commit_mode").show();
                            /* Get problems solved count */
                            chrome.storage.sync.get("stats", psolved=>{
                                psolved = psolved.stats;
                                if(psolved && psolved["solved"])
                                {
                                    $("#p_solved").text(psolved["solved"]); 
                                }
                            });
                        }
                        else
                        {
                            $("#hook_mode").show();
                        }
                    });
                }
                else if(xhr.status == 401) //bad oAuth
                {
                    //reset token and redirect to authorization process again!
                    chrome.storage.sync.set({"leethub_token": null}, data=>{
                        console.log("BAD oAuth!!! Redirecting back to oAuth process");
                        action = true;
                        $("#auth_mode").show();
                    });
                }
            }
        });
        xhr.open('GET', AUTHENTICATION_URL, true);
        xhr.setRequestHeader("Authorization", `token ${token}`);
        xhr.send();
    }
    
});