/**
 * @jest-environment jsdom
 */

/* Mock chrome storage API */
const mockSet = jest.fn();
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
    create: jest.fn(),
    getSelected: jest.fn(),
    remove: jest.fn(),
    getCurrent: jest.fn(),
  },
};
global.chrome = chrome;

/* Mock jQuery */
const mockJQuery = {
  hide: jest.fn().mockReturnThis(),
  show: jest.fn().mockReturnThis(),
  text: jest.fn().mockReturnThis(),
  html: jest.fn().mockReturnThis(),
  val: jest.fn().mockReturnThis(),
  attr: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  focus: jest.fn().mockReturnThis(),
};
global.$ = jest.fn(() => mockJQuery);

/* Extract linkStatusCode from welcome.js */
const linkStatusCode = (status, name) => {
  let bool = false;
  switch (status) {
    case 301:
      $('#success').hide();
      $('#error').html(
        `Error linking <a target="blank" href="${`https://github.com/${name}`}">${name}</a> to LeetHub. <br> This repository has been moved permenantly. Try creating a new one.`,
      );
      $('#error').show();
      break;

    case 403:
      $('#success').hide();
      $('#error').html(
        `Error linking <a target="blank" href="${`https://github.com/${name}`}">${name}</a> to LeetHub. <br> Forbidden action. Please make sure you have the right access to this repository.`,
      );
      $('#error').show();
      break;

    case 404:
      $('#success').hide();
      $('#error').html(
        `Error linking <a target="blank" href="${`https://github.com/${name}`}">${name}</a> to LeetHub. <br> Resource not found. Make sure you enter the right repository name.`,
      );
      $('#error').show();
      break;

    default:
      bool = true;
      break;
  }
  $('#unlink').show();
  return bool;
};

/* Extract statusCode from welcome.js */
const statusCode = (res, status, name) => {
  switch (status) {
    case 304:
      $('#success').hide();
      $('#error').text(
        `Error creating ${name} - Unable to modify repository. Try again later!`,
      );
      $('#error').show();
      break;

    case 400:
      $('#success').hide();
      $('#error').text(
        `Error creating ${name} - Bad POST request, make sure you're not overriding any existing scripts`,
      );
      $('#error').show();
      break;

    case 401:
      $('#success').hide();
      $('#error').text(
        `Error creating ${name} - Unauthorized access to repo. Try again later!`,
      );
      $('#error').show();
      break;

    case 403:
      $('#success').hide();
      $('#error').text(
        `Error creating ${name} - Forbidden access to repository. Try again later!`,
      );
      $('#error').show();
      break;

    case 422:
      $('#success').hide();
      $('#error').text(
        `Error creating ${name} - Unprocessable Entity. Repository may have already been created. Try Linking instead (select 2nd option).`,
      );
      $('#error').show();
      break;

    default:
      /* Change mode type to commit */
      chrome.storage.local.set({ mode_type: 'commit' }, () => {
        $('#error').hide();
        $('#success').html(
          `Successfully created <a target="blank" href="${res.html_url}">${name}</a>. Start <a href="http://leetcode.com">LeetCoding</a>!`,
        );
        $('#success').show();
        $('#unlink').show();
      });
      /* Set Repo Hook */
      chrome.storage.local.set(
        { leethub_hook: res.full_name },
        () => {},
      );
      break;
  }
};

/* ============================================================
   TESTS
   ============================================================ */

describe('linkStatusCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return false and show error for 301 (moved permanently)', () => {
    const result = linkStatusCode(301, 'user/repo');
    expect(result).toBe(false);
    expect(mockJQuery.hide).toHaveBeenCalled();
    expect(mockJQuery.show).toHaveBeenCalled();
  });

  test('should return false and show error for 403 (forbidden)', () => {
    const result = linkStatusCode(403, 'user/repo');
    expect(result).toBe(false);
  });

  test('should return false and show error for 404 (not found)', () => {
    const result = linkStatusCode(404, 'user/repo');
    expect(result).toBe(false);
  });

  test('should return true for successful status codes (default case)', () => {
    const result = linkStatusCode(200, 'user/repo');
    expect(result).toBe(true);
  });

  test('should return true for 201 status', () => {
    const result = linkStatusCode(201, 'user/repo');
    expect(result).toBe(true);
  });

  test('should always show unlink button', () => {
    linkStatusCode(200, 'user/repo');
    expect(global.$).toHaveBeenCalledWith('#unlink');
    expect(mockJQuery.show).toHaveBeenCalled();
  });

  test('error message should contain repo name for 301', () => {
    linkStatusCode(301, 'testuser/my-leetcode');
    expect(mockJQuery.html).toHaveBeenCalledWith(
      expect.stringContaining('testuser/my-leetcode'),
    );
  });

  test('error message should contain repo name for 403', () => {
    linkStatusCode(403, 'testuser/my-leetcode');
    expect(mockJQuery.html).toHaveBeenCalledWith(
      expect.stringContaining('testuser/my-leetcode'),
    );
  });

  test('error message should contain repo name for 404', () => {
    linkStatusCode(404, 'testuser/my-leetcode');
    expect(mockJQuery.html).toHaveBeenCalledWith(
      expect.stringContaining('testuser/my-leetcode'),
    );
  });

  test('error message should contain GitHub link for 301', () => {
    linkStatusCode(301, 'user/repo');
    expect(mockJQuery.html).toHaveBeenCalledWith(
      expect.stringContaining('https://github.com/user/repo'),
    );
  });
});

describe('statusCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show error for 304 status', () => {
    statusCode({}, 304, 'my-repo');
    expect(mockJQuery.hide).toHaveBeenCalled();
    expect(mockJQuery.text).toHaveBeenCalledWith(
      expect.stringContaining('Unable to modify repository'),
    );
    expect(mockJQuery.show).toHaveBeenCalled();
  });

  test('should show error for 400 status', () => {
    statusCode({}, 400, 'my-repo');
    expect(mockJQuery.text).toHaveBeenCalledWith(
      expect.stringContaining('Bad POST request'),
    );
  });

  test('should show error for 401 status', () => {
    statusCode({}, 401, 'my-repo');
    expect(mockJQuery.text).toHaveBeenCalledWith(
      expect.stringContaining('Unauthorized access'),
    );
  });

  test('should show error for 403 status', () => {
    statusCode({}, 403, 'my-repo');
    expect(mockJQuery.text).toHaveBeenCalledWith(
      expect.stringContaining('Forbidden access'),
    );
  });

  test('should show error for 422 status', () => {
    statusCode({}, 422, 'my-repo');
    expect(mockJQuery.text).toHaveBeenCalledWith(
      expect.stringContaining('Unprocessable Entity'),
    );
  });

  test('should set mode_type to commit on success (default case)', () => {
    const res = {
      html_url: 'https://github.com/user/repo',
      full_name: 'user/repo',
    };
    statusCode(res, 200, 'my-repo');

    expect(mockSet).toHaveBeenCalledWith(
      { mode_type: 'commit' },
      expect.any(Function),
    );
  });

  test('should set repo hook on success', () => {
    const res = {
      html_url: 'https://github.com/user/repo',
      full_name: 'user/repo',
    };
    statusCode(res, 200, 'my-repo');

    expect(mockSet).toHaveBeenCalledWith(
      { leethub_hook: 'user/repo' },
      expect.any(Function),
    );
  });

  test('error messages should include repo name', () => {
    statusCode({}, 304, 'leetcode-solutions');
    expect(mockJQuery.text).toHaveBeenCalledWith(
      expect.stringContaining('leetcode-solutions'),
    );
  });

  test('should not set chrome storage on error status codes', () => {
    statusCode({}, 304, 'my-repo');
    expect(mockSet).not.toHaveBeenCalled();

    statusCode({}, 400, 'my-repo');
    expect(mockSet).not.toHaveBeenCalled();

    statusCode({}, 401, 'my-repo');
    expect(mockSet).not.toHaveBeenCalled();
  });
});
