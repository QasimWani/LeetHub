function handleMessage(request) {
  if (
    request &&
    request.closeWebPage === true &&
    request.isSuccess === true
  ) {
    /* Set username */
    chrome.storage.local.set(
      { BaekjunHub_username: request.username },
      () => {
        window.localStorage.BaekjunHub_username = request.username;
      },
    );

    /* Set token */
    chrome.storage.local.set({ BaekjunHub_token: request.token }, () => {
      window.localStorage[request.KEY] = request.token;
    });

    /* Close pipe */
    chrome.storage.local.set({ pipe_BaekjunHub: false }, () => {
      console.log('Closed pipe.');
    });

    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.remove(tab.id);
    });

    /* Go to onboarding for UX */
    const urlOnboarding = `chrome-extension://${chrome.runtime.id}/welcome.html`;
    chrome.tabs.create({ url: urlOnboarding, selected: true }); // creates new tab
  } else if (
    request &&
    request.closeWebPage === true &&
    request.isSuccess === true
  ) {
    alert(
      'Something went wrong while trying to authenticate your profile!',
    );
    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.remove(tab.id);
    });
  }
}

chrome.runtime.onMessage.addListener(handleMessage);
