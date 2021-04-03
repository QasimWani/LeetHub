/* Enum for languages supported by GeeksForGeeks. */
// const gfgLanguages = {
//   Python3: '.py',
//   'C++': '.cpp',
//   Java: '.java',
//   Javascript: '.js',
// };

// console.log("started gfg script");

/* Commit messages */
const README_MSG = "Create README - LeetHub";
const SUBMIT_MSG = "Added solution - LeetHub";
const UPDATE_MSG = "Updated solution - LeetHub";

function findGfgLanguage() {
  const ele = document.getElementsByClassName("filter-option")[0].innerText;
  let lang = ele.split("(")[0].trim();
  if (lang.length > 0 && languages[lang]) {
    return languages[lang];
  }
  return null;
}

function findTitle() {
  const ele = document.getElementsByClassName("problem-tab__name")[0].innerText;
  if (ele != null) {
    return ele;
  }
  return "";
}

function findDifficulty() {
  const ele = document.getElementsByClassName("problem-tab__problem-level")[0]
    .innerText;
  if (ele != null) {
    return ele;
  }
  return "";
}

function getProblemStatement() {
  const ele = document.getElementsByClassName("problem-statement")[0];
  return `${ele.outerHTML}`;
}

function getCode() {
  let hackyScriptContent = `
  console.log("trying to get editor content");
  var editorContent = editor.getValue();
  console.log(editorContent);
  var para = document.createElement("pre");
  para.innerText+=editorContent;
  para.setAttribute("id","codeDataLeetHub")
  // para.appendChild(node);
  document.body.appendChild(para);
  // console.log(para);
  `;

  // console.log(hackyScriptContent);

  var script = document.createElement("script");
  script.id = "tmpScript";
  script.appendChild(document.createTextNode(hackyScriptContent));
  (document.body || document.head || document.documentElement).appendChild(
    script
  );
  const text = document.getElementById("codeDataLeetHub").innerText;

  let nodeDeletionScript = `
  document.body.removeChild(para)
  `;
  var script = document.createElement("script");
  script.id = "tmpScript";
  script.appendChild(document.createTextNode(nodeDeletionScript));
  (document.body || document.head || document.documentElement).appendChild(
    script
  );

  return text ? text : "";
}

const gfgLoader = setInterval(() => {
  let code = null;
  let problemStatement = null;
  let title = null;
  let language = null;
  let difficulty = null;

  if (window.location.href.includes("practice.geeksforgeeks.org")) {
    let submitBtn = document.getElementById("run");

    // console.log("listening to events");
    submitBtn.addEventListener("click", function () {
      const submission = setInterval(() => {
        let output = document.getElementsByClassName("out")[0].innerText;
        if (output.includes("Correct Answer")) {
          // clear timeout
          clearTimeout(gfgLoader);
          clearTimeout(submission);
          // get data
          title = findTitle().trim();
          difficulty = findDifficulty();
          problemStatement = getProblemStatement();
          code = getCode();
          language = findGfgLanguage();

          // format data
          let probName = title + ` - GFG`;

          problemStatement =
            `# ${title}\n## ${difficulty}\n` + problemStatement;

          //
          if (language !== null) {
            chrome.storage.local.get("stats", (s) => {
              const { stats } = s;
              const filePath = title + "gfg" + language;
              let sha = null;
              if (
                stats !== undefined &&
                stats.sha !== undefined &&
                stats.sha[filePath] !== undefined
              ) {
                sha = stats.sha[filePath];
              }

              // Only create README if not already created
              if (sha === null) {
                uploadGit(
                  btoa(problemStatement),
                  probName,
                  "README.md",
                  README_MSG,
                  "upload"
                );
              }

              if (code !== "") {
                setTimeout(function () {
                  uploadGit(
                    btoa(code),
                    probName,
                    title + language,
                    SUBMIT_MSG,
                    "upload"
                  );
                }, 2000);
              }
            });
          }

        } else if (output.includes("Compilation Error")) {
          // clear timeout and do nothing
          clearTimeout(submission);
        }
      }, 3000);
    });
  }
}, 1000);
