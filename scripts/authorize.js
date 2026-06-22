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
    this.CLIENT_ID = 'beb4f0aa19ab8faf5004';
    this.CLIENT_SECRET = '843f835609c7ef02ef0f2f1645bc49514c0e65a6';
    this.REDIRECT_URL = 'https://github.com/'; // for example, https://github.com
    this.SCOPES = ['repo'];
  },

  /**
   * Parses Access Code
   *
   * @param url The url containing the access code.
   */
  parseAccessCode(url) {
    if (url.match(/\?error=(.+)/)) {
      const errorMatch = url.match(/\?error=([^&]+)/);
      console.error(
        'LeetHub: GitHub OAuth error:',
        errorMatch ? decodeURIComponent(errorMatch[1]) : 'unknown',
      );
      alert(
        'GitHub authorization was denied or failed. Please try again.',
      );
      chrome.tabs.getCurrent(function (tab) {
        chrome.tabs.remove(tab.id, function () {});
      });
    } else {
      const codeMatch = url.match(/\?code=([\w\/\-]+)/);
      if (!codeMatch) {
        console.error(
          'LeetHub: could not extract access code from URL:',
          url,
        );
        return;
      }
      // eslint-disable-next-line
      this.requestToken(codeMatch[1]);
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
          const tokenMatch = xhr.responseText.match(
            /access_token=([^&]*)/,
          );
          if (!tokenMatch) {
            console.error(
              'LeetHub: access_token not found in OAuth response',
            );
            chrome.runtime.sendMessage({
              closeWebPage: true,
              isSuccess: false,
              error: 'access_token not found in response',
            });
            return;
          }
          that.finish(tokenMatch[1]);
        } else {
          console.error(
            `LeetHub: token request failed with status ${xhr.status}:`,
            xhr.responseText,
          );
          chrome.runtime.sendMessage({
            closeWebPage: true,
            isSuccess: false,
            error: `Token request failed (HTTP ${xhr.status})`,
          });
        }
      }
    });
    xhr.addEventListener('error', function () {
      console.error('LeetHub: network error during token request');
      chrome.runtime.sendMessage({
        closeWebPage: true,
        isSuccess: false,
        error: 'Network error during token request',
      });
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
    /* Get username */
    // To validate user, load user object from GitHub.
    const AUTHENTICATION_URL = 'https://api.github.com/user';

    const xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let username;
          try {
            username = JSON.parse(xhr.responseText).login;
          } catch (e) {
            console.error(
              'LeetHub: failed to parse GitHub user response:',
              e,
            );
            chrome.runtime.sendMessage({
              closeWebPage: true,
              isSuccess: false,
              error: 'Failed to parse user profile response',
            });
            return;
          }
          chrome.runtime.sendMessage({
            closeWebPage: true,
            isSuccess: true,
            token,
            username,
            KEY: this.KEY,
          });
        } else {
          console.error(
            `LeetHub: GitHub user validation failed (HTTP ${xhr.status}):`,
            xhr.responseText,
          );
          chrome.runtime.sendMessage({
            closeWebPage: true,
            isSuccess: false,
            error: `User validation failed (HTTP ${xhr.status})`,
          });
        }
      }
    });
    xhr.addEventListener('error', function () {
      console.error('LeetHub: network error validating GitHub user');
      chrome.runtime.sendMessage({
        closeWebPage: true,
        isSuccess: false,
        error: 'Network error validating user',
      });
    });
    xhr.open('GET', AUTHENTICATION_URL, true);
    xhr.setRequestHeader('Authorization', `token ${token}`);
    xhr.send();
  },
};

localAuth.init(); // load params.
const link = window.location.href;

/* Check for open pipe */
if (window.location.host === 'github.com') {
  chrome.storage.local.get('pipe_leethub', (data) => {
    if (data && data.pipe_leethub) {
      localAuth.parseAccessCode(link);
    }
  });
}
