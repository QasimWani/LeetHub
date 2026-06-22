/**
 * @jest-environment jsdom
 */

/* Mock chrome API */
const mockSet = jest.fn();
const mockGetSelected = jest.fn();
const mockRemove = jest.fn();
const mockGetURL = jest.fn(
  (path) => `chrome-extension://fake-id/${path}`,
);
const mockCreate = jest.fn();

const chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: mockSet,
    },
    sync: {
      get: jest.fn(),
    },
  },
  runtime: {
    getURL: mockGetURL,
    onMessage: { addListener: jest.fn() },
    sendMessage: jest.fn(),
  },
  tabs: {
    create: mockCreate,
    getSelected: mockGetSelected,
    remove: mockRemove,
    getCurrent: jest.fn(),
  },
};
global.chrome = chrome;

/* Extract handleMessage from background.js */
/* eslint-disable no-console, no-alert, func-names */
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
    chrome.tabs.create({ url: urlOnboarding, active: true });
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

/* ============================================================
   TESTS
   ============================================================ */

describe('handleMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should set username in storage on successful auth', () => {
    const request = {
      closeWebPage: true,
      isSuccess: true,
      username: 'testuser',
      token: 'test-token-123',
      KEY: 'leethub_token',
    };

    handleMessage(request);

    expect(mockSet).toHaveBeenCalledWith(
      { leethub_username: 'testuser' },
      expect.any(Function),
    );
  });

  test('should set token in storage on successful auth', () => {
    const request = {
      closeWebPage: true,
      isSuccess: true,
      username: 'testuser',
      token: 'test-token-123',
      KEY: 'leethub_token',
    };

    handleMessage(request);

    expect(mockSet).toHaveBeenCalledWith(
      { leethub_token: 'test-token-123' },
      expect.any(Function),
    );
  });

  test('should close the pipe on successful auth', () => {
    const request = {
      closeWebPage: true,
      isSuccess: true,
      username: 'testuser',
      token: 'test-token-123',
      KEY: 'leethub_token',
    };

    handleMessage(request);

    expect(mockSet).toHaveBeenCalledWith(
      { pipe_leethub: false },
      expect.any(Function),
    );
  });

  test('should close current tab on successful auth', () => {
    const request = {
      closeWebPage: true,
      isSuccess: true,
      username: 'testuser',
      token: 'test-token-123',
      KEY: 'leethub_token',
    };

    handleMessage(request);

    expect(mockGetSelected).toHaveBeenCalledWith(
      null,
      expect.any(Function),
    );
  });

  test('should open welcome page on successful auth', () => {
    const request = {
      closeWebPage: true,
      isSuccess: true,
      username: 'testuser',
      token: 'test-token-123',
      KEY: 'leethub_token',
    };

    handleMessage(request);

    expect(mockGetURL).toHaveBeenCalledWith('welcome.html');
    expect(mockCreate).toHaveBeenCalledWith({
      url: 'chrome-extension://fake-id/welcome.html',
      active: true,
    });
  });

  test('should do nothing when request is null', () => {
    handleMessage(null);
    expect(mockSet).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  test('should do nothing when request is undefined', () => {
    handleMessage(undefined);
    expect(mockSet).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  test('should do nothing when closeWebPage is false', () => {
    const request = {
      closeWebPage: false,
      isSuccess: true,
      username: 'testuser',
      token: 'test-token-123',
    };

    handleMessage(request);
    expect(mockSet).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  test('should do nothing when isSuccess is false', () => {
    const request = {
      closeWebPage: true,
      isSuccess: false,
      username: 'testuser',
      token: 'test-token-123',
    };

    handleMessage(request);
    expect(mockSet).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  test('should handle request with missing username gracefully', () => {
    const request = {
      closeWebPage: true,
      isSuccess: true,
      token: 'test-token-123',
      KEY: 'leethub_token',
    };

    handleMessage(request);

    expect(mockSet).toHaveBeenCalledWith(
      { leethub_username: undefined },
      expect.any(Function),
    );
  });
});
