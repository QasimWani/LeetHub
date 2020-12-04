/* Enum for languages supported by LeetCode. */
const languages = {
  Python: '.py',
  Python3: '.py',
  'C++': '.cpp',
  C: '.c',
  Java: '.java',
  'C#': '.cs',
  JavaScript: '.js',
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

/* Difficulty of most recenty submitted question */
let difficulty = '';

/* Get file extension for submission */
function findLanguage() {
  const tag = [
    ...document.getElementsByClassName(
      'ant-select-selection-selected-value',
    ),
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
const upload = (token, hook, code, directory, filename, sha) => {
  // To validate user, load user object from GitHub.
  const URL = `https://api.github.com/repos/${hook}/contents/${directory}/${filename}`;

  /* Define Payload */
  let data = {
    message: `working commit - Created using LeetHub`,
    content: code,
  };
  if (sha !== null) {
    data.sha = sha; // get sha for files that already exist in the gh file system.
  }

  data = JSON.stringify(data);

  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 201) {
        const updatedSha = JSON.parse(xhr.responseText).content.sha; // get updated SHA.

        chrome.storage.sync.get('stats', (data2) => {
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
          chrome.storage.sync.set({ stats }, () => {
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

function uploadGit(code, problemName, filename) {
  /* Get necessary payload data */
  chrome.storage.sync.get('leethub_token', (t) => {
    const token = t.leethub_token;
    if (token) {
      chrome.storage.sync.get('mode_type', (m) => {
        const mode = m.mode_type;
        if (mode === 'commit') {
          /* Get hook */
          chrome.storage.sync.get('leethub_hook', (h) => {
            const hook = h.leethub_hook;
            if (hook) {
              /* Get SHA, if it exists */

              /* to get unique key */
              const filePath = problemName + filename;
              chrome.storage.sync.get('stats', (s) => {
                const { stats } = s;
                let sha = null;

                if (
                  stats !== undefined &&
                  stats.sha !== undefined &&
                  stats.sha[filePath] !== undefined
                ) {
                  sha = stats.sha[filePath];
                }
                /* Upload to git. */
                upload(token, hook, code, problemName, filename, sha);
              });
            }
          });
        }
      });
    }
  });
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

/* Parser function for the question and tags */
function parseQuestion() {
  const questionElem = document.getElementsByClassName(
    'content__u3I1 question-content__JfgR',
  );
  if (!checkElem(questionElem)) {
    return null;
  }
  const qbody = questionElem[0].innerHTML;

  // Problem title.
  let qtitle = document.getElementsByClassName('css-v3d350')[0];
  if (checkElem(qtitle)) {
    qtitle = qtitle.innerHTML;
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
}

/* Only poll when submit button clicked */
document.addEventListener('click', (event) => {
  const element = event.target;
  if (
    element.classList.contains('css-gahzfj-sm') ||
    element.parentElement.classList.contains('css-gahzfj-sm')
  ) {
    const loader = setInterval(() => {
      let code = null;
      let probStatement = null;

      const successTag = document.getElementsByClassName(
        'success__3Ai7',
      );
      if (
        successTag !== undefined &&
        successTag.length > 0 &&
        successTag[0].innerText.trim() === 'Success'
      ) {
        code = parseCode();
        probStatement = parseQuestion();
      }
      if (code !== null && probStatement !== null) {
        clearTimeout(loader);
        const problemName = window.location.pathname.split('/')[2]; // must be true.
        const language = findLanguage();
        if (language !== null) {
          uploadGit(
            btoa(unescape(encodeURIComponent(code))),
            problemName,
            problemName + language,
          ); // Encode `code` to base64

          /* @TODO: Change this setTimeout to Promise */
          setTimeout(function () {
            uploadGit(
              btoa(unescape(encodeURIComponent(probStatement))),
              problemName,
              'README.md',
            );
          }, 2000);
        }
      }
    }, 1000);
  }
});
