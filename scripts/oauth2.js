/* global LEETHUB_CLIENT_ID, LEETHUB_CLIENT_SECRET */
// eslint-disable-next-line no-unused-vars
const oAuth2 = {
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
   * Begin
   */
  begin() {
    this.init();

    const state = crypto.getRandomValues(new Uint32Array(2)).join('');
    chrome.storage.local.set({ leethub_oauth_state: state });

    let url = `${this.AUTHORIZATION_URL}?client_id=${
      this.CLIENT_ID
    }&redirect_uri=${encodeURIComponent(this.REDIRECT_URL)}&scope=`;

    for (let i = 0; i < this.SCOPES.length; i += 1) {
      url += this.SCOPES[i];
    }
    url += `&state=${state}`;

    chrome.storage.local.set({ pipe_leethub: true }, () => {
      chrome.tabs.create({ url, active: true }, function () {
        window.close();
        chrome.tabs.getCurrent(function (tab) {
          chrome.tabs.remove(tab.id, function () {});
        });
      });
    });
  },
};
