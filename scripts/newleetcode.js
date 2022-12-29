/* Enum for languages supported by LeetCode. */
const programmingLanguages = {
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

/* Commit messages */
const readMeMsg = 'Create README - LeetHub';
const pattern = /https?:\/\/.*leetcode.com\/problems\/.*\/submissions\/\d*/;

/* state of upload for progress */
let uploadingState = { uploading: false };
let elem;
let questionDict = {};

/* Util function to check if an element exists */
function checkElement(elem) {
  return elem && elem.length > 0;
}

/* Main function for uploading code to GitHub repo, and callback cb is called if success */
const uploadToGit = (
  token,
  hook,
  code,
  directory,
  filename,
  sha,
  msg,
  cb = undefined,
) => {
  // To validate user, load user object from GitHub.
  const URL = `https://api.github.com/repos/${hook}/contents/${directory}/${filename}`;

  /* Define Payload */
  let data = {
    message: msg,
    content: code,
    sha,
  };

  data = JSON.stringify(data);

  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 201) {
        const updatedSha = JSON.parse(xhr.responseText).content.sha; // get updated SHA.

        chrome.storage.local.get('stats', (data2) => {
          let { stats } = data2;
          if (stats === null || stats === {} || stats === undefined) {
            // create stats object
            stats = {};
            stats.solved = 0;
            stats.easy = 0;
            stats.medium = 0;
            stats.hard = 0;
            stats.sha = {};
          }
          const filePath = directory + filename;
          // Only increment solved problems statistics once
          // New submission commits twice (README and problem)
          if (filename === 'README.md' && sha === null) {
            stats.solved += 1;
          }
          stats.sha[filePath] = updatedSha; // update sha key.
          chrome.storage.local.set({ stats }, () => {
            console.log(
              `Successfully committed ${filename} to github`,
            );

            // if callback is defined, call it
            if (cb !== undefined) {
              cb();
            }
          });
        });
      }
    }
  });
  xhr.open('PUT', URL, true);
  xhr.setRequestHeader('Authorization', `token ${token}`);
  xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
  xhr.send(data);
};

/* Main function for updating code on GitHub Repo */
/* Currently only used for prepending discussion posts to README */
/* callback cb is called on success if it is defined */
const updateOnGit = (
  token,
  hook,
  addition,
  directory,
  msg,
  prepend,
  cb = undefined,
) => {
  const URL = `https://api.github.com/repos/${hook}/contents/${directory}/README.md`;

  /* Read from existing file on GitHub */
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 201) {
        const response = JSON.parse(xhr.responseText);
        const existingContent = decodeURIComponent(
          escape(atob(response.content)),
        );
        let newContent = '';

        /* Discussion posts prepended at top of README */
        /* Future implementations may require appending to bottom of file */
        if (prepend) {
          newContent = btoa(
            unescape(encodeURIComponent(addition + existingContent)),
          );
        }

        /* Write file with new content to GitHub */
        uploadToGit(
          token,
          hook,
          newContent,
          directory,
          'README.md',
          response.sha,
          msg,
          cb,
        );
      }
    }
  });
  xhr.open('GET', URL, true);
  xhr.setRequestHeader('Authorization', `token ${token}`);
  xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
  xhr.send();
};

function uploadOnGit(
  code,
  problemName,
  fileName,
  msg,
  action,
  prepend = true,
  cb = undefined,
  _diff = undefined,
) {
  /* Get necessary payload data */
  chrome.storage.local.get('leethub_token', (t) => {
    const token = t.leethub_token;
    if (token) {
      chrome.storage.local.get('mode_type', (m) => {
        const mode = m.mode_type;
        if (mode === 'commit') {
          /* Get hook */
          chrome.storage.local.get('leethub_hook', (h) => {
            const hook = h.leethub_hook;
            if (hook) {
              /* Get SHA, if it exists */

              /* to get unique key */
              const filePath = problemName + fileName;
              chrome.storage.local.get('stats', (s) => {
                const { stats } = s;
                let sha = null;

                if (
                  stats !== undefined &&
                  stats.sha !== undefined &&
                  stats.sha[filePath] !== undefined
                ) {
                  sha = stats.sha[filePath];
                }

                if (action === 'upload') {
                  /* Upload to git. */
                  uploadToGit(
                    token,
                    hook,
                    code,
                    problemName,
                    fileName,
                    sha,
                    msg,
                    cb,
                  );
                } else if (action === 'update') {
                  /* Update on git */
                  updateOnGit(
                    token,
                    hook,
                    code,
                    problemName,
                    msg,
                    prepend,
                    cb,
                  );
                }
              });
            }
          });
        }
      });
    }
  });
}

/* Function for finding and parsing the full code. */
/* - The solution is available at the same page. */
/* - Either get the monaco object from the window, or use dom manipulation*/
/* - Here it gets the code from DOM manipulation */
/* - Also call the callback if available when upload is success */
function findSubmittedCode(
  uploadOnGit,
  problemName,
  fileName,
  msg,
  action,
  cb = undefined,
) {
  let codeUnicoded = null;

  /* Extract only the code */
  let codeDiv = document.querySelector('code');
  if (!codeDiv) {
    return null;
  }
  codeUnicoded = codeDiv.innerText;

  if (codeUnicoded !== null) {
    /* The code has some unicode. Replacing all unicode with actual characters */
    var code = codeUnicoded.replace(
      /\\u[\dA-F]{4}/gi,
      function (match) {
        return String.fromCharCode(
          parseInt(match.replace(/\\u/g, ''), 16),
        );
      },
    );
  }
  if (codeUnicoded !== null && code !== null) {
    setTimeout(function () {
      uploadOnGit(
        btoa(unescape(encodeURIComponent(code))),
        problemName,
        fileName,
        msg,
        action,
        true,
        cb,
      );
    }, 2000);
  }
}

function convertToSlugCase(string) {
  const a =
    'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
  const b =
    'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}
function getProblemNameSlugCase(questionTitle) {
  return convertToSlugCase(questionTitle);
}

/* Parser function for the question and tags */
function getQuestion() {
  var questionUrl = window.location.href;
  questionUrl = questionUrl.split('submissions')[0];

  let question = document.querySelector('meta[name="description"]');
  if (question) {
    question = question.content;
  }
  let qArray = question.split(' - ');
  question = qArray.slice(1).join(' - ');

  // Problem title.
  let qtitle = qArray[0].trim();

  // Final formatting of the contents of the README for each problem
  const markdown = `<h2><a href="${questionUrl}">${qtitle}</a></h2><hr>${question}`;
  return { markdown, title: qtitle };
}

/* Parser function for time/space stats */
function getStats() {
  let probStats = document.getElementsByClassName(
    'text-label-1 dark:text-dark-label-1 ml-2 font-medium',
  );
  if (!checkElement(probStats)) {
    return null;
  }
  const percentageStats = document.getElementsByClassName(
    'text-white dark:text-dark-white ml-2 rounded-xl px-1.5 font-medium',
  );
  let time = probStats[0].textContent;
  let space = probStats[1].textContent;
  if (!checkElement(percentageStats)) {
    return null;
  }
  let timePercentile = percentageStats[0].textContent;
  let spacePercentile = percentageStats[1].textContent;
  // Format commit message
  return `Time: ${time} (${timePercentile}), Space: ${space} (${spacePercentile}) - LeetHub`;
}

const mainFunction = setInterval(() => {
  let probStatement = null;
  let probStats = null;

  let languageDiv = document.querySelector('.leading-4')
    ? document.querySelector('.leading-4')
    : null;

  const language = languageDiv
    ? programmingLanguages[languageDiv.innerText]
    : null;

  // solution is accepted when the link changes, and a submission is made
  // basically on a accepted solution we observe a change in href and so we can say solution is accepted
  // on a wrong ans the link remains same

  let currentLink = document.location.href;
  let solution = currentLink.match(pattern);

  var success = solution ? true : false;
  // check success tag for a normal problem
  if (success) {
    probStatement = getQuestion().markdown;
    probStats = getStats();
  }
  if (probStatement !== null) {
    const problemName = getProblemNameSlugCase(getQuestion().title);
    let filePath = problemName + problemName + language;
    let readmeKey = language + problemName;
    if (
      questionDict[filePath] !== undefined ||
      questionDict[readmeKey] !== undefined
    ) {
      return null;
    }
    if (language !== null) {
      // start upload indicator here
      startUploading();
      chrome.storage.local.get('stats', (s) => {
        const { stats } = s;
        const filePath = problemName + problemName + language;
        let sha = null;
        if (
          stats !== undefined &&
          stats.sha !== undefined &&
          stats.sha[filePath] !== undefined
        ) {
          sha = stats.sha[filePath];
        }
        /* Only create README if not already created */
        if (sha === null) {
          /* @TODO: Change this setTimeout to Promise */
          if (questionDict[readmeKey] === undefined) {
            uploadOnGit(
              btoa(unescape(encodeURIComponent(probStatement))),
              problemName,
              'README.md',
              readMeMsg,
              'upload',
            );
            questionDict[readmeKey] = Date.now();
          }
        }
      });
      if (questionDict[filePath] === undefined) {
        /* Upload code to Git */
        setTimeout(function () {
          findSubmittedCode(
            uploadOnGit,
            problemName,
            problemName + language,
            probStats,
            'upload',
            // callback is called when the code upload to git is a success
            () => {
              if (uploadingState['countdown'])
                clearTimeout(uploadingState['countdown']);
              delete uploadingState['countdown'];
              uploadingState.uploading = false;
              markTheUploaded();
            },
          ); // Encode `code` to base64
          questionDict[filePath] = Date.now();
        }, 1000);
      }
    }
  }
}, 1000);

/* Since we dont yet have callbacks/promises that helps to find out if things went bad */
/* we will start 10 seconds counter and even after that upload is not complete, then we conclude its failed */
function startUploadCountdown() {
  uploadingState.uploading = true;
  uploadingState['countdown'] = setTimeout(() => {
    if ((uploadingState.uploading = true)) {
      // still uploading, then it failed
      uploadingState.uploading = false;
      markUploadFail();
    }
  }, 10000);
}

/* we will need specific anchor element that is specific to the page you are in Eg. Explore */
function insertToAnchor(elem) {
  if (
    checkElement(
      document.getElementsByClassName(
        'ml-auto flex items-center space-x-4',
      ),
    )
  ) {
    let target = document.getElementsByClassName(
      'ml-auto flex items-center space-x-4',
    )[0];
    elem.className =
      'px-3 py-1.5 font-medium items-center whitespace-nowrap transition-all focus:outline-none inline-flex bg-fill-3 dark:bg-dark-fill-3 hover:bg-fill-2 dark:hover:bg-dark-fill-2 text-label-2 dark:text-dark-label-2 rounded-lg';
    if (target.childNodes.length > 0)
      target.childNodes[0].prepend(elem);
  }
}

/* start upload will inject a spinner on left side to the "Run Code" button */
function startUploading() {
  try {
    elem = document.getElementById('leethub_progress_anchor_element');
    if (!elem) {
      elem = document.createElement('span');
      elem.id = 'leethub_progress_anchor_element';
      elem.style = 'margin-right: 20px;padding-top: 2px;';
    }
    elem.innerHTML = `<div id="leethub_progress_elem" class="leethub_progress"></div>`;
    insertToAnchor(elem);
    // start the countdown
    startUploadCountdown();
  } catch (error) {
    // generic exception handler for time being so that existing feature doesnt break but
    // error gets logged
    console.log(error);
  }
}

/* This will create a tick mark before "Run Code" button signalling LeetHub has done its job */
function markTheUploaded() {
  elem = document.getElementById('leethub_progress_elem');
  if (elem) {
    elem.className = '';
    let style =
      'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid #78b13f;border-right:7px solid #78b13f;';
    elem.style = style;
  }
}

/* This will create a failed tick mark before "Run Code" button signalling that upload failed */
function markUploadFail() {
  elem = document.getElementById('leethub_progress_elem');
  if (elem) {
    elem.className = '';
    let style =
      'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid red;border-right:7px solid red;';
    elem.style = style;
  }
}

/* Sync to local storage */
chrome.storage.local.get('isSync', (data) => {
  keys = [
    'leethub_token',
    'leethub_username',
    'pipe_leethub',
    'stats',
    'leethub_hook',
    'mode_type',
  ];
  if (!data || !data.isSync) {
    keys.forEach((key) => {
      chrome.storage.sync.get(key, (data) => {
        chrome.storage.local.set({ [key]: data[key] });
      });
    });
    chrome.storage.local.set({ isSync: true }, (data) => {
      console.log('LeetHub Synced to local values');
    });
  } else {
    console.log('LeetHub Local storage already synced!');
  }
});

injectCode();

/* inject css style required for the upload progress feature */
function injectCode() {
  const style = document.createElement('style');
  style.textContent =
    '.leethub_progress {pointer-events: none;width: 2.0em;height: 2.0em;border: 0.4em solid transparent;border-color: #eee;border-top-color: #3E67EC;border-radius: 50%;animation: loadingspin 1s linear infinite;} @keyframes loadingspin { 100% { transform: rotate(360deg) }}';
  document.head.append(style);
}
