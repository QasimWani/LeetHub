// local storage for question titles
class LHLocalStorage{
  partitionBaseName = 'lh-storage'; // base name used for partition
  storage = window.localStorage;
  partitions; // chrome's localstorage can hold at most 2KB per key:value pair
  partitionMaxSize = 1900; // holds at max 2KB (1.9KB to be safe) per key:value pair

  constructor(){
    var p = 0
    // check how many partitons of lh-storage exists
    while(this.storage.getItem(`${this.partitionBaseName}-${p}`) != null){
      p ++;
    }
    this.partitions = p // we have p partitions of 2KB, starting from "lh-storage-0"
    console.log(`current partitions: ${this.partitions}`)
  }
  
  // private method (shouldn't be used outside this scope)
  // Method returns question data from local storage partition if partition exists.
  getPartitionData = (partitionName) => {
    const questionData = this.storage.getItem(partitionName)
    if(questionData == null){
      // partition does not exists (should never be the case)
      console.log(`partition ${partitionName} does not exist!`)
      return null;
    }
    return questionData
  }

  // private method (shouldn't be used outside this scope)
  // Method returns size of partition data (in bytes)
  // should only be called if partition is present
  getPartitionSize = (partitionName) => unescape(
    encodeURIComponent(this.getPartitionData(partitionName))
  ).length;

  
  // private method (shouldn't be used outside this scope)
  // Method returns first available partition name. If all partitions are full, creates new one
  firstAvailablePartition = (payload) => {
    var p = 0;
    const payloadSize = unescape(encodeURIComponent(payload)).length // size of data we want to put into partition
    while(p < this.partitions){
      // check to see if partition isn't too big to include the new data with itself
      const questionData = this.getPartitionData(`${this.partitionBaseName}-${p}`)
      if(questionData != null && 
        this.getPartitionSize(`${this.partitionBaseName}-${p}`) + payloadSize <= this.partitionMaxSize
      ){
        return `${this.partitionBaseName}-${p}`
      }
      p++
    }
    // no partitions available - create new partition
    return this.generatePartition()
  }

  // private method (shouldn't be used outside this scope)
  // Method generates a new partition and returns the partition name (key in local storage)
  generatePartition = () => {
    let partitionData = '';
    const newPartitionName = `${this.partitionBaseName}-${this.partitions}` 
    this.storage.setItem(newPartitionName, partitionData) // creates new partition
    this.partitions++ // increment partitions
    return newPartitionName
  }


  /**
   * Checks to see if question title is stored in local storage and returns full title. If not present in local storage, returns null
   * 
   * @param {string} name The name of the question as defined by LeetCode (not slug format)
   * For example, for "1. Two Sum: Easy", name should be "Two Sum"
   * @returns {Array[string]} The title of the problem [0] and its difficulty [1]. Eg. ("X. Question Name", "Easy")
   */
  getQuestionTitle(name){
    // make regex query across all partitions
    var p = 0;
    while(p < this.partitions){
      const questionData = this.getPartitionData(`${this.partitionBaseName}-${p}`)
      // question data is a massive string that contains name and numbers of leetcode questions
      // previously stored on the local machine. It should follow the structure '1. Two Sum: Easy; 2. ...'
      if(questionData){
        let match = questionData.match(
          new RegExp(`(\\d+[.]\\s${name}):\\s(Easy|Medium|Hard)`, "i")
        ) // find match
        if(match){
          return match.slice(1) // eg. returns ('1. Two Sum', 'Easy')
        }
      }
      p++
    }
    // question not present in any partitions
    return null;
  }

  /**
   * Adds the full question title into localstorage in the first available partition
   * 
   * @param {string} title The title (with number) of the question as defined by LeetCode (not slug format)
   * For example, for Two Sum, the title should be "1. Two Sum: Easy"
   * @returns {int} Status of upload. 0 means all went well. 1 means something went wrong. 2 means title
   *  already exists in local storage
   */
  setQuestionTitle(title){
    if(!title.match(
      new RegExp(`(\\d+[.]\\s(.*)):\\s(Easy|Medium|Hard)`, "i")
    )){
      console.error(`Title ${title} does not match the pattern /(\\d+[.]\\(.*)):\\s(Easy|Medium|Hard)/i`)
      return 1;
    }

    // check if it isn't already in local storage
    let splitTitle = title.split(/\d+[.][\s]?(.*):\s(Easy|Medium|Hard)/)
    const questionName = splitTitle[1]
    if(this.getQuestionTitle(questionName)){
      console.log(`Question ${title} has already been cached.`)
      return 2;
    }
    
    // find earliest available partition
    const payload = `${title}; `
    let currPartition = this.firstAvailablePartition(payload)

    // add payload to partition
    try{
      let modifiedPartitionData = this.storage.getItem(currPartition) + payload
      this.storage.setItem(currPartition, modifiedPartitionData);
      console.log(`successfuly saved title: ${title}`)
      return 0
    }
    catch(err){
      if (err.name === 'QuotaExceededError') {
        // partition is full (theoretially should never happen as new partition is made)
        console.error('"FIRST AVAILABLE PARTITION" IS FULL')
      }
      else{
        throw err; // could be something else
      }
      return 1;
    }
  }
}

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
const createNotesMsg = 'Attach NOTES - LeetHub';

// cache the base URL html file used for parsing question details with the new LeetCode UI
let newPageHTML = '';

// problem types
const NORMAL_PROBLEM = 0;
const EXPLORE_SECTION_PROBLEM = 1;

/* Difficulty of most recenty submitted question */
let difficulty = '';

/* state of upload for progress */
let uploadState = { uploading: false };
let uploaded = false;

// leecode quesiton title cache (LHLocalStorage)
// only initialised when either question title is detected or needed.
let LHStorage = null;
let titleCached = false;

// generate HTML file for parsing question details with the new LeetCode UI
async function generateBasePage(questionUrl){
  // get base URL of leetcode problem
  if (questionUrl.includes('/submissions/')) {
    questionUrl = questionUrl.replace(/\/submissions\/.*/, '/description/')
  }
  /* 
    Many of the question details such as question title and difficulty is found in the
    HTML file at the question base URL, under a script with the id "__NEXT_DATA__"
    we can either query the entire html text which includes the script details or make
    a DOM object, select the script, and query from that text.
  */
  // make a http request to the base URL to get html file
  let basePage = await fetch(questionUrl, {method: "GET"})
  let questionData = await basePage.text()

  let script = questionData.match(/<script id="__NEXT_DATA__".*>.*<\/script>/)
  
  return script ? script[0] : null;
}

/* Get file extension for submission */
function findLanguage() {
  var tag = [
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
  else{
    // user may be using new version of LeetCode
    // returns an array of language tags submitted. first and last instance is the most recent submission
    tag = Array.from(document.querySelectorAll('span[class*="leading-"]')).filter(elem => elem.textContent in languages)
    if(!checkElem(tag)){ // something went wrong
      return null
    }
    return languages[tag[0].textContent] // should generate respective file extension
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
  var submissionURL;
  const e = document.getElementsByClassName('status-column__3SUg');
  if (checkElem(e)) {
    // for normal problem submisson
    const submissionRef = e[1].innerHTML.split(' ')[1];
    submissionURL =
      'https://leetcode.com' +
      submissionRef.split('=')[1].slice(1, -1);
  } else {
    // for a submission in explore section
    const submissionRef = document.getElementById('result-state');
    submissionURL = submissionRef?.href;
  }

  console.log(`submission URL: ${submissionURL}`)

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
        }
      }
    };

    xhttp.open('GET', submissionURL, true);
    xhttp.send();
  }
  else{
    // user may be using newer version of Leetcode.
    // when submitted, user is directed to submission page with the code already present
    // therefore we don't need to make a http request.

    // code can be found from the <code> tag
    code = ""
    Array.from(document.querySelectorAll("code")[0]?.children).forEach((line) => {code += `${line.textContent}`})
    
    if(!msg){
      // TODO: get statistics from submission page for new explore section??
      return null;
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
          cb,
        );
      }, 2000);
    }
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
async function getProblemNameSlug() {
  const questionElem = document.getElementsByClassName(
    'content__u3I1 question-content__JfgR',
  );
  const questionDescriptionElem = document.getElementsByClassName(
    'question-description__3U1T',
  );
  let questionTitle = 'unknown-problem';
  if (checkElem(questionElem)) {
    let qtitle = document.getElementsByClassName('css-v3d350');
    if (checkElem(qtitle)) {
      questionTitle = qtitle[0].innerHTML;
    }
  } else if (checkElem(questionDescriptionElem)) {
    let qtitle = document.getElementsByClassName('question-title');
    if (checkElem(qtitle)) {
      questionTitle = qtitle[0].innerText;
    }
  }
  else{
    // user may be using newer version of LeetCode
    // check if problem title is stored in local storage
    const questionName = document.title.split(/(.*) - LeetCode/i)[1]
    LHStorage = LHStorage ? LHStorage : new LHLocalStorage()// initialise if not already initialised
    let qtitle = LHStorage.getQuestionTitle(questionName)
    if(qtitle){
      questionTitle = qtitle[0]
      console.log("got question title from cache!")
    }
    else{ 
      // FALLBACK IF NOT CACHED, make HTTP request to attempt. 
      // This method only works ~40% of the time (for some reason)
      
      // get the script from the html file at the base URL
      if(!newPageHTML){
        newPageHTML = await generateBasePage(window.location.href);
      }
      // if newPageHTML returns null, return an error.
      if(!newPageHTML){
        console.error("Cannot find title of leetcode problem.")
        return;
      }
  
      // from the html text, get title and difficulty of question
      let questionNo = RegExKeyMatch("questionFrontendId", newPageHTML)
      if(!questionNo){ // user may be using explore section or something went wrong
        // TODO: generate question title from 
        return null;
      }
      
      questionTitle = `${questionNo}. ${questionName}`
    }
  }
  return addLeadingZeros(convertToSlug(questionTitle));
}

function addLeadingZeros(title) {
  const maxTitlePrefixLength = 4;
  var len = title.split('-')[0].length;
  if (len < maxTitlePrefixLength) {
    return '0'.repeat(4 - len) + title;
  }
  return title;
}

// returns value from a "key":"value" pair in a given string. if key is not present, returns null
function RegExKeyMatch(key, str){
  const match = str.match(new RegExp(`"${key}":"([^"]+)"`))
  return match ? match[1] : null
}

/* Parser function for the question and tags */
async function parseQuestion() {
  var qtitle;
  var qbody;
  
  // get base URL of leetcode problem
  var questionUrl = window.location.href;
  if (questionUrl.includes('/submissions/')) {
    questionUrl = questionUrl.substring(
      0,
      questionUrl.lastIndexOf('/submissions/') + 1,
    );
  }
  
  var questionElem = document.getElementsByClassName(
    'content__u3I1 question-content__JfgR',
  );

  var questionDescriptionElem = document.getElementsByClassName(
    'question-description__3U1T',
  );

  if (checkElem(questionElem)) {
    qbody = questionElem[0].innerHTML;

    // Problem title.
    qtitle = document.getElementsByClassName('css-v3d350');
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
  else if (checkElem(questionDescriptionElem)) {
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
  else{
    // user is using new version of LeetCode
    const questionName = document.title.split(/(.*) - LeetCode/i)[1]
    LHStorage = LHStorage ? LHStorage : new LHLocalStorage()// initialise if not already initialised
    let questionTitle = LHStorage.getQuestionTitle(questionName)
    if(questionTitle){
      [qtitle, difficulty] = questionTitle
      console.log("got question title and difficulty from cache!")
    }
    else{
      // FALLBACK IF NOT CACHED, make HTTP request to attempt. 
      // This method only works ~40% of the time (for some reason)
      // get the html text from the base URL
      if(!newPageHTML){
        newPageHTML = await generateBasePage(window.location.href);
      }
      // if newPageHTML returns null, return an error.
      if(!newPageHTML){
        console.error("Cannot find description of leetcode problem.")
        return;
      }
      // from the html text, get title and difficulty of question
      let questionNo = RegExKeyMatch("questionFrontendId", newPageHTML)
      difficulty = RegExKeyMatch("difficulty", newPageHTML)
  
      if(!(questionNo || questionName)){ // either using explore section or something went wrong
        // TODO: look for the explore question data 
        return null;
      }
      
      // form title and get question description
      qtitle = `${questionNo}. ${questionName}`
    }
    
    qbody = document.head.querySelector('meta[name="description"]').content
    
    // Final formatting of the contents of the README for each problem
    const markdown = `<h2><a href="${questionUrl}">${qtitle}</a></h2><h3>${difficulty}</h3><hr>${qbody}`;
    return markdown;
  }
}

/* For LeetCode's new UI, percentage int and decimal are seperated, but contained in a single div.
The function brings them together to a single string */
function parsePercentileNew(elem){
  let spans = Array.from(elem.querySelectorAll("span"))
  let percentage = ""
  spans.forEach(elem => {
    percentage += elem.textContent
  })

  return percentage
}

/* Parser function for time/space stats */
function parseStats() {
  let time, timePercentile, space, spacePercentile;
  const probStats = document.getElementsByClassName('data__HC-i');
  
  if (checkElem(probStats)) {
    time = probStats[0].textContent;
    timePercentile = probStats[1].textContent;
    space = probStats[2].textContent;
    spacePercentile = probStats[3].textContent;
  }
  else{
    // user may be using a newer version of LeetCode
    let newProbStats = document.getElementsByClassName("gap-y-2");
    if(!checkElem(newProbStats)){
      return null;
    }

    //for each stat (time, mem), get their values and percentiles
    let stats = []
    Array.from(newProbStats).forEach(stat => {
      let [val, per] = stat.querySelectorAll("div")
    
      stats.push(val.querySelectorAll("*")[1].textContent)
      stats.push(parsePercentileNew(per.querySelectorAll("*")[1]))
    });

    [time, timePercentile, space, spacePercentile] = stats
  }

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

// Leetcode's new UI means that we cannot obtain notes on description page when on submission page
// This generates a submission button to allow users to manually submit notes on the submission page.
function generateNoteSubmissionButton(){
  // find anchor for note submission
  const noteSection = Array.from(document.querySelectorAll("textarea")).filter(
    elem => elem.getAttribute("name") == "notes"
  );
  if(checkElem(noteSection)){
    // get style from submit button
    style = Array.from(document.getElementsByTagName("button")).filter(
      elem => elem.classList.contains("bg-green-s")
    )[0]?.className;
    // place new button with this style under the note section
    submitNotesButton = document.createElement("button");
    submitNotesButton.appendChild(document.createTextNode("Submit Notes - LeetHub")); // adds text to button
    submitNotesButton.className = `${style} leethub-notes-submission`; // add submit button's style as well as an indicator class
    submitNotesButton.style.cssText += "margin: 1em 0;";// add some margin for space
    submitNotesButton.addEventListener("click", onNoteSubmission); // add event listener

    noteSection[0].after(submitNotesButton); // insert button
    return submitNotesButton;
  }

  return null;
}

// Leetcode's new UI means that we cannot obtain notes on description page when on submission page
// This runs once the note submission button is clicked.
async function onNoteSubmission(e){
  const button = e.target;
  if(button.classList.contains("cursor-not-allowed")){
    // button disabled (maybe user already uploaded to GitHub)
    console.log("button is disabled");
    return;
  }
  button.className += ' cursor-not-allowed opacity-50'; // leetcode's classes for disabled buttons
  // get notes from textarea before the button
  const notes = button.previousSibling?.textContent;
  if(!notes){
    console.error("cannot find notes section");
    return;
  }
  // If there's any notes, upload it to git
  if (notes.length > 0) {
    let problemName = await getProblemNameSlug();
    setTimeout(function () {
      if (notes != undefined && notes.length != 0) {
        console.log('Create Notes');
        // means we can upload the notes too
        uploadGit(
          btoa(unescape(encodeURIComponent(notes))),
          problemName,
          'NOTES.md',
          createNotesMsg,
          'upload',
        );
      }
    }, 500);
  }
  else{
    console.log("no notes added")
    button.className = button.className.remove(/ cursor-not-allowed opacity-50/)
  }
}

/* function to get the notes if there is any
 the note should be opened atleast once for this to work
 this is because the dom is populated after data is fetched by opening the note */
// TODO: update function to support both old and new LeetCode UI
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
  else{
    // user may be using new version of LeetCode
    if(!checkElem(
      document.getElementsByClassName("leethub-notes-submission")
    )){
      // generate a button for submitting notes
      let button = setTimeout(generateNoteSubmissionButton(), 500)
      if(!button){
        console.error("could not generate button");
      }
    }
  }
  return notes.trim();
}

// listens for an indicator that we are on the description page of a problem. If so, 
// initialises the LeetHub LocalStorage class to cache the question title and difficulty
function checkForTitle(){
  // check to see if problem title is visible (eg. if user on description page)
  const qNameOld = document.getElementsByClassName('css-v3d350');
  const qNameNew = Array.from(document.querySelectorAll("span.mr-2")).filter(
    elem => elem.textContent.match(/\d+[.][\s]?.*/)
  )
  qName = (
    checkElem(qNameOld) ? qNameOld : null || 
    checkElem(qNameNew) ? qNameNew : null || 
    []
  )
  if(checkElem(qName)){
    // check question difficulty
    const isHard = (
      checkElem(document.getElementsByClassName('css-t42afm')) ||
      checkElem(document.querySelectorAll('div.bg-pink.capitalize'))
    );
    const isMedium = (
      checkElem(document.getElementsByClassName('css-dcmtd5')) ||
      checkElem(document.querySelectorAll('div.bg-yellow.capitalize'))
    )
    const isEasy = (
      checkElem(document.getElementsByClassName('css-14oi08n')) ||
      checkElem(document.querySelectorAll('div.bg-olive.capitalize'))
    )
  
    difficulty = (
      isEasy ? 'Easy' : null ||
      isMedium ? 'Medium': null ||
      isHard ? 'Hard' : null
    )

    LHStorage = new LHLocalStorage() // hover over object methods for descriptions
    LHStorage.setQuestionTitle(`${qName[0].textContent}: ${difficulty}`) // FOLLOW 'X. Problem Name: Difficulty'
    titleCached = true;
  }
}

const loader = setInterval(async () => {
  if(!titleCached){ // check if title is visible to cache
    checkForTitle()
  }
  if(uploaded){ // do not reupload once uploaded
    return;
  }

  let code = null;
  let probStatement = null;
  let probStats = null;
  let probType;

  // query for old "Success" tag
  const successfulOld = () => {
    const successTag = document.getElementsByClassName('success__3Ai7')

    // check if both the success tag exists, its accompanied by the "Success" text and it is not
    // already processed
    return (
    checkElem(successTag) &&
    successTag[0].className === 'success__3Ai7' &&
    successTag[0].innerText.trim() === 'Success'
    ) ?
    successTag : null
  }
  // query for new "Accepted" tag
  const successfulNew = () => {
    const successTag = Array.from(document.getElementsByClassName("text-green-s")).filter(elem => elem.querySelector("svg"))

    // check if both the success icon exists, its accompanied by the "Accepted" text and it is not
    // already processed
    return (
      checkElem(successTag) &&
      !successTag[0].classList.contains("marked_as_success") &&
      successTag[0].querySelector("span")?.textContent == "Accepted"
    ) ?
    successTag : null
  }
  const successTag = successfulOld() || successfulNew() || [];

  // TODO: try get result state for an explore section problem in both old and new versions
  const resultState = document.getElementById('result-state');
  
  
  var success = false;
  // check success tag for a normal problem
  if (
    checkElem(successTag)
  ) {
    //console.log(successTag[0]);
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
    probStatement = await parseQuestion();
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

    const problemName = await getProblemNameSlug();
    const language = findLanguage();
    if (language !== null) {
      // start upload indicator here
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
      /* only upload notes if there is any */
      // NOTE: getNotesIfAny currently supportes only LeetCode's old UI
      notes = getNotesIfAny();
      if (notes.length > 0) {
        setTimeout(function () {
          if (notes != undefined && notes.length != 0) {
            console.log('Create Notes');
            // means we can upload the notes too
            uploadGit(
              btoa(unescape(encodeURIComponent(notes))),
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
            if (uploadState['countdown'])
              clearTimeout(uploadState['countdown']);
            delete uploadState['countdown'];
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
  uploadState['countdown'] = setTimeout(() => {
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
  } else {
    if (checkElem(document.getElementsByClassName('action__38Xc'))) {
      target = document.getElementsByClassName('action__38Xc')[0];
      elem.className = 'runcode-wrapper__8rXm';
      if (target.childNodes.length > 0)
        target.childNodes[0].prepend(elem);
    }
    else{
      // user may be using new version of LeetCode
      let a = document.querySelectorAll("div.mr-2.flex") // look for div near the run button
      if(!checkElem(a)){ return; }
      
      let target = a[a.length - 1] // choose bottom most element if there are multiple matches
      target.appendChild(elem)
    }
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
  uploaded = true;
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
