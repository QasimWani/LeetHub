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
    }
    if(code != null)
    {
        clearTimeout(loader);
        const problem_name = window.location.pathname.split("/")[2]; //must be true.
        let language = find_language();
        if(language != null)
        {
            upload_git(btoa(unescape(encodeURIComponent(code))), problem_name + language); //Encode `code` to base64
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

function upload_git(code, filename) {
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
                            chrome.storage.sync.get("stats", stats=>{
                                stats = stats.stats;
                                let sha = null;

                                if(stats != undefined && stats["sha"] != undefined && stats["sha"][filename] != undefined)
                                {
                                    sha = stats["sha"][filename];
                                }
                                /* Upload to git. */
                                upload(token, hook, code, filename, sha);
                            });
                        }
                    });
                }
            });
        }
    });
}


/* Main function for uploading code to GitHub repo */
var upload = (token, hook, code, filename, sha)=>{

    // To validate user, load user object from GitHub.
    const URL = "https://api.github.com/repos/" + hook + "/contents/" + filename;

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
                sha = JSON.parse(xhr.responseText)["commit"]["sha"]; //get updated SHA.

                chrome.storage.sync.get("stats", data=>{
                    let stats = data.stats;
                    if(stats == null || stats == {} || stats == undefined) //create stats object
                    {
                        stats = {};
                        stats["solved"] = 0;
                        stats["sha"] = {};
                    }
                    stats["solved"] += 1;
                    stats["sha"][filename] = sha; //update sha key.
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

/* Main parser function */
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