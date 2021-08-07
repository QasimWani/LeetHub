/* Enum for languages supported by LeetCode. */
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

/* Commit messages */
const readmeMsg = 'Create README - LeetHub';
const discussionMsg = 'Prepend discussion post - LeetHub';
const createNotesMsg = 'Create NOTES - LeetHub';

/* Difficulty of most recenty submitted question */
let difficulty = '';

/* Get file extension for submission */
function findLanguage() {
  const tag = [
    ...document.getElementsByClassName(
      'ant-select-selection-selected-value',
    ),
    ...document.getElementsByClassName(
      'Select-value-label',
    )
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

/* Main function for uploading code to GitHub repo */
const upload = (token, hook, code, directory, filename, sha, msg) => {
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
            stats.easy += difficulty === 'Easy' ? 1 : 0;
            stats.medium += difficulty === 'Medium' ? 1 : 0;
            stats.hard += difficulty === 'Hard' ? 1 : 0;
          }
          stats.sha[filePath] = updatedSha; // update sha key.
          chrome.storage.local.set({ stats }, () => {
            console.log(
              `Successfully committed ${filename} to github`,
            );
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
const update = (token, hook, addition, directory, msg, prepend) => {
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
        upload(
          token,
          hook,
          newContent,
          directory,
          'README.md',
          response.sha,
          msg,
        );
      }
    }
  });
  xhr.open('GET', URL, true);
  xhr.setRequestHeader('Authorization', `token ${token}`);
  xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
  xhr.send();
};

function uploadGit(
  code,
  problemName,
  fileName,
  msg,
  action,
  prepend = true,
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
                  upload(
                    token,
                    hook,
                    code,
                    problemName,
                    fileName,
                    sha,
                    msg,
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
function findCode(uploadGit, problemName, fileName, msg, action) {

  /* Get the submission details url from the submission page. */
  var submissionURL;
  const e = document.getElementsByClassName('status-column__3SUg');
  if (checkElem(e)) {
    // for normal problem submisson
    const submissionRef = e[1].innerHTML.split(' ')[1];
    submissionURL = "https://leetcode.com" + submissionRef.split('=')[1].slice(1, -1);
  } else{
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
        var doc = new DOMParser().parseFromString(
          this.responseText,
          'text/html',
        );
        /* the response has a js object called pageData. */
        /* Pagedata has the details data with code about that submission */
        var scripts = doc.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
          var text = scripts[i].innerText;
          if (text.includes('pageData')) {
            /* Considering the pageData as text and extract the substring
            which has the full code */
            var firstIndex = text.indexOf('submissionCode');
            var lastIndex = text.indexOf('editCodeUrl');
            var slicedText = text.slice(firstIndex, lastIndex);
            /* slicedText has code as like as. (submissionCode: 'Details code'). */
            /* So finding the index of first and last single inverted coma. */
            var firstInverted = slicedText.indexOf("'");
            var lastInverted = slicedText.lastIndexOf("'");
            /* Extract only the code */
            var codeUnicoded = slicedText.slice(
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
            if(!msg){
              slicedText = text.slice(text.indexOf("runtime"),text.indexOf("memory"));
              const resultRuntime = slicedText.slice(slicedText.indexOf("'")+1,slicedText.lastIndexOf("'"));
              slicedText = text.slice(text.indexOf("memory"),text.indexOf("total_correct"));
              const resultMemory = slicedText.slice(slicedText.indexOf("'")+1,slicedText.lastIndexOf("'"));
              msg = `Time: ${resultRuntime}, Memory: ${resultMemory} -LeetHub`; 
            }

            if (code != null) {
              setTimeout(function () {
                uploadGit(
                  btoa(unescape(encodeURIComponent(code))),
                  problemName,
                  fileName,
                  msg,
                  action,
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

/* Util function to check if an element exists */
function checkElem(elem) {
  return elem && elem.length > 0;
}
function convertToSlug(string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return string.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}
function getProblemNameSlug(){
  const questionElem = document.getElementsByClassName(
    'content__u3I1 question-content__JfgR',
  );
  const questionDescriptionElem = document.getElementsByClassName("question-description__3U1T");
  let questionTitle = "unknown-problem";
  if (checkElem(questionElem)) {
    let qtitle = document.getElementsByClassName('css-v3d350');
    if (checkElem(qtitle)) {
      questionTitle = qtitle[0].innerHTML;
    }
  } else if(checkElem(questionDescriptionElem)){
    let qtitle = document.getElementsByClassName("question-title");
    if(checkElem(qtitle)){
      questionTitle = qtitle[0].innerText;
    } 
  }
  return convertToSlug(questionTitle);
}

/* Parser function for the question and tags */
function parseQuestion() {
  const questionElem = document.getElementsByClassName(
    'content__u3I1 question-content__JfgR',
  );
  const questionDescriptionElem = document.getElementsByClassName("question-description__3U1T");
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
    const markdown = `<h2>${qtitle}</h2><h3>${difficulty}</h3><hr>${qbody}`;
    return markdown;
  } else if(checkElem(questionDescriptionElem)){
    
    let questionTitle = document.getElementsByClassName("question-title");
    if(checkElem(questionTitle)){
      questionTitle = questionTitle[0].innerText;
    } else{
      questionTitle = "unknown-problem";
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
  notes = '';
  notesdiv = document
    .getElementsByClassName('notewrap__eHkN')[0]
    .getElementsByClassName('CodeMirror-code')[0];
  if (notesdiv) {
    for (i = 0; i < notesdiv.childNodes.length; i++) {
      if (notesdiv.childNodes[i].childNodes.length == 0) continue;
      text = notesdiv.childNodes[i].childNodes[0].innerText;
      if (text) {
        notes = `${notes}\n${text.trim()}`;
      }
    }
  }
  return notes.trim();
}

const loader = setInterval(() => {
  let code = null;
  let probStatement = null;
  let probStats = null;

  const successTag = document.getElementsByClassName('success__3Ai7');
  const resultState = document.getElementById("result-state");
  var success = false;
  if (checkElem(successTag) && successTag[0].innerText.trim() === 'Success'){
    success = true;
  }
  else if(resultState && resultState.innerText=="Accepted"){
    success = true;
  }
  if(success) {
    probStatement = parseQuestion();
    probStats = parseStats();
  }
  
  if (probStatement !== null) {
    clearTimeout(loader);
    const problemName = getProblemNameSlug();
    const language = findLanguage();
    if (language !== null) {
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
          uploadGit(
            btoa(unescape(encodeURIComponent(probStatement))),
            problemName,
            'README.md',
            readmeMsg,
            'upload',
          );
        }
      });

      /* get the notes and upload it */
      setTimeout(function () {
        notes = getNotesIfAny();
        if (notes != undefined && notes.length != 0) {
          console.log('Create Notes');
          // means we can upload the notes too
          uploadGit(
            btoa(unescape(encodeURIComponent(notes))),
            problemName,
            'NOTES.txt',
            createNotesMsg,
            'upload',
          );
        }
      }, 500);

      /* Upload code to Git */
      setTimeout(function () {
        findCode(
          uploadGit,
          problemName,
          problemName + language,
          probStats,
          'upload',
        ); // Encode `code` to base64
      }, 1000);
    }
  }
}, 1000);

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
