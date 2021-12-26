function clearBadge() {
  chrome.browserAction.setBadgeText({
    text: '',
  });
}

function setDayCounter(startDate) {
  const endDate = new Date();
  const oneDay = 1000 * 60 * 60 * 24;
  const days = Math.ceil(
    Math.abs(
      endDate.setHours(0, 0, 0, 0) - startDate.setHours(0, 0, 0, 0),
    ) / oneDay,
  );
  chrome.browserAction.setBadgeText({ text: String(days) });
}

function removeStartDate() {
  chrome.storage.local.remove('start_date', () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    } else {
      // console.log('remove start_date from storage');
    }
  });
}

function countDaysAndShowBadge() {
  chrome.storage.local.get(['start_date', 'show_badge'], (result) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    }
    if (
      'start_date' in result &&
      result.start_date !== undefined &&
      'show_badge' in result &&
      result.show_badge === true
    ) {
      const storedJSONDate = result.start_date;
      setDayCounter(new Date(storedJSONDate));
    } else {
      clearBadge();
      removeStartDate();
    }
  });
}

function setStartDate() {
  const currentTime = new Date().toJSON();
  const items = { start_date: currentTime };
  chrome.storage.local.set(items, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    } else {
      // console.log(`set start_date:${currentTime}`);
      countDaysAndShowBadge();
    }
  });
}

function setShowBadge(startDate) {
  const items = { show_badge: startDate };
  chrome.storage.local.set(items, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    }
    // console.log(`set show_badge : ${startDate}`);
    if (startDate === true) {
      setStartDate();
    } else {
      clearBadge();
      removeStartDate();
    }
  });
}

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

    chrome.tabs.getSelected(null, (tab) => {
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
    chrome.tabs.getSelected(null, (tab) => {
      chrome.tabs.remove(tab.id);
    });
  }
}

chrome.runtime.onMessage.addListener(handleMessage);

// alaram creation for periodic update of badge
chrome.alarms.create('alaram-set-end-date', {
  periodInMinutes: 1,
});

// alarm handler
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'alaram-set-end-date') {
    countDaysAndShowBadge();
  }
});

// // storgae changes event handler log
// chrome.storage.onChanged.addListener((changes, namespace) => {
//   for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//     console.log(
//       `Storage key "${key}" in namespace "${namespace}" changed.`,
//       `Old value was "${oldValue}", new value is "${newValue}".`
//     );
//   }
// });

// chrome.storage.local[start_date] event handler to update Badge Counter
chrome.storage.onChanged.addListener((changes) => {
  if ('start_date' in changes) {
    countDaysAndShowBadge();
  }
  if ('show_badge' in changes) {
    setShowBadge(changes.show_badge.newValue);
  }
});

// on install set show_badge true
chrome.runtime.onInstalled.addListener(() => {
  setShowBadge(true);
});

// on start event listener
chrome.runtime.onStartup.addListener(() => {
  countDaysAndShowBadge();
});
