/* Constants used through out the code */
const constant = {
  elementTags: {
    problemStatsTag: "mt-3",
    percentileStatsTag: "mt-2",
    difficulty: {
      easy: ".text-olive",          /* .text-olive is for easy problem */
      medium: ".text-yellow",       /* .text-yellow is for medium problem */
      hard: ".text-pink"            /* .text-pink is for hard problem */
    },
    submitButtonTag: '[data-e2e-locator="console-submit-button"]',
    successTag: 'span[data-e2e-locator="submission-result"]',
  },
  regex: {
    percentageRegex: /(\d+(\.\d+)?%)/
  },
  url: {
    apiURL: "https://leetcode.com/graphql",
    payload: {
      getAllSubmissions: `query submissionList($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!, $lang: Int, $status: Int) {
        questionSubmissionList(
        offset: $offset
        limit: $limit
        lastKey: $lastKey
        questionSlug: $questionSlug
        lang: $lang
        status: $status
        ) {
          lastKey
          hasNext
          submissions {
            id
            title
            titleSlug
            status
            statusDisplay
            lang
            langName
            runtime
            timestamp
            url
            isPending
            memory
            hasNotes
            notes
          }
      }
      }`,
      getSubmission: `query submissionDetails($submissionId: Int!) {
        submissionDetails(submissionId: $submissionId) {
          runtime
          runtimeDisplay
          runtimePercentile
          runtimeDistribution
          memory
          memoryDisplay
          memoryPercentile
          memoryDistribution
          code
          timestamp
          statusCode
          user {
            username
            profile {
              realName
              userAvatar
            }
          }
          lang {
            name
            verboseName
          }
          question {
            questionId
            acRate
            difficulty
            freqBar
            frontendQuestionId: questionFrontendId
            isFavor
            paidOnly: isPaidOnly
            content
            status
            title
            titleSlug
            topicTags {
              name
              id
              slug
            }
            hasSolution
            hasVideoSolution
          }
          notes
          topicTags {
            tagId
            slug
            name
          }
          runtimeError
          compileError
          lastTestcase
        }
      }`,
      getQuestionTitle: `query consolePanelConfig($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          questionFrontendId
          questionTitle
          enableDebugger
          enableRunCode
          enableSubmit
          enableTestMode
          exampleTestcaseList
          metaData
        }
      }`,
      getProblemStatement: `query questionContent($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          content
          mysqlSchemas
          dataSchemas
        }
      }`
    }
  },
  languages: {
    'Python': '.py',
    'Python3': '.py',
    'C++': '.cpp',
    'C': '.c',
    'Java': '.java',
    'C#': '.cs',
    'JavaScript': '.js',
    'Javascript': '.js',
    'Ruby': '.rb',
    'Swift': '.swift',
    'Go': '.go',
    'Kotlin': '.kt',
    'Scala': '.scala',
    'Rust': '.rs',
    'PHP': '.php',
    'TypeScript': '.ts',
    'MySQL': '.sql',
    'MS SQL Server': '.sql',
    'Oracle': '.sql',
  }
}

/* Commit messages */
const readmeMsg = 'Create README - LeetHub';
const discussionMsg = 'Prepend discussion post - LeetHub';
const createNotesMsg = 'Attach NOTES - LeetHub';

/* problem types */
const NORMAL_PROBLEM = 0;
const EXPLORE_SECTION_PROBLEM = 1;

/* Difficulty of most recenty submitted question */
let difficulty = '';

/* state of upload for progress */
let uploadState = {
  uploading: false
};

/* ------------------------------------------------ UTILITIES------------------------------------------------------ */

/* Util function to check if an element exists */
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
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}


function addLeadingZeros(title) {
  const maxTitlePrefixLength = 4;
  var len = title.split('-')[0].length;
  if (len < maxTitlePrefixLength) {
    return '0'.repeat(4 - len) + title;
  }
  return title;
}

/* inject css style required for the upload progress feature */
function injectStyle() {
  const style = document.createElement('style');
  style.textContent =
    '.leethub_progress {pointer-events: none;width: 2.0em;height: 2.0em;border: 0.4em solid transparent;border-color: #eee;border-top-color: #3E67EC;border-radius: 50%;animation: loadingspin 1s linear infinite;} @keyframes loadingspin { 100% { transform: rotate(360deg) }}';
  document.head.append(style);
}


/* This will create a failed tick mark before "Run Code" button signalling that upload failed */
function markUploadFailed() {
  elem = document.getElementById('leethub_progress_elem');
  if (elem) {
    elem.className = '';
    style =
      'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid red;border-right:7px solid red;';
    elem.style = style;
  }
}

/* Main parser function for the code */
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


/* ----------------------------------------- GIT FUNCTIONS ------------------------------------------------------------ */

/* we will need specific anchor element that is specific to the page you are in Eg. Explore */
function insertToAnchorElement(elem) {
  if (document.URL.startsWith('https://leetcode.com/explore/')) {
    // means we are in explore page
    action = document.getElementsByClassName('action');
    if (
      checkElem(action) &&
      checkElem(action[0].getElementsByClassName('row')) &&
      checkElem(
        action[0]
          .getElementsByClassName('row')[0]
          .getElementsByClassName('col-sm-6'),
      ) &&
      action[0]
        .getElementsByClassName('row')[0]
        .getElementsByClassName('col-sm-6').length > 1
    ) {
      target = action[0]
        .getElementsByClassName('row')[0]
        .getElementsByClassName('col-sm-6')[1];
      elem.className = 'pull-left';
      if (target.childNodes.length > 0)
        target.childNodes[0].prepend(elem);
    }
  } else {
    if (checkElem(document.getElementsByClassName('action__38Xc'))) {
      target = document.getElementsByClassName('action__38Xc')[0];
      elem.className = 'runcode-wrapper__8rXm';
      if (target.childNodes.length > 0)
        target.childNodes[0].prepend(elem);
    }
  }
}

/* Since we dont yet have callbacks/promises that helps to find out if things went bad */
/* we will start 10 seconds counter and even after that upload is not complete, then we conclude its failed */
function startUploadCountDown() {
  uploadState.uploading = true;
  uploadState['countdown'] = setTimeout(() => {
    if ((uploadState.uploading = true)) {
      // still uploading, then it failed
      uploadState.uploading = false;
      markUploadFailed();
    }
  }, 10000);
}

/* start upload will inject a spinner on left side to the "Run Code" button */
function startUpload() {
  try {
    elem = document.getElementById('leethub_progress_anchor_element');
    if (!elem) {
      elem = document.createElement('span');
      elem.id = 'leethub_progress_anchor_element';
      elem.style = 'margin-right: 20px;padding-top: 2px;';
    }
    elem.innerHTML = `<div id="leethub_progress_elem" class="leethub_progress"></div>`;
    target = insertToAnchorElement(elem);
    // start the countdown
    startUploadCountDown();
  } catch (error) {
    // generic exception handler for time being so that existing feature doesnt break but
    // error gets logged
    console.log(error);
  }
}

/* Helper function to check if a file already exists in the directory */
function checkFileExists(token, hook, directory, filename, cb) {
  const URL = `https://api.github.com/repos/${hook}/contents/${directory}/${filename}`;
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // File exists, get the SHA of the existing file
        const response = JSON.parse(xhr.responseText);
        const sha = response.sha;
        cb(true, sha);
      } else if (xhr.status === 404) {
        // File doesn't exist
        cb(false, null);
      } else {
        // Error occurred
        cb(false, null);
      }
    }
  });

  xhr.open('GET', URL, true);
  xhr.setRequestHeader('Authorization', `token ${token}`);
  xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
  xhr.send();
}

/* Main function for uploading code to GitHub repo, and callback cb is called if success */
const upload = (token, hook, code, directory, filename, msg, cb = undefined) => {
  checkFileExists(token, hook, directory, filename, (fileExists, sha) => {
    // Define Payload
    let data = {
      message: msg,
      content: code,
    };

    // If file exists, update the data with the SHA of the existing file
    if (fileExists && sha) {
      data.sha = sha;
    }

    data = JSON.stringify(data);

    const URL = `https://api.github.com/repos/${hook}/contents/${directory}/${filename}`;

    const xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          const updatedSha = response.content.sha; // Get updated SHA.

          if (filename === 'README.md' && sha === null) {
            // If it's the README and sha is null, it means it's a new problem, so update stats
            chrome.storage.local.get('stats', (data2) => {
              let { stats } = data2;
              if (stats === null || stats === {} || stats === undefined) {
                stats = {};
                stats.solved = 0;
                stats.easy = 0;
                stats.medium = 0;
                stats.hard = 0;
                stats.sha = {};
              }
              const filePath = `${directory}/${filename}`;
              stats.solved += 1;
              stats.easy += difficulty === 'Easy' ? 1 : 0;
              stats.medium += difficulty === 'Medium' ? 1 : 0;
              stats.hard += difficulty === 'Hard' ? 1 : 0;
              stats.sha[filePath] = updatedSha; // update sha key.
              chrome.storage.local.set({ stats }, () => {
                console.log(`Successfully committed ${filename} to GitHub`);

                // If callback is defined, call it
                if (cb !== undefined) {
                  cb();
                }
              });
            });
          } else {
            // For other files, simply update the stats
            const filePath = `${directory}/${filename}`;
            chrome.storage.local.get('stats', (data2) => {
              let { stats } = data2;
              if (stats !== null && stats !== {} && stats !== undefined) {
                stats.sha[filePath] = updatedSha; // update sha key.
                chrome.storage.local.set({ stats });
              }
            });

            console.log(`Successfully committed ${filename} to GitHub`);

            // If callback is defined, call it
            if (cb !== undefined) {
              cb();
            }
          }
        }
      }
    });

    xhr.open('PUT', URL, true);
    xhr.setRequestHeader('Authorization', `token ${token}`);
    xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
    xhr.send(data);
  });
};

/* Main function for updating code on GitHub Repo */
/* Currently only used for prepending discussion posts to README */
/* callback cb is called on success if it is defined */
const update = (token, hook, addition, directory, msg, prepend, cb = undefined) => {

  const URL = `https://api.github.com/repos/${hook}/contents/${directory}/README.md`;

  /* Read from existing file on GitHub */
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 201) {
        const response = JSON.parse(xhr.responseText);
        const existingContent = atob(response.content);

        let newContent = '';

        /* Discussion posts prepended at top of README */
        /* Future implementations may require appending to bottom of file */
        if (prepend) {
          newContent = btoa(addition + existingContent);
        }

        /* Write file with new content to GitHub */
        upload(token, hook, newContent, directory, 'README.md', response.sha, msg, cb);
      }
    }
  });
  xhr.open('GET', URL, true);
  xhr.setRequestHeader('Authorization', `token ${token}`);
  xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
  xhr.send();
};

function uploadGit(code, problemNameSlug, fileName, msg, action, prepend = true, cb = undefined, _diff = undefined) {
  // Assign difficulty
  if (_diff && _diff !== undefined) {
    difficulty = _diff.trim();
  }

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

              if (action === 'upload') {
                upload(token, hook, code, problemNameSlug, fileName, msg, cb);
              }
              else if (action === 'update') {
                update(token, hook, code, problemNameSlug, msg, prepend, cb);
              }
            }
          });
        }
      });
    }
  });
}

/* This will create a tick mark before "Run Code" button signalling LeetHub has done its job */
function markUploaded() {
  elem = document.getElementById('leethub_progress_elem');
  if (elem) {
    elem.className = '';
    style =
      'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid #78b13f;border-right:7px solid #78b13f;';
    elem.style = style;
  }
}


/* ------------------------------------------------ LEETCODE WEB PAGE PARSING FUNCTIONS ------------------------------------------------------ */

/* Function for finding and parsing the full code. */
function findCode(uploadGit, problemNameSlug, fileName, msg, action, cb = undefined) {
  const currentURL = window.location.href;
  const questionSlug = currentURL.split('/')[4];
  const variables = {
    questionSlug: questionSlug,
    limit: 20,
    offset: 0,
    lastKey: null,
    status: 10
  };

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: constant.url.payload.getAllSubmissions,
      variables: variables
    })
  };

  /* Fetching submission ID from graphql query to fetch code of the submission */
  fetch(constant.url.apiURL, requestOptions)
    .then(response => response.json())
    .then((submissions) => {
      if (!submissions) return;

      const submissionId = submissions.data.questionSubmissionList.submissions[0].id;

      const variables = {
        submissionId: submissionId
      }

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: constant.url.payload.getSubmission,
          variables: variables
        })
      };

      /* Fetching code based on the submission id extracted from the above request */
      fetch(constant.url.apiURL, requestOptions)
        .then(response => response.json())
        .then((submission) => {
          let code = submission.data.submissionDetails.code;

          // Find language extension of the submission 
          let languageExtension = submission.data.submissionDetails.lang.name;

          code = code.replace(
            /\\u[\dA-F]{4}/gi,
            function (match) {
              return String.fromCharCode(
                parseInt(match.replace(/\\u/g, ''), 16),
              );
            },
          );

          if (code != null) {
            setTimeout(function () {
              uploadGit(btoa(code), problemNameSlug, fileName + "." + languageExtension, msg, action, true, cb);
            }, 5000);
          }
        });
    });
}

/* Function for parsing the difficulty level of the problem. */
function parseProblemDifficulty() {
  let difficulty = null;

  const difficultySelectors = [constant.elementTags.difficulty.easy,
  constant.elementTags.difficulty.medium,
  constant.elementTags.difficulty.hard];

  const selectedElement = document.querySelector(difficultySelectors.join(', '));

  if (selectedElement) {
    difficulty = selectedElement.innerText;
  }
  return difficulty
}


/* Parser function for the question and tags */
function parseQuestion() {
  const currentURL = window.location.href;
  const titleSlug = currentURL.split('/')[4];
  const variables = {
    titleSlug: titleSlug,
  };

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: constant.url.payload.getProblemStatement,
      variables: variables
    })
  };

  /* Fetching question title and question id from graphql query to fetch problem statement */
  return new Promise((resolve, reject) => {
    fetch(constant.url.apiURL, requestOptions)
      .then(response => response.json())
      .then((questionData) => {
        const problemStatement = questionData.data.question.content;
        resolve(problemStatement);
      })
      .catch((error) => {
        reject(error);
      });
  })
}

/* Parser function for time/space stats */
function parseStats() {
  const problemStats = document.getElementsByClassName(constant.elementTags.problemStatsTag);
  const percentileStats = document.getElementsByClassName(constant.elementTags.percentileStatsTag);

  const percentageRegex = constant.regex.percentageRegex;

  const time = problemStats.item(0).textContent;
  const timePercentile = percentileStats.item(2).textContent ? percentileStats.item(2).textContent.match(percentageRegex)[0] : null;

  const space = problemStats.item(1).textContent;
  const spacePercentile = percentileStats.item(3).textContent ? percentileStats.item(3).textContent.match(percentageRegex)[0] : null;

  if (!checkElem(problemStats)) {
    return null;
  }

  // Format commit message 
  return `Time: ${time} (${timePercentile}), Space: ${space} (${spacePercentile}) - LeetHub`;
}

function getProblemNameSlug() {
  const currentURL = window.location.href;
  const titleSlug = currentURL.split('/')[4];
  const variables = {
    titleSlug: titleSlug,
  };

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: constant.url.payload.getQuestionTitle,
      variables: variables
    })
  };

  /* Fetching question title and question id from graphql query to fetch problem statement */
  return new Promise((resolve, reject) => {
    fetch(constant.url.apiURL, requestOptions)
      .then(response => response.json())
      .then((questionData) => {
        const problemName = questionData.data.question.questionId + ". " + questionData.data.question.questionTitle;
        const problemNameSlug = addLeadingZeros(convertToSlug(problemName));
        resolve({ problemName, problemNameSlug });
      })
      .catch((error) => {
        reject(error);
      });
  })
}

function parserFunction() {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      // Get the current URL
      currentURL = window.location.href;

      // Get the current URL
      if (!currentURL.endsWith('/description/')) {
        try {

          // Checking if code has been accepted or not
          successTag = document.querySelector(constant.elementTags.successTag).textContent;

          if (checkElem(successTag) && successTag === 'Accepted') {
            problemType = NORMAL_PROBLEM;

            // Parse problem statistics
            problemStats = parseStats();

            // Get problem name and slug 
            getProblemNameSlug()
              .then(({ problemName, problemNameSlug }) => {
                // Parse the problem statement 
                parseQuestion()
                  .then((problemStatement) => {
                    const questionUrl = currentURL.substring(0, currentURL.indexOf('/submissions/'));

                    // Modify the problem statement to include a link to the question 
                    problemStatement = `<h2><a href="${questionUrl}">${problemName}</a></h2>` + problemStatement;

                    // Check if all required data is available 
                    if (problemStatement && problemNameSlug && problemName) {
                      startUpload();

                      uploadGit(btoa(problemStatement), problemNameSlug, 'README.md', readmeMsg, 'upload');

                      findCode(
                        uploadGit,
                        problemNameSlug,
                        problemNameSlug,
                        problemStats,
                        'upload',
                        // Callback is called when the code upload to Git is successful 
                        () => {
                          if (uploadState['countdown']) {
                            clearTimeout(uploadState['countdown']);
                          }
                          delete uploadState['countdown'];
                          uploadState.uploading = false;
                          markUploaded();
                        }
                      );
                    }
                  });
              });
          }
        } catch (err) {
          console.error(err);
        }
      }
    }, 5000);
  });
}

/* Interval function to check if code has been submitted */
function loaderFunction() {
  try {

    const submitButton = document.querySelector(constant.elementTags.submitButtonTag);

    if (!flag) {
      submitButton.addEventListener('click', function () {
        clearInterval(loaderInterval);
        successTag = null;
        parserFunction()
          .then(() => {
            loaderInterval = setInterval(loaderFunction, 1000);
          })
          .catch((error) => {
            console.error(error);
          });
      });
      flag = true;
    }
  }
  catch (err) {
    console.error(err);
  }
}

let flag = false;
let successTag = null;
let problemType;
let problemStats;

let loaderInterval = setInterval(loaderFunction, 1000);

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
        chrome.storage.local.set({
          [key]: data[key]
        });
      });
    });
    chrome.storage.local.set({
      isSync: true
    }, (data) => {
      console.log('LeetHub Synced to local values');
    });
  } else {
    console.log('LeetHub Local storage already synced!');
  }
});

/* inject the style */
injectStyle();