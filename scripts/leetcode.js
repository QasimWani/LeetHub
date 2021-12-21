/* Enum for languages supported by LeetCode. */

const debug = true;

const languages = {
  Python: '.py',
  Python3: '.py',
  'C++': '.cpp',
  'C++17': '.cpp',
  C: '.c',
  Java: '.java',
  'Java 11': '.java',
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

const bj_level = {
  0:	"Unrated",
  1:	"Bronze V",
  2:	"Bronze IV",
  3:	"Bronze III",
  4:	"Bronze II",
  5:	"Bronze I",
  6:	"Silver V",
  7:	"Silver IV",
  8:	"Silver III",
  9:	"Silver II",
  10:	"Silver I",
  11:	"Gold V",
  12:	"Gold IV",
  13:	"Gold III",
  14:	"Gold II",
  15:	"Gold I",
  16:	"Platinum V",
  17:	"Platinum IV",
  18:	"Platinum III",
  19:	"Platinum II",
  20:	"Platinum I",
  21:	"Diamond V",
  22:	"Diamond IV",
  23:	"Diamond III",
  24:	"Diamond II",
  25:	"Diamond I",
  26:	"Ruby V",
  27:	"Ruby IV",
  28:	"Ruby III",
  29:	"Ruby II",
  30:	"Ruby I",
}
/* Commit messages */
const readmeMsg = 'Create README - BaekjunHub';
const discussionMsg = 'Prepend discussion post - BaekjunHub';
const createNotesMsg = 'Create NOTES - BaekjunHub';

/* Difficulty of most recenty submitted question */
let difficulty = '';

/* state of upload for progress */
let uploadState = { uploading: false }

/* Get file extension for submission */
function findLanguage() {
  const tag = [
    ...document.getElementsByClassName(
      // 'ant-select-selection-selected-value',
      'table-bordered'
    )
    // ...document.getElementsByClassName(
    //   'Select-value-label',
    // )
  ];
  if (tag && tag.length > 0) {
    for (let i = 0; i < tag.length; i += 1) {
      const elem = document.getElementsByClassName('table-bordered')[1][0][6][0];
      if(debug) if(debug) console.log('language is: '+ elem);
      if (elem !== undefined && languages[elem] !== undefined) {
        return languages[elem]; // should generate respective file extension
      }
    }
  }
  return null;
}

/* Main function for uploading code to GitHub repo, and callback cb is called if success */
const upload = (token, hook, code, directory, filename, sha, msg, cb=undefined) => {
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
            if(debug) console.log(
              `Successfully committed ${filename} to github`,
            );

            // if callback is defined, call it
            if(cb !== undefined) {
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
const update = (token, hook, addition, directory, msg, prepend, cb=undefined) => {
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
          cb
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
  cb = undefined
) {
  if(debug) console.log("msg:\n"+code);
  /* Get necessary payload data */
  chrome.storage.local.get('BaekjunHub_token', (t) => {
    const token = t.BaekjunHub_token;
    if (token) {
      chrome.storage.local.get('mode_type', (m) => {
        const mode = m.mode_type;
        if (mode === 'commit') {
          /* Get hook */
          chrome.storage.local.get('BaekjunHub_hook', (h) => {
            const hook = h.BaekjunHub_hook;
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
                    cb
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
                    cb
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
function findCode(uploadGit, problemName, fileName, msg, action, cb=undefined) {

  /* Get the submission details url from the submission page. */
  var submissionURL;
  // const e = document.getElementsByClassName('status-column__3SUg');
  const e = document.getElementById("status-table").childNodes[1].childNodes[0].childNodes[0].innerHTML;
  if (checkElem(e)) {
    // for normal problem submisson
    if(debug) console.log("https://www.acmicpc.net/source/"+e);
    submissionURL = "https://www.acmicpc.net/source/" + e;
  } else{
    return;
    // for a submission in explore section
    // const submissionRef = document.getElementById('result-state');
    // submissionURL = submissionRef.href;
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
        var code = doc.getElementsByClassName('codemirror-textarea')[0].innerHTML;
        
        code = code.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
        if(debug) console.log(code);
        // for (var i = 0; i < scripts.length; i++) {
          // var text = scripts[i].innerText;
        // var text = scripts.innerHTML;
        // if (text.includes('pageData')) {
          /* Considering the pageData as text and extract the substring
          which has the full code */
          // var firstIndex = text.indexOf('submissionCode');
          // var lastIndex = text.indexOf('editCodeUrl');
          // var slicedText = text.slice(firstIndex, lastIndex);
          /* slicedText has code as like as. (submissionCode: 'Details code'). */
          /* So finding the index of first and last single inverted coma. */
          // var firstInverted = slicedText.indexOf("\"");
          // var lastInverted = slicedText.lastIndexOf("\"");
            /* Extract only the code */
            // var codeUnicoded = slicedText.slice(
          // var code = slicedText.slice(
          //   firstInverted + 1,
          //   lastInverted,
          // );
          /* The code has some unicode. Replacing all unicode with actual characters */
          // var code = codeUnicoded.replace(
            //   /\\u[\dA-F]{4}/gi,
            //   function (match) {
              //     return String.fromCharCode(
                //       parseInt(match.replace(/\\u/g, ''), 16),
                //     );
                //   },
                // );
                
                /*
                for a submisssion in explore section we do not get probStat beforehand
                so, parse statistics from submisson page
                */
        if(!msg){
          const levelxhttp = new XMLHttpRequest();
          levelxhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
              /* received submission details as html reponse. */
              var leveldoc = JSON.parse(this.response);
              // var bj_title = document.querySelector("body > div.wrapper > div.container.content > div.row > div:nth-child(10) > div > table > tbody > tr > td:nth-child(4)").innerHTML;
              var bj_memory = document.getElementById("status-table").childNodes[1].childNodes[0].childNodes[4].innerText;
              var bj_runtime = document.getElementById("status-table").childNodes[1].childNodes[0].childNodes[5].innerText;
              if(debug) console.log(bj_memory);
              if(debug) console.log(bj_runtime);
              if(debug) console.log(leveldoc);
              msg = `[${bj_level[leveldoc.level]}] Title: ${leveldoc.titleKo} Time: ${bj_runtime}, Memory: ${bj_memory} -BaekjunHub`; 
              if(debug) console.log(msg);
            }
          }
          var problemId = getProblemId();
          // document.getElementsByClassName("table-striped")[0].childNodes[1].childNodes[0].childNodes[0].innerHTML;
          if(debug) console.log(problemId);
          levelxhttp.open('GET', "https://solved.ac/api/v3/problem/show?problemId="+problemId, true);
          levelxhttp.send();
        }

        if (code != null) {
          setTimeout(function () {
            uploadGit(
              btoa(unescape(encodeURIComponent(code))),
              problemName,
              fileName,
              msg,
              action,
              true,
              cb
            );
          }, 2000);
        }
        // }
        // }
      }
    };

    xhttp.open('GET', submissionURL, true);
    xhttp.send();
    
  }
  if(debug) console.log(submissionURL);
}

/* Main parser function for the code */
// function parseCode() {
//   const e = document.getElementsByClassName('CodeMirror-code');
//   if (e !== undefined && e.length > 0) {
//     const elem = e[0];
//     let parsedCode = '';
//     const textArr = elem.innerText.split('\n');
//     for (let i = 1; i < textArr.length; i += 2) {
//       parsedCode += `${textArr[i]}\n`;
//     }
//     return parsedCode;
//   }
//   return null;
// }

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
  const problemElem = document.getElementById("status-table").childNodes[1].childNodes[0].childNodes[2];
  let result = "";
  for(let i =0; i <= problemElem.childElementCount; i++){
    let temp_name = problemElem.childNodes[i].innerHTML;
    if(temp_name== null || temp_name=='undefined' || temp_name==undefined) continue;
    if(temp_name.length > result.length){
      result = problemElem.childNodes[i].innerHTML;
    }
  }
  if(debug) console.log(result);
  return result;
}

function getProblemId(){
  const problemElem = document.getElementsByClassName("table-striped")[0].childNodes[1].childNodes[0].childNodes[2];
  
  if(debug) console.log("getProblemId: ");
  if(debug) console.log(problemElem);
  let resultId = "";
  // let resultId = problemElem.childNodes[2].innerHTML.toString();
  for(let i =0; i <= problemElem.childElementCount; i++){
    let temp_name = problemElem.childNodes[i].innerHTML;
    // if(debug) console.log(i+" "+temp_name);
    if(temp_name== null || temp_name=='undefined' || temp_name==undefined) continue;
    // if(debug) console.log(temp_name.length + " vs " + resultId.length);
    if(temp_name.length > resultId.length){
      if(debug) console.log("adding: "+temp_name);
      resultId = temp_name;
    }
  }
  if(debug) console.log(resultId);
  return resultId;
}

/* Parser function for the question and tags */
function parseQuestion() {
  if(debug) console.log("at ParseQuestion\n\n");
  var questionDescription = "";
  var submissionURL;
  const e = getProblemId();
  if (checkElem(e)) {
    if(debug) console.log("https://www.acmicpc.net/problem/"+e);
    submissionURL = "https://www.acmicpc.net/problem/" + e;
  } else{
    return;
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
        
        questionDescription = doc.getElementById('problem_description').innerText;
        questionDescription = questionDescription.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
        console.log(questionDescription);
      }
    };
    xhttp.open('GET', submissionURL, true);
    xhttp.send();  
    xhttp.onload = function(){
      console.log("returning: " + questionDescription);
      return questionDescription;
    }
  }
  else return questionDescription;
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
  return `Time: ${time} (${timePercentile}), Space: ${space} (${spacePercentile}) - BaekjunHub`;
}

document.addEventListener('click', (event) => {
  const element = event.target;
  const oldPath = window.location.pathname;
  if(debug) console.log("flaxinger clicked");
  /* Act on Post button click */
  /* Complex since "New" button shares many of the same properties as "Post button */
  if (
    element.getAttribute('data-loading-text') ==="제출 중..." ||
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
        if(debug) console.log('here we are\n\n\n\n');
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



const loader = setInterval(() => {
  let code = null;
  let probStatement = null;
  let probStats = null;

  // const successTag = document.getElementsByClassName('success__3Ai7');
  const successTagpre = document.getElementById("status-table");
  if(debug) console.log(successTagpre);
  if(successTagpre == null || typeof successTagpre === 'undefined') return null;
  if(successTagpre!==null && typeof successTagpre !== 'undefined') if(debug) console.log("Success Tag is: "+successTagpre.childNodes[1].childNodes[0].childNodes[3].childNodes[0].innerHTML);
  else{
    if(debug) console.log("Error");
    return null;
  }
  var success = false;
  const successTag = successTagpre.childNodes[1].childNodes[0].childNodes[3].childNodes[0].innerHTML;
  if (checkElem(successTag) && successTag === "맞았습니다!!"){
    if(debug) console.log("맞았네..???");
    if(debug) console.log("got probStatement\n"+probStatement);
    success=true;
  }
/////////////////////////////////////////////////////////////////////////////////////////////
  if(debug) console.log("at ParseQuestion\n\n");

  var submissionURL;
  const e = getProblemId();
  if (checkElem(e)) {
    if(debug) console.log("https://www.acmicpc.net/problem/"+e);
    submissionURL = "https://www.acmicpc.net/problem/" + e;
  } else{
    return;
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
        
        probStatement = doc.getElementById('problem_description').innerText;
        probStatement = probStatement.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').trim();
        console.log(probStatement);
      }
    };
    xhttp.open('GET', submissionURL, true);
    xhttp.send();  
    xhttp.onload = function(){
/////////////////////////////////////////////////////////////////////////////////////////////
      if(success) {
        clearTimeout(loader);
        if(debug) console.log("next func");
        const problemName = getProblemNameSlug();
        let language = document.getElementById("status-table").childNodes[1].childNodes[0].childNodes[6].childNodes[0].innerHTML;
        if(debug) console.log(language);
        if(languages[language]!==undefined) language = languages[language];
        if (language !== null) {
          startUpload();
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

            if (sha === null) {
              uploadGit(
                btoa(unescape(encodeURIComponent("# "+problemName+"\n\n\n"+probStatement))),
                problemName,
                'README.md',
                readmeMsg,
                'upload',
              );
            }
          });


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
                if(uploadState['countdown']) clearTimeout(uploadState['countdown']); 
                delete uploadState['countdown']
                uploadState.uploading = false; 
                markUploaded(); 
              }
            ); // Encode `code` to base64
          }, 1000);
        }
      }
    }
  }
}, 1000);


/* Since we dont yet have callbacks/promises that helps to find out if things went bad */
/* we will start 10 seconds counter and even after that upload is not complete, then we conclude its failed */
function startUploadCountDown() {
  uploadState.uploading = true;
  uploadState['countdown'] = setTimeout(() => {
    if (uploadState.uploading = true) {
      // still uploading, then it failed
      uploadState.uploading = false;
      markUploadFailed();
    }
  }, 10000);
}
/* start upload will inject a spinner on left side to the "Run Code" button */
function startUpload() {
  elem = document.getElementById('BaekjunHub_progress_anchor_element')
  if (elem !== undefined) {
    elem = document.createElement('span')
    elem.id = "BaekjunHub_progress_anchor_element"
    elem.className = "runcode-wrapper__8rXm"
    elem.style = "margin-right: 20px;padding-top: 2px;"
  }
  elem.innerHTML = `<div id="BaekjunHub_progress_elem" class="BaekjunHub_progress"></div>`
  target = document.getElementsByClassName('loginbar')[0];
  if(debug) console.log("startUpload: target is " + target);
  if (target.childNodes.length > 0) {
    target.childNodes[0].prepend(elem)
  }
  // start the countdown
  startUploadCountDown();
}

/* This will create a tick mark before "Run Code" button signalling BaekjunHub has done its job */
function markUploaded() {
  elem = document.getElementById("BaekjunHub_progress_elem");
  elem.className = "";
  style = 'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid #78b13f;border-right:7px solid #78b13f;'
  elem.style = style;
}

/* This will create a failed tick mark before "Run Code" button signalling that upload failed */
function markUploadFailed() {
  elem = document.getElementById("BaekjunHub_progress_elem");
  elem.className = "";
  style = 'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid red;border-right:7px solid red;'
  elem.style = style;
}

/* Sync to local storage */
chrome.storage.local.get('isSync', (data) => {
  keys = [
    'BaekjunHub_token',
    'BaekjunHub_username',
    'pipe_BaekjunHub',
    'stats',
    'BaekjunHub_hook',
    'mode_type',
  ];
  if (!data || !data.isSync) {
    keys.forEach((key) => {
      chrome.storage.sync.get(key, (data) => {
        chrome.storage.local.set({ [key]: data[key] });
      });
    });
    chrome.storage.local.set({ isSync: true }, (data) => {
      if(debug) console.log('BaekjunHub Synced to local values');
    });
  } else {
    if(debug) console.log('BaekjunHub Local storage already synced!');
  }
});

// inject the style
injectStyle();

/* inject css style required for the upload progress feature */
function injectStyle() {
  const style = document.createElement('style');
  style.textContent = '.BaekjunHub_progress {pointer-events: none;width: 2.0em;height: 2.0em;border: 0.4em solid transparent;border-color: #eee;border-top-color: #3E67EC;border-radius: 50%;animation: loadingspin 1s linear infinite;} @keyframes loadingspin { 100% { transform: rotate(360deg) }}';
  document.head.append(style);
}