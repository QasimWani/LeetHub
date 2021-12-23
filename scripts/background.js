function setDayCounter(start_date) {
  const end_date = new Date();
  const one_day = 1000*60*60*24;
  const days = Math.ceil( (Math.abs(end_date.setHours(0,0,0,0) - start_date.setHours(0,0,0,0)) / one_day ));

  chrome.storage.local.get(['show_badge'], (result) => {
    if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
    } 
    else {
      const show_badge = result['show_badge'];
      if (show_badge === true){
        chrome.browserAction.setBadgeText({text: String(days) });
      }
    }
  });
}

function countDays(){
  chrome.storage.local.get(['start_date'], (result) => {
    if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
    } 
    else {
      const storedJSONDate = result['start_date'];
      console.log('storedJSONDate' + storedJSONDate);
      setDayCounter(new Date(storedJSONDate));
    }
  });
};

function handleMessage(request) {
  if (
    request &&
    request.closeWebPage === true &&
    request.isSuccess === true
  ) {
    /* Set username */
    chrome.storage.local.set(
      { leethub_username: request.username },
      () => {
        window.localStorage.leethub_username = request.username;
      },
    );

    /* Set token */
    chrome.storage.local.set({ leethub_token: request.token }, () => {
      window.localStorage[request.KEY] = request.token;
    });

    /* Close pipe */
    chrome.storage.local.set({ pipe_leethub: false }, () => {
      console.log('Closed pipe.');
    });

    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.remove(tab.id);
    });

    /* Go to onboarding for UX */
    const urlOnboarding = chrome.runtime.getURL('welcome.html');
    chrome.tabs.create({ url: urlOnboarding, active: true }); // creates new tab
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

countDays();
chrome.alarms.create('alaram-set-end-date', {
  periodInMinutes: 1
});
chrome.runtime.onMessage.addListener(handleMessage);
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "alaram-set-end-date") {
    countDays();
  }
});