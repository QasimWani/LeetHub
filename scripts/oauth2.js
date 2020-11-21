var oAuth2 = {

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
     * Begin
     */
    begin: function() {
        this.init(); //secure token params.

        var url = this.AUTHORIZATION_URL + "?client_id=" + this.CLIENT_ID + "&redirect_uri" + this.REDIRECT_URL + "&scope=";

        for(var i in this.SCOPES) {
            url += this.SCOPES[i];
        }
        chrome.storage.sync.set({"pipe_leethub" : true}, data=>{ //opening pipe temporarily
            
            chrome.tabs.create({url: url, selected: true}, function(data) {
                window.close();
                chrome.tabs.getCurrent(function(tab) {
                    chrome.tabs.remove(tab.id, function(){});
                });
            });

        });

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
                    chrome.tabs.getCurrent(function(tab) {
                        chrome.tabs.remove(tab.id, function(){});
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
            window['localStorage'][this.KEY] = token;
            // chrome.storage.sync.set({"leethub_token": token}, (data)=>{
            //     console.log("successfully set token for user");
            // });
        }
        catch(error) {}

        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.remove(tab.id, function() {});
        });
    },

    /**
     * Get Token
     * 
     * @return OAuth2 access token if it exists, null if not.
     */
    getToken: function() {
        try {
            chrome.storage.sync.get("leethub_token", (data)=>{
                return data.leethub_token;
            });
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
    }
};