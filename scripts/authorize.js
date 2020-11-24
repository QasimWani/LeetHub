/* 
    (needs patch) 
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
        this.CLIENT_ID = "YOUR CLIENT ID HERE";
        this.CLIENT_SECRET = "YOUR CLIENT SECRET HERE";
        this.REDIRECT_URL = "ENTER REDIRECT URL FOR YOUR APPLICATION"; //for example, https://github.com
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
        /* Get username */
        // To validate user, load user object from GitHub.
        const AUTHENTICATION_URL = "https://api.github.com/user";
        
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', function(event) {
            if(xhr.readyState == 4) {
                if(xhr.status == 200) {
                    let username = JSON.parse(xhr.responseText)['login'];
                    chrome.runtime.sendMessage({
                        closeWebPage: true,
                        isSuccess: true,
                        token: token,
                        username: username,
                        KEY: this.KEY
                      });
                }
            }
        });
        xhr.open('GET', AUTHENTICATION_URL, true);
        xhr.setRequestHeader("Authorization", `token ${token}`);
        xhr.send();
    }
};

local_auth.init(); //load params.
var link = window.location.href;

/* Check for open pipe */
if(window.location.host == "github.com")
{
    chrome.storage.sync.get("pipe_leethub", data=>{
        if(data && data.pipe_leethub)
        {
            local_auth.parseAccessCode(link);
        }
    });
}
