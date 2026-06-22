/* global checkElem, languages, convertToSlug, githubRequest,
   createDefaultStats, decodeFromBase64, encodeToBase64, getSHA */

/* Commit messages */
const readmeMsg = 'Create README - LeetHub';
const discussionMsg = 'Prepend discussion post - LeetHub';
const createNotesMsg = 'Attach NOTES - LeetHub';

// problem types
const NORMAL_PROBLEM = 0;
const EXPLORE_SECTION_PROBLEM = 1;

/* Difficulty of most recenty submitted question */
let difficulty = '';

/* state of upload for progress */
const uploadState = { uploading: false };

/* Get file extension for submission */
function findLanguage() {
  const tag = [
    ...document.getElementsByClassName(
      'ant-select-selection-selected-value',
    ),
    ...document.getElementsByClassName('Select-value-label'),
  ];
  if (tag && tag.length > 0) {
    for (let i = 0; i < tag.length; i += 1) {
      const elem = tag[i].textContent;
      if (elem !== undefined && languages[elem] !== undefined) {
        return languages[elem]; // should generate respective file extension
      }
    }
  }
  return null;
}

/* Main function for uploading code to GitHub repo, and callback cb is called if success */
const upload = (
  token,
  hook,
  code,
  directory,
  filename,
  sha,
  msg,
  cb = undefined,
) => {
  const URL = `https://api.github.com/repos/${hook}/contents/${directory}/${filename}`;
  const data = { message: msg, content: code, sha };

  githubRequest('PUT', URL, token, data, (status, responseText) => {
    if (status === 200 || status === 201) {
      const updatedSha = JSON.parse(responseText).content.sha;

      chrome.storage.local.get('stats', (data2) => {
        let { stats } = data2;
        if (stats === null || stats === {} || stats === undefined) {
          stats = createDefaultStats();
        }
        const filePath = directory + filename;
        // Only increment solved problems statistics once
        // New submission commits twice (README and problem)
        if (filename === 'README.md' && sha === null) {
          stats.solved += 1;
          stats.easy += difficulty === 'Easy' ? 1 : 0;
          stats.medium += difficulty === 'Medium' ? 1 : 0;
          stats.hard += difficulty === 'Hard' ? 1 : 0;
        }
        stats.sha[filePath] = updatedSha;
        chrome.storage.local.set({ stats }, () => {
          console.log(`Successfully committed ${filename} to github`);

          if (cb !== undefined) {
            cb();
          }
        });
      });
    }
  });
};

/* Main function for updating code on GitHub Repo */
/* Currently only used for prepending discussion posts to README */
/* callback cb is called on success if it is defined */
const update = (
  token,
  hook,
  addition,
  directory,
  msg,
  prepend,
  cb = undefined,
) => {
  const URL = `https://api.github.com/repos/${hook}/contents/${directory}/README.md`;

  githubRequest('GET', URL, token, null, (status, responseText) => {
    if (status === 200 || status === 201) {
      const response = JSON.parse(responseText);
      const existingContent = decodeFromBase64(response.content);
      let newContent = '';

      if (prepend) {
        newContent = encodeToBase64(addition + existingContent);
      }

      upload(
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
  });
};

function uploadGit(
  code,
  problemName,
  fileName,
  msg,
  action,
  prepend = true,
  cb = undefined,
  _diff = undefined,
) {
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
              /* Get SHA, if it exists */
              const filePath = problemName + fileName;
              chrome.storage.local.get('stats', (s) => {
                const { stats } = s;
                const sha = getSHA(stats, filePath);

                if (action === 'upload') {
                  /* Upload to git. */
                  upload(
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
                  update(
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
/* - At first find the submission details url. */
/* - Then send a request for the details page. */
/* - Finally, parse the code from the html reponse. */
/* - Also call the callback if available when upload is success */
function findCode(
  uploadGit,
  problemName,
  fileName,
  msg,
  action,
  cb = undefined,
) {
  /* Get the submission details url from the submission page. */
  let submissionURL;
  const e = document.getElementsByClassName('status-column__3SUg');
  if (checkElem(e)) {
    // for normal problem submisson
    const submissionRef = e[1].innerHTML.split(' ')[1];
    submissionURL = `https://leetcode.com${submissionRef
      .split('=')[1]
      .slice(1, -1)}`;
  } else {
    // for a submission in explore section
    const submissionRef = document.getElementById('result-state');
    submissionURL = submissionRef.href;
  }

  if (submissionURL != undefined) {
    /* Request for the submission details page */
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        /* received submission details as html reponse. */
        const doc = new DOMParser().parseFromString(
          this.responseText,
          'text/html',
        );
        /* the response has a js object called pageData. */
        /* Pagedata has the details data with code about that submission */
        const scripts = doc.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const text = scripts[i].innerText;
          if (text.includes('pageData')) {
            /* Considering the pageData as text and extract the substring
            which has the full code */
            const firstIndex = text.indexOf('submissionCode');
            const lastIndex = text.indexOf('editCodeUrl');
            let slicedText = text.slice(firstIndex, lastIndex);
            /* slicedText has code as like as. (submissionCode: 'Details code'). */
            /* So finding the index of first and last single inverted coma. */
            const firstInverted = slicedText.indexOf("'");
            const lastInverted = slicedText.lastIndexOf("'");
            /* Extract only the code */
            const codeUnicoded = slicedText.slice(
              firstInverted + 1,
              lastInverted,
            );
            /* The code has some unicode. Replacing all unicode with actual characters */
            var code = codeUnicoded.replace(
              /\\u[\dA-F]{4}/gi,
              function (match) {
                return String.fromCharCode(
                  parseInt(match.replace(/\\u/g, ''), 16),
                );
              },
            );

            /*
            for a submisssion in explore section we do not get probStat beforehand
            so, parse statistics from submisson page
            */
            if (!msg) {
              slicedText = text.slice(
                text.indexOf('runtime'),
                text.indexOf('memory'),
              );
              const resultRuntime = slicedText.slice(
                slicedText.indexOf("'") + 1,
                slicedText.lastIndexOf("'"),
              );
              slicedText = text.slice(
                text.indexOf('memory'),
                text.indexOf('total_correct'),
              );
              const resultMemory = slicedText.slice(
                slicedText.indexOf("'") + 1,
                slicedText.lastIndexOf("'"),
              );
              msg = `Time: ${resultRuntime}, Memory: ${resultMemory} - LeetHub`;
            }

            if (code != null) {
              setTimeout(function () {
                uploadGit(
                  encodeToBase64(code),
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
        }
      }
    };

    xhttp.open('GET', submissionURL, true);
    xhttp.send();
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

function getProblemNameSlug() {
  const questionElem = document.getElementsByClassName(
    'content__u3I1 question-content__JfgR',
  );
  const questionDescriptionElem = document.getElementsByClassName(
    'question-description__3U1T',
  );
  let questionTitle = 'unknown-problem';
  if (checkElem(questionElem)) {
    const qtitle = document.getElementsByClassName('css-v3d350');
    if (checkElem(qtitle)) {
      questionTitle = qtitle[0].innerHTML;
    }
  } else if (checkElem(questionDescriptionElem)) {
    const qtitle = document.getElementsByClassName('question-title');
    if (checkElem(qtitle)) {
      questionTitle = qtitle[0].innerText;
    }
  }
  return addLeadingZeros(convertToSlug(questionTitle));
}

function addLeadingZeros(title) {
  const maxTitlePrefixLength = 4;
  const len = title.split('-')[0].length;
  if (len < maxTitlePrefixLength) {
    return '0'.repeat(4 - len) + title;
  }
  return title;
}

/* Parser function for the question and tags */
function parseQuestion() {
  let questionUrl = window.location.href;
  if (questionUrl.endsWith('/submissions/')) {
    questionUrl = questionUrl.substring(
      0,
      questionUrl.lastIndexOf('/submissions/') + 1,
    );
  }
  const questionElem = document.getElementsByClassName(
    'content__u3I1 question-content__JfgR',
  );
  const questionDescriptionElem = document.getElementsByClassName(
    'question-description__3U1T',
  );
  if (checkElem(questionElem)) {
    const qbody = questionElem[0].innerHTML;

    // Problem title.
    let qtitle = document.getElementsByClassName('css-v3d350');
    if (checkElem(qtitle)) {
      qtitle = qtitle[0].innerHTML;
    } else {
      qtitle = 'unknown-problem';
    }

    // Problem difficulty, each problem difficulty has its own class.
    const isHard = document.getElementsByClassName('css-t42afm');
    const isMedium = document.getElementsByClassName('css-dcmtd5');
    const isEasy = document.getElementsByClassName('css-14oi08n');

    if (checkElem(isEasy)) {
      difficulty = 'Easy';
    } else if (checkElem(isMedium)) {
      difficulty = 'Medium';
    } else if (checkElem(isHard)) {
      difficulty = 'Hard';
    }
    // Final formatting of the contents of the README for each problem
    const markdown = `<h2><a href="${questionUrl}">${qtitle}</a></h2><h3>${difficulty}</h3><hr>${qbody}`;
    return markdown;
  }
  if (checkElem(questionDescriptionElem)) {
    let questionTitle = document.getElementsByClassName(
      'question-title',
    );
    if (checkElem(questionTitle)) {
      questionTitle = questionTitle[0].innerText;
    } else {
      questionTitle = 'unknown-problem';
    }

    const questionBody = questionDescriptionElem[0].innerHTML;
    const markdown = `<h2>${questionTitle}</h2><hr>${questionBody}`;

    return markdown;
  }

  return null;
}

/* Parser function for time/space stats */
function parseStats() {
  const probStats = document.getElementsByClassName('data__HC-i');
  if (!checkElem(probStats)) {
    return null;
  }
  const time = probStats[0].textContent;
  const timePercentile = probStats[1].textContent;
  const space = probStats[2].textContent;
  const spacePercentile = probStats[3].textContent;

  // Format commit message
  return `Time: ${time} (${timePercentile}), Space: ${space} (${spacePercentile}) - LeetHub`;
}

document.addEventListener('click', (event) => {
  const element = event.target;
  const oldPath = window.location.pathname;

  /* Act on Post button click */
  /* Complex since "New" button shares many of the same properties as "Post button */
  if (
    element.classList.contains('icon__3Su4') ||
    element.parentElement.classList.contains('icon__3Su4') ||
    element.parentElement.classList.contains(
      'btn-content-container__214G',
    ) ||
    element.parentElement.classList.contains('header-right__2UzF')
  ) {
    setTimeout(function () {
      /* Only post if post button was clicked and url changed */
      if (
        oldPath !== window.location.pathname &&
        oldPath ===
          window.location.pathname.substring(0, oldPath.length) &&
        !Number.isNaN(window.location.pathname.charAt(oldPath.length))
      ) {
        const date = new Date();
        const currentDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes()}`;
        const addition = `[Discussion Post (created on ${currentDate})](${window.location})  \n`;
        const problemName = window.location.pathname.split('/')[2]; // must be true.

        uploadGit(
          addition,
          problemName,
          'README.md',
          discussionMsg,
          'update',
        );
      }
    }, 1000);
  }
});

/* function to get the notes if there is any
 the note should be opened atleast once for this to work
 this is because the dom is populated after data is fetched by opening the note */
function getNotesIfAny() {
  // there are no notes on expore
  if (document.URL.startsWith('https://leetcode.com/explore/'))
    return '';

  notes = '';
  if (
    checkElem(document.getElementsByClassName('notewrap__eHkN')) &&
    checkElem(
      document
        .getElementsByClassName('notewrap__eHkN')[0]
        .getElementsByClassName('CodeMirror-code'),
    )
  ) {
    notesdiv = document
      .getElementsByClassName('notewrap__eHkN')[0]
      .getElementsByClassName('CodeMirror-code')[0];
    if (notesdiv) {
      for (i = 0; i < notesdiv.childNodes.length; i++) {
        if (notesdiv.childNodes[i].childNodes.length == 0) continue;
        text = notesdiv.childNodes[i].childNodes[0].innerText;
        if (text) {
          notes = `${notes}\n${text.trim()}`.trim();
        }
      }
    }
  }
  return notes.trim();
}

const loader = setInterval(() => {
  const code = null;
  let probStatement = null;
  let probStats = null;
  let probType;
  const successTag = document.getElementsByClassName('success__3Ai7');
  const resultState = document.getElementById('result-state');
  let success = false;
  // check success tag for a normal problem
  if (
    checkElem(successTag) &&
    successTag[0].className === 'success__3Ai7' &&
    successTag[0].innerText.trim() === 'Success'
  ) {
    console.log(successTag[0]);
    success = true;
    probType = NORMAL_PROBLEM;
  }

  // check success state for a explore section problem
  else if (
    resultState &&
    resultState.className === 'text-success' &&
    resultState.innerText === 'Accepted'
  ) {
    success = true;
    probType = EXPLORE_SECTION_PROBLEM;
  }

  if (success) {
    probStatement = parseQuestion();
    probStats = parseStats();
  }

  if (probStatement !== null) {
    switch (probType) {
      case NORMAL_PROBLEM:
        successTag[0].classList.add('marked_as_success');
        break;
      case EXPLORE_SECTION_PROBLEM:
        resultState.classList.add('marked_as_success');
        break;
      default:
        console.error(`Unknown problem type ${probType}`);
        return;
    }

    const problemName = getProblemNameSlug();
    const language = findLanguage();
    if (language !== null) {
      // start upload indicator here
      startUpload();
      chrome.storage.local.get('stats', (s) => {
        const { stats } = s;
        const filePath = problemName + problemName + language;
        const sha = getSHA(stats, filePath);

        /* Only create README if not already created */
        if (sha === null) {
          /* @TODO: Change this setTimeout to Promise */
          uploadGit(
            encodeToBase64(probStatement),
            problemName,
            'README.md',
            readmeMsg,
            'upload',
          );
        }
      });

      /* get the notes and upload it */
      /* only upload notes if there is any */
      notes = getNotesIfAny();
      if (notes.length > 0) {
        setTimeout(function () {
          if (notes != undefined && notes.length != 0) {
            console.log('Create Notes');
            // means we can upload the notes too
            uploadGit(
              encodeToBase64(notes),
              problemName,
              'NOTES.md',
              createNotesMsg,
              'upload',
            );
          }
        }, 500);
      }

      /* Upload code to Git */
      setTimeout(function () {
        findCode(
          uploadGit,
          problemName,
          problemName + language,
          probStats,
          'upload',
          // callback is called when the code upload to git is a success
          () => {
            if (uploadState.countdown)
              clearTimeout(uploadState.countdown);
            delete uploadState.countdown;
            uploadState.uploading = false;
            markUploaded();
          },
        ); // Encode `code` to base64
      }, 1000);
    }
  }
}, 1000);

/* Since we dont yet have callbacks/promises that helps to find out if things went bad */
/* we will start 10 seconds counter and even after that upload is not complete, then we conclude its failed */
function startUploadCountDown() {
  uploadState.uploading = true;
  uploadState.countdown = setTimeout(() => {
    if ((uploadState.uploading = true)) {
      // still uploading, then it failed
      uploadState.uploading = false;
      markUploadFailed();
    }
  }, 10000);
}

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
  } else if (
    checkElem(document.getElementsByClassName('action__38Xc'))
  ) {
    target = document.getElementsByClassName('action__38Xc')[0];
    elem.className = 'runcode-wrapper__8rXm';
    if (target.childNodes.length > 0)
      target.childNodes[0].prepend(elem);
  }
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

// inject the style
injectStyle();

/* inject css style required for the upload progress feature */
function injectStyle() {
  const style = document.createElement('style');
  style.textContent =
    '.leethub_progress {pointer-events: none;width: 2.0em;height: 2.0em;border: 0.4em solid transparent;border-color: #eee;border-top-color: #3E67EC;border-radius: 50%;animation: loadingspin 1s linear infinite;} @keyframes loadingspin { 100% { transform: rotate(360deg) }}';
  document.head.append(style);
}
