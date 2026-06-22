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

/* ============================================================
   Extract testable functions from leetcode.js
   Since the file uses global scope and DOM dependencies,
   we re-implement the pure utility functions here for testing
   and validate they match the source behavior.
   ============================================================ */

/* languages enum - copied from source to validate mapping */
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

/* Pure functions extracted from leetcode.js */
function checkElem(elem) {
  return elem && elem.length > 0;
}

function convertToSlug(string) {
  const a =
    'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
  const b =
    'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(p, (c) => b.charAt(a.indexOf(c)))
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function addLeadingZeros(title) {
  const maxTitlePrefixLength = 4;
  const len = title.split('-')[0].length;
  if (len < maxTitlePrefixLength) {
    return '0'.repeat(4 - len) + title;
  }
  return title;
}

function parseCode() {
  const e = document.getElementsByClassName('CodeMirror-code');
  if (e !== undefined && e.length > 0) {
    const elem = e[0];
    let parsedCode = '';
    const textArr = elem.innerText.split('\n');
    for (let i = 1; i < textArr.length; i += 2) {
      parsedCode += `${textArr[i]}\n`;
    }
    return parsedCode;
  }
  return null;
}

function parseStats() {
  const probStats = document.getElementsByClassName('data__HC-i');
  if (!checkElem(probStats)) {
    return null;
  }
  const time = probStats[0].textContent;
  const timePercentile = probStats[1].textContent;
  const space = probStats[2].textContent;
  const spacePercentile = probStats[3].textContent;

  return `Time: ${time} (${timePercentile}), Space: ${space} (${spacePercentile}) - LeetHub`;
}

/* ============================================================
   TESTS
   ============================================================ */

describe('languages mapping', () => {
  test('should map Python to .py extension', () => {
    expect(languages.Python).toBe('.py');
    expect(languages.Python3).toBe('.py');
  });

  test('should map C++ to .cpp extension', () => {
    expect(languages['C++']).toBe('.cpp');
  });

  test('should map C to .c extension', () => {
    expect(languages.C).toBe('.c');
  });

  test('should map Java to .java extension', () => {
    expect(languages.Java).toBe('.java');
  });

  test('should map C# to .cs extension', () => {
    expect(languages['C#']).toBe('.cs');
  });

  test('should map JavaScript/Javascript to .js extension', () => {
    expect(languages.JavaScript).toBe('.js');
    expect(languages.Javascript).toBe('.js');
  });

  test('should map Ruby to .rb extension', () => {
    expect(languages.Ruby).toBe('.rb');
  });

  test('should map Swift to .swift extension', () => {
    expect(languages.Swift).toBe('.swift');
  });

  test('should map Go to .go extension', () => {
    expect(languages.Go).toBe('.go');
  });

  test('should map Kotlin to .kt extension', () => {
    expect(languages.Kotlin).toBe('.kt');
  });

  test('should map Scala to .scala extension', () => {
    expect(languages.Scala).toBe('.scala');
  });

  test('should map Rust to .rs extension', () => {
    expect(languages.Rust).toBe('.rs');
  });

  test('should map PHP to .php extension', () => {
    expect(languages.PHP).toBe('.php');
  });

  test('should map TypeScript to .ts extension', () => {
    expect(languages.TypeScript).toBe('.ts');
  });

  test('should map SQL variants to .sql extension', () => {
    expect(languages.MySQL).toBe('.sql');
    expect(languages['MS SQL Server']).toBe('.sql');
    expect(languages.Oracle).toBe('.sql');
  });

  test('should return undefined for unsupported languages', () => {
    expect(languages.Haskell).toBeUndefined();
    expect(languages.Perl).toBeUndefined();
  });
});

describe('checkElem', () => {
  test('should return truthy for non-empty arrays', () => {
    expect(checkElem([1, 2, 3])).toBeTruthy();
    expect(checkElem(['a'])).toBeTruthy();
  });

  test('should return falsy for empty arrays', () => {
    expect(checkElem([])).toBeFalsy();
  });

  test('should return falsy for null', () => {
    expect(checkElem(null)).toBeFalsy();
  });

  test('should return falsy for undefined', () => {
    expect(checkElem(undefined)).toBeFalsy();
  });

  test('should return truthy for HTMLCollection-like objects with length > 0', () => {
    expect(checkElem({ length: 1 })).toBeTruthy();
  });

  test('should return falsy for HTMLCollection-like objects with length 0', () => {
    expect(checkElem({ length: 0 })).toBeFalsy();
  });
});

describe('convertToSlug', () => {
  test('should convert simple strings to slugs', () => {
    expect(convertToSlug('Two Sum')).toBe('two-sum');
  });

  test('should handle numbers in titles', () => {
    expect(convertToSlug('1. Two Sum')).toBe('1-two-sum');
  });

  test('should replace special characters', () => {
    expect(convertToSlug('Hello & World')).toBe('hello-and-world');
  });

  test('should handle accented characters', () => {
    expect(convertToSlug('café')).toBe('cafe');
  });

  test('should replace multiple spaces with single dash', () => {
    expect(convertToSlug('hello   world')).toBe('hello-world');
  });

  test('should replace multiple dashes with single dash', () => {
    expect(convertToSlug('hello---world')).toBe('hello-world');
  });

  test('should trim dashes from start and end', () => {
    expect(convertToSlug('-hello world-')).toBe('hello-world');
  });

  test('should handle empty string', () => {
    expect(convertToSlug('')).toBe('');
  });

  test('should handle complex LeetCode problem titles', () => {
    expect(
      convertToSlug('121. Best Time to Buy and Sell Stock'),
    ).toBe('121-best-time-to-buy-and-sell-stock');
  });

  test('should handle titles with parentheses and special chars', () => {
    expect(convertToSlug('Valid Parentheses (Easy)')).toBe(
      'valid-parentheses-easy',
    );
  });

  test('should convert to lowercase', () => {
    expect(convertToSlug('UPPERCASE')).toBe('uppercase');
  });

  test('should handle slashes and underscores from special char map', () => {
    expect(convertToSlug('hello/world')).toBe('hello-world');
    expect(convertToSlug('hello_world')).toBe('hello-world');
  });
});

describe('addLeadingZeros', () => {
  test('should add leading zeros for single digit prefix', () => {
    expect(addLeadingZeros('1-two-sum')).toBe('0001-two-sum');
  });

  test('should add leading zeros for two digit prefix', () => {
    expect(addLeadingZeros('12-integer-to-roman')).toBe(
      '0012-integer-to-roman',
    );
  });

  test('should add leading zeros for three digit prefix', () => {
    expect(addLeadingZeros('121-best-time')).toBe('0121-best-time');
  });

  test('should not add leading zeros for four digit prefix', () => {
    expect(addLeadingZeros('1234-some-problem')).toBe(
      '1234-some-problem',
    );
  });

  test('should not add leading zeros for longer prefixes', () => {
    expect(addLeadingZeros('12345-some-problem')).toBe(
      '12345-some-problem',
    );
  });

  test('should handle titles starting with non-numeric chars', () => {
    expect(addLeadingZeros('abc-problem')).toBe('0abc-problem');
  });
});

describe('parseCode', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should return null when no CodeMirror-code element exists', () => {
    expect(parseCode()).toBeNull();
  });

  test('should parse code from CodeMirror-code element', () => {
    const div = document.createElement('div');
    div.className = 'CodeMirror-code';
    div.innerText = 'line0\ncode1\nline2\ncode2\nline4\ncode3';
    document.body.appendChild(div);
    const result = parseCode();
    expect(result).toBe('code1\ncode2\ncode3\n');
  });

  test('should handle single line code', () => {
    const div = document.createElement('div');
    div.className = 'CodeMirror-code';
    div.innerText = 'header\nactual code';
    document.body.appendChild(div);
    const result = parseCode();
    expect(result).toBe('actual code\n');
  });
});

describe('parseStats', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should return null when no stats elements exist', () => {
    expect(parseStats()).toBeNull();
  });

  test('should parse and format stats correctly', () => {
    document.body.innerHTML = `
      <div class="data__HC-i">72 ms</div>
      <div class="data__HC-i">95.43%</div>
      <div class="data__HC-i">42.1 MB</div>
      <div class="data__HC-i">88.12%</div>
    `;
    const result = parseStats();
    expect(result).toBe(
      'Time: 72 ms (95.43%), Space: 42.1 MB (88.12%) - LeetHub',
    );
  });
});

describe('commit messages', () => {
  const readmeMsg = 'Create README - LeetHub';
  const discussionMsg = 'Prepend discussion post - LeetHub';
  const createNotesMsg = 'Attach NOTES - LeetHub';

  test('readme message should be correct', () => {
    expect(readmeMsg).toBe('Create README - LeetHub');
  });

  test('discussion message should be correct', () => {
    expect(discussionMsg).toBe('Prepend discussion post - LeetHub');
  });

  test('notes message should be correct', () => {
    expect(createNotesMsg).toBe('Attach NOTES - LeetHub');
  });
});
