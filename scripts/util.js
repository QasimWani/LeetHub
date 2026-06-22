/* eslint-disable no-unused-vars */

/* Util function to check if an element exists */
function checkElem(elem) {
  return elem && elem.length > 0;
}

/* Encode a string to base64, handling Unicode characters */
function encodeToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

/* Decode a base64 string, handling Unicode characters */
function decodeFromBase64(str) {
  return decodeURIComponent(escape(atob(str)));
}

/* Enum for languages supported by LeetCode and GeeksForGeeks */
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

/* Convert a string to a URL-friendly slug */
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

/* Get SHA for a file path from stats, or null if not found */
function getSHA(stats, filePath) {
  if (
    stats !== undefined &&
    stats.sha !== undefined &&
    stats.sha[filePath] !== undefined
  ) {
    return stats.sha[filePath];
  }
  return null;
}

/* Create a default stats object */
function createDefaultStats() {
  return { solved: 0, easy: 0, medium: 0, hard: 0, sha: {} };
}

/* Make an authenticated GitHub API request */
function githubRequest(method, url, token, data, callback) {
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (xhr.readyState === 4) {
      callback(xhr.status, xhr.responseText);
    }
  });
  xhr.open(method, url, true);
  xhr.setRequestHeader('Authorization', `token ${token}`);
  xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
  if (data) {
    xhr.send(typeof data === 'string' ? data : JSON.stringify(data));
  } else {
    xhr.send();
  }
}

/* Toggle display between hook_mode and commit_mode */
function setDisplayMode(mode) {
  const hookEl = document.getElementById('hook_mode');
  const commitEl = document.getElementById('commit_mode');
  if (hookEl) {
    hookEl.style.display = mode === 'commit' ? 'none' : 'inherit';
  }
  if (commitEl) {
    commitEl.style.display = mode === 'commit' ? 'inherit' : 'none';
  }
}

/* Display problem stats in the UI */
function displayStats(stats) {
  if (stats && stats.solved) {
    const solvedEl = document.getElementById('p_solved');
    const easyEl = document.getElementById('p_solved_easy');
    const mediumEl = document.getElementById('p_solved_medium');
    const hardEl = document.getElementById('p_solved_hard');
    if (solvedEl) solvedEl.textContent = stats.solved;
    if (easyEl) easyEl.textContent = stats.easy;
    if (mediumEl) mediumEl.textContent = stats.medium;
    if (hardEl) hardEl.textContent = stats.hard;
  }
}
