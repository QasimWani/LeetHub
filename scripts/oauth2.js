/*
* oauth2-chrome-extensions
* <https://github.com/jjNford/oauth2-chrome-extensions>
* 
* Copyright (C) 2012, JJ Ford (jj.n.ford@gmail.com)
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy of
* this software and associated documentation files (the "Software"), to deal in
* the Software without restriction, including without limitation the rights to
* use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
* of the Software, and to permit persons to whom the Software is furnished to do
* so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
* 
* This is a streamlined version of Boris Smus solution (Aapache License v2.0).
* <https://github.com/borismus/oauth2-extensions>
* 
* <http://oauth.net/2/>
* 
*/
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