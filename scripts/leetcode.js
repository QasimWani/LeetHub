var code = null;

/* Enum for languages supported by LeetCode. */
const languages =
{
    "Python"    : ".py",
    "Python3"   : ".py",
    "C++"       : ".cpp",
    "C"         : ".c",
    "Java"      : ".java",
    "C#"        : ".cs",
    "JavaScript" : ".js",
    "Ruby"      : ".rb",
    "Swift"     : ".swift",
    "Go"        : ".go",
    "Kotlin"    : ".kt",
    "Scala"     : ".scala",
    "Rust"      : ".rs",
    "PHP"       : ".php",
    "TypeScript" : ".ts",
    "MySQL"     : ".sql",
    "MS SQL Server" : ".sql",
    "Oracle"    : ".sql"
};

var TimeoutHandle = null;

const loader = setInterval(() => {
    success_tag = document.getElementsByClassName("success__3Ai7");
    if(success_tag != undefined && success_tag.length > 0 && success_tag[0].innerText.trim() == "Success")
    {
        code = parse_code();
        probStatement = parse_question();
    }
    if(code != null && probStatement != null)
    {
        clearTimeout(loader);
        const problem_name = window.location.pathname.split("/")[2]; //must be true.
        let language = find_language();
        if(language != null)
        {
            upload_git(btoa(unescape(encodeURIComponent(code))), problem_name, problem_name+language); //Encode `code` to base64

            /* @TODO: Change this setTimeout to Promise */
            setTimeout(function(){upload_git(btoa(unescape(encodeURIComponent(probStatement))), problem_name, 'README.md')}, 2000);
        }
    }
}, 1000);

/* Get file extension for submission */
function find_language() {
    let tag = [... document.getElementsByClassName("ant-select-selection-selected-value")];
    if(tag && tag.length > 0)
    {
        for (let i = 0; i < tag.length; i++) {
            const elem = tag[i].textContent;
            if(elem != undefined && languages[elem] != undefined)
            {
                return languages[elem]; //should generate respective file extension
            }
        }
        return null;
    }
}

function upload_git(code, problem_name, filename) {

    /* Get necessary payload data */
    chrome.storage.sync.get("leethub_token", token=>{
        token = token.leethub_token;
        if(token)
        {
            chrome.storage.sync.get("mode_type", mode=>{
                mode = mode.mode_type;
                if(mode == "commit")
                {
                    /* Get hook */
                    chrome.storage.sync.get("leethub_hook", hook=>{
                        hook = hook.leethub_hook;
                        if(hook)
                        {
                            /* Get SHA, if it exists */

                            /* to get unique key */
                            const filePath = problem_name+filename
                            chrome.storage.sync.get("stats", stats=>{
                                stats = stats.stats;
                                let sha = null;

                                if(stats != undefined && stats["sha"] != undefined && stats["sha"][filePath] != undefined)
                                {
                                    sha = stats["sha"][filePath];
                                }
                                /* Upload to git. */
                                upload(token, hook, code, problem_name, filename, sha);
                            });
                        }
                    });
                }
            });
        }
    });
}


/* Main function for uploading code to GitHub repo */
var upload = (token, hook, code, directory, filename, sha)=>{

    // To validate user, load user object from GitHub.
    const URL = "https://api.github.com/repos/" + hook + "/contents/" +directory+'/'+ filename;

    /* Define Payload */
    var data = {
        'message': `working commit - Created using LeetHub`,
        'content': code
    }
    if(sha != null)
    {
        data["sha"] = sha; //get sha for files that already exist in the gh file system.
    }

    data = JSON.stringify(data);
    
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function(event) {
        if(xhr.readyState == 4) {

            if(xhr.status == 200 || xhr.status == 201) {
                sha = JSON.parse(xhr.responseText)["content"]["sha"]; //get updated SHA.

                chrome.storage.sync.get("stats", data=>{
                    let stats = data.stats;
                    if(stats == null || stats == {} || stats == undefined) //create stats object
                    {
                        stats = {};
                        stats["solved"] = 0;
                        stats["sha"] = {};
                    }
                    const filePath = directory+filename;
                    // Only increment solved problems statistics once
                    // New submission commits twice (README and problem)
                    if (filename !== "README.md") {
                        stats["solved"] += 1;
                    }
                    stats["sha"][filePath] = sha; //update sha key.
                    chrome.storage.sync.set({"stats" : stats}, m_data=>{
                        console.log(`Successfully committed ${filename} to github`);
                    });
                });
            }
        }
    });
    xhr.open('PUT', URL, true);
    xhr.setRequestHeader("Authorization", `token ${token}`);
    xhr.setRequestHeader("Accept", "application/vnd.github.v3+json");
    xhr.send(data);
}

/* Main parser function for the code */
function parse_code()
{
    elem = document.getElementsByClassName("CodeMirror-code");
    if(elem != undefined && elem.length > 0)
    {
        elem = elem[0];
        parsed_code = "";
        text_arr = elem.innerText.split("\n");
        for(let i = 1; i < text_arr.length; i+=2)
        {
           parsed_code += text_arr[i] + "\n";
        }
        return parsed_code;
    }
    return null;
}

/* Util function to check if an element exists */
function checkElem(elem){
    return (elem && elem.length>0);
}

/* Parser function for the question and tags */
function parse_question(){
    const questionElem = document.getElementsByClassName("content__u3I1 question-content__JfgR");
    if(!checkElem(questionElem)){
        return null;
    }
    const qbody = questionElem[0].innerHTML;

    // Problem title.
    const qtitlte = document.getElementsByClassName('css-v3d350')[0].innerHTML;

    var difficulty = '';

    // Problem difficulty, each problem difficulty has its own class.
    const isHard = document.getElementsByClassName('css-t42afm');
    const isMedium = document.getElementsByClassName('css-dcmtd5');
    const isEasy = document.getElementsByClassName('css-14oi08n');

    if(checkElem(isEasy)){
        difficulty='Easy';
    }else if(checkElem(isMedium)){
        difficulty='Medium';
    }else if(checkElem(isHard)){
        difficulty='Hard'
    }
    // Final formatting of the contents of the README for each problem
    const markdown = '<h2>' + qtitlte + '</h2><h3>' + difficulty + '</h3><hr>' + qbody;
    return markdown;
}
