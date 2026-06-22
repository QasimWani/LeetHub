/* global LEETHUB_CLIENT_ID, LEETHUB_CLIENT_SECRET */
/* 
    (needs patch) 
    IMPLEMENTATION OF AUTHENTICATION ROUTE AFTER REDIRECT FROM GITHUB.
*/

const localAuth = {
  /**
   * Initialize
   */
  init() {
    this.KEY = 'leethub_token';
    this.ACCESS_TOKEN_URL =
      'https://github.com/login/oauth/access_token';
    this.AUTHORIZATION_URL =
      'https://github.com/login/oauth/authorize';
    this.CLIENT_ID =
      typeof LEETHUB_CLIENT_ID !== 'undefined'
        ? LEETHUB_CLIENT_ID
        : 'SET_YOUR_CLIENT_ID';
    this.CLIENT_SECRET =
      typeof LEETHUB_CLIENT_SECRET !== 'undefined'
        ? LEETHUB_CLIENT_SECRET
        : 'SET_YOUR_CLIENT_SECRET';
    this.REDIRECT_URL = 'https://github.com/';
    this.SCOPES = ['repo'];
  },

  /**
   * Parses Access Code
   *
   * @param url The url containing the access code.
   */
  parseAccessCode(url) {
    if (url.match(/\?error=(.+)/)) {
      chrome.tabs.getCurrent(function (tab) {
        chrome.tabs.remove(tab.id, function () {});
      });
    } else {
      const codeMatch = url.match(/\?code=([\w/-]+)/);
      const stateMatch = url.match(/[&?]state=([^&]+)/);
      if (!codeMatch) return;

      const code = codeMatch[1];
      const returnedState = stateMatch ? stateMatch[1] : null;

      chrome.storage.local.get('leethub_oauth_state', (data) => {
        const savedState = data.leethub_oauth_state;
        if (!savedState || savedState !== returnedState) {
          console.error('OAuth state mismatch — possible CSRF.');
          return;
        }
        chrome.storage.local.remove('leethub_oauth_state');
        this.requestToken(code);
      });
    }
  },

  /**
   * Request Token
   *
   * @param code The access code returned by provider.
   */
  requestToken(code) {
    const that = this;
    const data = new FormData();
    data.append('client_id', this.CLIENT_ID);
    data.append('client_secret', this.CLIENT_SECRET);
    data.append('code', code);

    const xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          that.finish(
            xhr.responseText.match(/access_token=([^&]*)/)[1],
          );
        } else {
          chrome.runtime.sendMessage({
            closeWebPage: true,
            isSuccess: false,
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
  finish(token) {
    const AUTHENTICATION_URL = 'https://api.github.com/user';

    const xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const username = JSON.parse(xhr.responseText).login;
          chrome.runtime.sendMessage({
            closeWebPage: true,
            isSuccess: true,
            token,
            username,
            KEY: 'leethub_token',
          });
        }
      }
    });
    xhr.open('GET', AUTHENTICATION_URL, true);
    xhr.setRequestHeader('Authorization', `token ${token}`);
    xhr.send();
  },
};

localAuth.init();
const link = window.location.href;

/* Check for open pipe */
if (window.location.host === 'github.com') {
  chrome.storage.local.get('pipe_leethub', (data) => {
    if (data && data.pipe_leethub) {
      localAuth.parseAccessCode(link);
    }
  });
}
