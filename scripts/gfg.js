/* Enum for languages supported by GeeksForGeeks. */
// const gfgLanguages = {
//   Python3: '.py',
//   'C++': '.cpp',
//   Java: '.java',
//   Javascript: '.js',
// };

/* Commit messages */
const README_MSG = 'Create README - LeetHub';
const SUBMIT_MSG = 'Added solution - LeetHub';
const UPDATE_MSG = 'Updated solution - LeetHub';
let START_MONITOR = true;
const toKebabCase = (string) => {
  return string
    .replace(/[^a-zA-Z0-9\. ]/g, '') // remove special chars
    .replace(/([a-z])([A-Z])/g, '$1-$2') // get all lowercase letters that are near to uppercase ones
    .replace(/[\s_]+/g, '-') // replace all spaces and low dash
    .toLowerCase(); // convert to lower case
};

function findGfgLanguage() {
  const ele = document.getElementsByClassName('divider text')[0]
    .innerText;
  const lang = ele.split('(')[0].trim();
  if (lang.length > 0 && languages[lang]) {
    return languages[lang];
  }
  return null;
}

function findTitle() {
  const ele = document.querySelector('[class^="problems_header_content__title"] > h3')
    .innerText;
  if (ele != null) {
    return ele;
  }
  return '';
}

function findDifficulty() {
  const ele = document.querySelectorAll('[class^="problems_header_description"]')[0].children[0].innerText;

  if (ele != null) {
    if (ele.trim() == 'Basic' || ele.trim() === 'School') {
      return 'Easy';
    }
    return ele;
  }
  return '';
}

function getProblemStatement() {
  const ele = document.querySelector('[class^="problems_problem_content"]');
  return `${ele.outerHTML}`;
}

function getCode() {

  const scriptContent = `
  var editor = ace.edit("ace-editor");
  var editorContent = editor.getValue();
  var para = document.createElement("pre");
  para.innerText+=editorContent;
  para.setAttribute("id","codeDataLeetHub")
  document.body.appendChild(para);
  `;

  var script = document.createElement('script');
  script.id = 'tmpScript';
  script.appendChild(document.createTextNode(scriptContent));
  (
    document.body ||
    document.head ||
    document.documentElement
  ).appendChild(script);
  const text = document.getElementById('codeDataLeetHub').innerText;

  const nodeDeletionScript = `
  document.body.removeChild(para)
  `;
  var script = document.createElement('script');
  script.id = 'tmpScript';
  script.appendChild(document.createTextNode(nodeDeletionScript));
  (
    document.body ||
    document.head ||
    document.documentElement
  ).appendChild(script);

  return text || '';
}

const gfgLoader = setInterval(() => {
  let code = null;
  let problemStatement = null;
  let title = null;
  let language = null;
  let difficulty = null;

  if (
    window.location.href.includes(
      'practice.geeksforgeeks.org/problems',
    )
  ) {

    const submitBtn = document.evaluate(".//button[text()='Submit']", document.body, null, XPathResult.ANY_TYPE, null).iterateNext();

    submitBtn.addEventListener('click', function () {
      START_MONITOR = true;
      const submission = setInterval(() => {
        const output = document.querySelectorAll('[class^="problems_content"]')[0]
          .innerText;
        if (
          output.includes('Problem Solved Successfully') &&
          START_MONITOR
        ) {
          // clear timeout
          START_MONITOR = false;
          clearInterval(gfgLoader);
          clearInterval(submission);
          // get data
          title = findTitle().trim();
          difficulty = findDifficulty();
          problemStatement = getProblemStatement();
          code = getCode();
          language = findGfgLanguage();

          // format data
          const probName = `${title} - GFG`;

          problemStatement = `# ${title}\n## ${difficulty}\n${problemStatement}`;

          // if language was found
          if (language !== null) {
            chrome.storage.local.get('stats', (s) => {
              const { stats } = s;
              const filePath =
                probName + toKebabCase(title + language);
              let sha = null;
              if (
                stats !== undefined &&
                stats.sha !== undefined &&
                stats.sha[filePath] !== undefined
              ) {
                sha = stats.sha[filePath];
              }

              // Only create README if not already created
              // if (sha === null) {
              uploadGit(
                btoa(unescape(encodeURIComponent(problemStatement))),
                probName,
                'README.md',
                README_MSG,
                'upload',
                undefined,
                undefined,
                difficulty,
              );
              // }

              if (code !== '') {
                setTimeout(function () {
                  uploadGit(
                    btoa(unescape(encodeURIComponent(code))),
                    probName,
                    toKebabCase(title + language),
                    SUBMIT_MSG,
                    'upload',
                    undefined,
                    undefined,
                    difficulty,
                  );
                }, 1000);
              }
            });
          }
        } else if (output.includes('Compilation Error')) {
          // clear timeout and do nothing
          clearInterval(submission);
        } else if (
          !START_MONITOR &&
          (output.includes('Compilation Error') ||
            output.includes('Correct Answer'))
        ) {
          clearInterval(submission);
        }
      }, 1000);
    });
  }
}, 1000);
