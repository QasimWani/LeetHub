/* 
    NEEDS PATCH 
    IMPLEMENTATION OF AUTHENTICATION ROUTE AFTER REDIRECT FROM GITHUB.
*/

var local_auth = {

    /**
     * Initialize
     */
    init: function() {
        
        this.KEY = "leethub_token";
        this.ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
        this.AUTHORIZATION_URL = "https://github.com/login/oauth/authorize";
        this.CLIENT_ID = "dfd9ce341261c6123142";
        this.CLIENT_SECRET = "efc7bca92d585980323ee40822df077fec59882a";
        this.REDIRECT_URL = "https://github.com";
        this.SCOPES = ['repo'];
    },

    /**
     * Parses Access Code
     * 
     * @param url The url containing the access code.
     */	
    parseAccessCode: function(url) {
        if(url.match(/\?error=(.+)/)) {
            chrome.tabs.getCurrent(function(tab) {
                chrome.tabs.remove(tab.id, function(){});
            });
        }
        else {
            this.requestToken(url.match(/\?code=([\w\/\-]+)/)[1]);
        }
    },

    /**
     * Request Token
     * 
     * @param code The access code returned by provider.
     */
    requestToken: function(code) {
        var that = this;
        var data = new FormData();
        data.append('client_id', this.CLIENT_ID);
        data.append('client_secret', this.CLIENT_SECRET);
        data.append('code', code); 

        var xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', function(event) {
            if(xhr.readyState == 4) {
                if(xhr.status == 200) {
                    that.finish(xhr.responseText.match(/access_token=([^&]*)/)[1]);
                }
                else {
                    chrome.runtime.sendMessage({
                        closeWebPage: true,
                        isSuccess: false
                      });
                }
            }
        });
        xhr.open('POST', this.ACCESS_TOKEN_URL, true);
        xhr.send(data);
    },

    /**
     * Finish
     * 
     * @param token The OAuth2 token given to the application from the provider.
     */
    finish: function(token) {
        try {
            chrome.storage.sync.set({"leethub_token": token}, (data)=>{
                window['localStorage'][this.KEY] = token;
            });
        }
        catch(error) {}
        chrome.runtime.sendMessage({
            closeWebPage: true,
            isSuccess: true,
            token: token
          });
    },
    /**
     * Get Token
     * 
     * @return OAuth2 access token if it exists, null if not.
     */
    getToken: function() {
        try {
            return window['localStorage'][this.KEY];
        }
        catch(error) {
            return null;
        }
    },

    /**
     * Delete Token
     * 
     * @return True if token is removed from localStorage, false if not.
     */
    deleteToken: function() {
        try {
            delete window['localStorage'][this.KEY];
            return true;
        }
        catch(error) {
            return false;
        }
    },
};

local_auth.init(); //load params.
var link = window.location.href;

// if(local_auth.getToken() != null)
// {
//     // To validate user, load user object from GitHub.
//     const AUTHENTICATION_URL = "https://api.github.com/user";

//     var xhr = new XMLHttpRequest();
//         xhr.addEventListener('readystatechange', function(event) {
//             console.log(xhr);
//             if(xhr.readyState == 4) {
//                 if(xhr.status == 200) {
//                     console.log(xhr.responseText);
//                 }
//             }
//         });
//         xhr.open('GET', AUTHENTICATION_URL, true);
//         xhr.setRequestHeader("Authorization", local_auth.getToken());
//         xhr.send();
// }

/* Check for open pipe */
chrome.storage.sync.get("pipe_leethub", data=>{
    console.log(data);
    if(data && data.pipe_leethub)
    {
        local_auth.parseAccessCode(link);
    }
});