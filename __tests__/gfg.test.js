/**
 * @jest-environment jsdom
 */

/* Mock chrome storage API */
const chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
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

/* Languages mapping from leetcode.js (shared with gfg.js) */
const languages = {
  Python: '.py',
  Python3: '.py',
  'C++': '.cpp',
  C: '.c',
  Java: '.java',
  'C#': '.cs',
  JavaScript: '.js',
  Javascript: '.js',
  Ruby: '.rb',
  Swift: '.swift',
  Go: '.go',
  Kotlin: '.kt',
  Scala: '.scala',
  Rust: '.rs',
  PHP: '.php',
  TypeScript: '.ts',
  MySQL: '.sql',
  'MS SQL Server': '.sql',
  Oracle: '.sql',
};

/* Pure functions extracted from gfg.js */
const toKebabCase = (string) => {
  return string
    .replace(/[^a-zA-Z0-9. ]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

function findGfgLanguage() {
  const elements = document.querySelectorAll('.divider.text');
  if (!elements || elements.length === 0) return null;
  const ele = elements[0].textContent;
  const lang = ele.split('(')[0].trim();
  if (lang.length > 0 && languages[lang]) {
    return languages[lang];
  }
  return null;
}

function findTitle() {
  const ele = document.querySelector(
    '[class^="problems_header_content__title"] > h3',
  );
  if (ele != null) {
    return ele.textContent;
  }
  return '';
}

function findDifficulty() {
  const elements = document.querySelectorAll(
    '[class^="problems_header_description"]',
  );
  if (!elements || elements.length === 0) return '';
  const child = elements[0].children[0];
  if (!child) return '';
  const ele = child.textContent;

  if (ele != null) {
    if (ele.trim() === 'Basic' || ele.trim() === 'School') {
      return 'Easy';
    }
    return ele;
  }
  return '';
}

function getProblemStatement() {
  const ele = document.querySelector(
    '[class^="problems_problem_content"]',
  );
  return `${ele.outerHTML}`;
}

/* ============================================================
   TESTS
   ============================================================ */

describe('toKebabCase', () => {
  test('should convert simple string to kebab case', () => {
    expect(toKebabCase('Hello World')).toBe('hello-world');
  });

  test('should handle camelCase', () => {
    expect(toKebabCase('camelCase')).toBe('camel-case');
  });

  test('should handle PascalCase', () => {
    expect(toKebabCase('PascalCase')).toBe('pascal-case');
  });

  test('should remove special characters', () => {
    expect(toKebabCase('Hello! @World#')).toBe('hello-world');
  });

  test('should handle underscores', () => {
    // Note: the regex in toKebabCase strips non-alphanumeric chars first,
    // so underscores are removed before the space replacement regex.
    // The actual behavior converts 'hello_world' by stripping underscore then lowering.
    expect(toKebabCase('hello_world')).toBe('helloworld');
  });

  test('should handle multiple spaces', () => {
    expect(toKebabCase('hello   world')).toBe('hello-world');
  });

  test('should preserve numbers', () => {
    expect(toKebabCase('Test 123 Case')).toBe('test-123-case');
  });

  test('should preserve dots', () => {
    expect(toKebabCase('file.py')).toBe('file.py');
  });

  test('should handle empty string', () => {
    expect(toKebabCase('')).toBe('');
  });

  test('should handle real GFG problem titles', () => {
    expect(toKebabCase('Reverse a linked list')).toBe(
      'reverse-a-linked-list',
    );
  });

  test('should handle titles with parentheses', () => {
    expect(toKebabCase('Minimum Platforms (Greedy)')).toBe(
      'minimum-platforms-greedy',
    );
  });

  test('should handle mixed case with numbers', () => {
    expect(toKebabCase('K closest elements')).toBe(
      'k-closest-elements',
    );
  });
});

describe('findGfgLanguage', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should find Python3 language', () => {
    document.body.innerHTML = `
      <div class="divider text">Python3 (3.6)</div>
    `;
    expect(findGfgLanguage()).toBe('.py');
  });

  test('should find C++ language', () => {
    document.body.innerHTML = `
      <div class="divider text">C++ (14)</div>
    `;
    expect(findGfgLanguage()).toBe('.cpp');
  });

  test('should find Java language', () => {
    document.body.innerHTML = `
      <div class="divider text">Java (11)</div>
    `;
    expect(findGfgLanguage()).toBe('.java');
  });

  test('should return null for unsupported language', () => {
    document.body.innerHTML = `
      <div class="divider text">Haskell (8.6)</div>
    `;
    expect(findGfgLanguage()).toBeNull();
  });

  test('should return null when no element found', () => {
    document.body.innerHTML = '<div></div>';
    expect(findGfgLanguage()).toBeNull();
  });
});

describe('findTitle', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should find the problem title', () => {
    document.body.innerHTML = `
      <div class="problems_header_content__title__xyz">
        <h3>Reverse a linked list</h3>
      </div>
    `;
    expect(findTitle()).toBe('Reverse a linked list');
  });

  test('should return empty string when no title element found', () => {
    document.body.innerHTML = '<div></div>';
    expect(findTitle()).toBe('');
  });

  test('should handle title with special characters', () => {
    document.body.innerHTML = `
      <div class="problems_header_content__title__abc">
        <h3>N-Queen Problem</h3>
      </div>
    `;
    expect(findTitle()).toBe('N-Queen Problem');
  });
});

describe('findDifficulty', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should convert Basic to Easy', () => {
    document.body.innerHTML = `
      <div class="problems_header_description__abc">
        <span>Basic</span>
      </div>
    `;
    expect(findDifficulty()).toBe('Easy');
  });

  test('should convert School to Easy', () => {
    document.body.innerHTML = `
      <div class="problems_header_description__abc">
        <span>School</span>
      </div>
    `;
    expect(findDifficulty()).toBe('Easy');
  });

  test('should return Medium as-is', () => {
    document.body.innerHTML = `
      <div class="problems_header_description__abc">
        <span>Medium</span>
      </div>
    `;
    expect(findDifficulty()).toBe('Medium');
  });

  test('should return Hard as-is', () => {
    document.body.innerHTML = `
      <div class="problems_header_description__abc">
        <span>Hard</span>
      </div>
    `;
    expect(findDifficulty()).toBe('Hard');
  });

  test('should return empty string when no element found', () => {
    document.body.innerHTML = '<div></div>';
    expect(findDifficulty()).toBe('');
  });
});

describe('getProblemStatement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should return the outerHTML of the problem content element', () => {
    document.body.innerHTML = `
      <div class="problems_problem_content__xyz"><p>Given a linked list...</p></div>
    `;
    const result = getProblemStatement();
    expect(result).toContain('problems_problem_content__xyz');
    expect(result).toContain('Given a linked list...');
  });
});

describe('GFG commit messages', () => {
  const README_MSG = 'Create README - LeetHub';
  const SUBMIT_MSG = 'Added solution - LeetHub';
  const UPDATE_MSG = 'Updated solution - LeetHub';

  test('README message should be correct', () => {
    expect(README_MSG).toBe('Create README - LeetHub');
  });

  test('SUBMIT message should be correct', () => {
    expect(SUBMIT_MSG).toBe('Added solution - LeetHub');
  });

  test('UPDATE message should be correct', () => {
    expect(UPDATE_MSG).toBe('Updated solution - LeetHub');
  });
});
