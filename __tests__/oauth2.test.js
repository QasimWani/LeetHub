/**
 * @jest-environment jsdom
 */

/* Mock chrome API */
const mockSet = jest.fn();
const mockCreate = jest.fn();
const mockGetCurrent = jest.fn();
const mockRemove = jest.fn();

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
    getURL: jest.fn((path) => `chrome-extension://fake-id/${path}`),
    onMessage: { addListener: jest.fn() },
    sendMessage: jest.fn(),
  },
  tabs: {
    create: mockCreate,
    getSelected: jest.fn(),
    remove: mockRemove,
    getCurrent: mockGetCurrent,
  },
};
global.chrome = chrome;

/* Extract oAuth2 object from oauth2.js */
const oAuth2 = {
  init() {
    this.KEY = 'leethub_token';
    this.ACCESS_TOKEN_URL =
      'https://github.com/login/oauth/access_token';
    this.AUTHORIZATION_URL =
      'https://github.com/login/oauth/authorize';
    this.CLIENT_ID = 'beb4f0aa19ab8faf5004';
    this.CLIENT_SECRET = '843f835609c7ef02ef0f2f1645bc49514c0e65a6';
    this.REDIRECT_URL = 'https://github.com/';
    this.SCOPES = ['repo'];
  },

  begin() {
    this.init();

    let url = `${this.AUTHORIZATION_URL}?client_id=${this.CLIENT_ID}&redirect_uri${this.REDIRECT_URL}&scope=`;

    for (let i = 0; i < this.SCOPES.length; i += 1) {
      url += this.SCOPES[i];
    }

    chrome.storage.local.set({ pipe_leethub: true }, () => {
      // eslint-disable-next-line func-names
      chrome.tabs.create({ url, active: true }, function () {});
    });
  },
};

/* ============================================================
   TESTS
   ============================================================ */

describe('oAuth2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    test('should set KEY to leethub_token', () => {
      oAuth2.init();
      expect(oAuth2.KEY).toBe('leethub_token');
    });

    test('should set ACCESS_TOKEN_URL correctly', () => {
      oAuth2.init();
      expect(oAuth2.ACCESS_TOKEN_URL).toBe(
        'https://github.com/login/oauth/access_token',
      );
    });

    test('should set AUTHORIZATION_URL correctly', () => {
      oAuth2.init();
      expect(oAuth2.AUTHORIZATION_URL).toBe(
        'https://github.com/login/oauth/authorize',
      );
    });

    test('should set CLIENT_ID correctly', () => {
      oAuth2.init();
      expect(oAuth2.CLIENT_ID).toBe('beb4f0aa19ab8faf5004');
    });

    test('should set REDIRECT_URL correctly', () => {
      oAuth2.init();
      expect(oAuth2.REDIRECT_URL).toBe('https://github.com/');
    });

    test('should set SCOPES to repo', () => {
      oAuth2.init();
      expect(oAuth2.SCOPES).toEqual(['repo']);
    });
  });

  describe('begin', () => {
    test('should call init before proceeding', () => {
      const initSpy = jest.spyOn(oAuth2, 'init');
      oAuth2.begin();
      expect(initSpy).toHaveBeenCalled();
      initSpy.mockRestore();
    });

    test('should set pipe_leethub to true in storage', () => {
      oAuth2.begin();
      expect(mockSet).toHaveBeenCalledWith(
        { pipe_leethub: true },
        expect.any(Function),
      );
    });

    test('should construct authorization URL with client_id', () => {
      oAuth2.begin();
      // Verify that storage was set with pipe_leethub: true
      const callback = mockSet.mock.calls[0][1];
      callback(); // trigger the callback

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          active: true,
          url: expect.stringContaining(
            'client_id=beb4f0aa19ab8faf5004',
          ),
        }),
        expect.any(Function),
      );
    });

    test('should include scope in authorization URL', () => {
      oAuth2.begin();
      const callback = mockSet.mock.calls[0][1];
      callback();

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('repo'),
        }),
        expect.any(Function),
      );
    });
  });
});

describe('localAuth (authorize.js)', () => {
  /* Extract localAuth for testing */
  const localAuth = {
    init() {
      this.KEY = 'leethub_token';
      this.ACCESS_TOKEN_URL =
        'https://github.com/login/oauth/access_token';
      this.AUTHORIZATION_URL =
        'https://github.com/login/oauth/authorize';
      this.CLIENT_ID = 'beb4f0aa19ab8faf5004';
      this.CLIENT_SECRET = '843f835609c7ef02ef0f2f1645bc49514c0e65a6';
      this.REDIRECT_URL = 'https://github.com/';
      this.SCOPES = ['repo'];
    },

    parseAccessCode(url) {
      if (url.match(/\?error=(.+)/)) {
        chrome.tabs.getCurrent(function handleTab(tab) {
          chrome.tabs.remove(tab.id, function noop() {});
        });
        return null;
      }
      return url.match(/\?code=([\w/-]+)/)[1];
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localAuth.init();
  });

  describe('init', () => {
    test('should initialize with correct CLIENT_ID', () => {
      expect(localAuth.CLIENT_ID).toBe('beb4f0aa19ab8faf5004');
    });

    test('should initialize with correct ACCESS_TOKEN_URL', () => {
      expect(localAuth.ACCESS_TOKEN_URL).toBe(
        'https://github.com/login/oauth/access_token',
      );
    });
  });

  describe('parseAccessCode', () => {
    test('should extract code from URL', () => {
      const url = 'https://github.com/?code=abc123def456';
      const code = localAuth.parseAccessCode(url);
      expect(code).toBe('abc123def456');
    });

    test('should handle code with hyphens', () => {
      const url = 'https://github.com/?code=abc-123-def';
      const code = localAuth.parseAccessCode(url);
      expect(code).toBe('abc-123-def');
    });

    test('should handle code with slashes', () => {
      const url = 'https://github.com/?code=abc/123/def';
      const code = localAuth.parseAccessCode(url);
      expect(code).toBe('abc/123/def');
    });

    test('should close tab on error', () => {
      const url = 'https://github.com/?error=access_denied';
      localAuth.parseAccessCode(url);
      expect(mockGetCurrent).toHaveBeenCalled();
    });
  });
});
