const README_MSG = 'Create README - LeetHub';
const SUBMIT_MSG = 'Added solution - LeetHub';
const UPDATE_MSG = 'Updated solution - LeetHub';
let START_MONITOR = true;
const toKebabCase = (string) => {
  return string
    .replace(/[^a-zA-Z0-9\. ]/g, '') //remove special chars
    .replace(/([a-z])([A-Z])/g, '$1-$2') // get all lowercase letters that are near to uppercase ones
    .replace(/[\s_]+/g, '-') // replace all spaces and low dash
    .toLowerCase(); // convert to lower case
};
function findGfgLanguage() {
  const ele = document.getElementsByClassName('divider text')[0].innerText;
  if (ele.length != null) {
    return ele;
  }
  return '';
}

function findTitle() {
  const ele = document.getElementsByClassName('g-m-0')[0].innerText;
  if (ele != null) {
    return ele;
  }
  return '';
}

function findDifficulty() {
  const ele = document.getElementsByClassName(
    'problems_green__cbqrD',
  )[0].innerText;

  if (ele != null) {
    if (ele.trim() == 'Basic' || ele.trim() === 'School') {
      return 'Easy';
    }
    return ele;
  }
  return '';
}

function getProblemStatement() {
  const ele = document.getElementsByClassName('problems_problem_content__Xm_eO')[0].innerText;
  return ele;
}

function getCode() {
  const ele = document.getElementsByClassName(
    'ace_layer ace_text-layer',
  )[0].innerText;
    return ele;
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
  try{

    const ele1 = document.getElementsByClassName('problems_content_pane__nexJa')[0].innerText;
    if(ele1.includes("Problem Solved Successfully")&&START_MONITOR){
    let code = null;
    let problemStatement = null;
    let title = null;
    let language = null;
    let difficulty = null;
      START_MONITOR = false;
      title = findTitle().trim();
      difficulty = findDifficulty();
      problemStatement = getProblemStatement();
      code = getCode();
      language = findGfgLanguage();
      let probName = title + ` - GFG`;
      problemStatement = `# ${title}\n ${difficulty}\n\n` + problemStatement;
      const filePath = probName;
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
      setTimeout(function(){
      uploadGit(
         btoa(unescape(encodeURIComponent(code))),
                probName,
                toKebabCase(title),
                SUBMIT_MSG,
                'upload',
                undefined,
                undefined,
                difficulty,
                );},2000);
  }
}
    catch(e){}
  }
}, 1000);
