$("#hook_button").on('click', ()=>{
    /* on click should generate: 1) option 2) repository name */
    if(!option())
    {
        $("#error").text("No option selected - Pick an option from dropdown menu below that best suits you!");
        $("#error").show();
    }
    else if(!repository_name())
    {
        $("#error").text("No repository name added - Enter the name of your repository!");
        $("#error").show();
    }
    else
    {
        $("#error").hide();
        $("#success").text("Attempting to create Hook... Please wait.");
        $("#success").show();

        /* 
            Perform processing
            - step 1: Check if current stage == hook.
            - step 2: store repo name as repo_name in chrome storage.
            - step 3: if (1), POST request to repo_name (iff option = create new repo) ; else display error message.
            - step 4: if proceed from 3, hide hook_mode and display commit_mode (show stats e.g: files pushed/questions-solved/leaderboard)
        */
        chrome.storage.sync.get("leethub_token", (data)=>{
            const token = data.leethub_token;
            if(token == null || token == undefined)
            {
                /* Not authorized yet. */
                $("#error").text("Authorization error - Grant LeetHub access to your GitHub account to continue (launch extension to proceed)");
                $("#error").show();
                $("#success").hide();
            }
            else
            {
                if(option() == "new")
                {
                    create_repo(token, repository_name());
                }
                else
                {
                    link_repo(token);
                }
            }
        });

    }
});

/* Detect mode type */
chrome.storage.sync.get("mode_type", data=>{
    const mode = data.mode_type;
    if(mode && mode == "commit")
    {
        document.getElementById("hook_mode").style.display = "none";
        document.getElementById("commit_mode").style.display = "inherit";
    }
    else
    {
        document.getElementById("hook_mode").style.display = "inherit";
        document.getElementById("commit_mode").style.display = "none";
    }
});

var option = ()=>{
    return $("#type").val();
}

var repository_name = ()=>{
    return $("#name").val().trim();
}


var create_repo = (token, name)=>{
    const AUTHENTICATION_URL = "https://api.github.com/user/repos";
    var data = {
        'name': name,
        'private': true,
        'auto_init': true
    }
    data = JSON.stringify(data);

    var xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function(event) {
        if(xhr.readyState == 4) {
            status_code(JSON.parse(xhr.responseText), xhr.status, name);
        }
    });

    xhr.open('POST', AUTHENTICATION_URL, true);
    xhr.setRequestHeader("Authorization", `token ${token}`);
    xhr.setRequestHeader("Accept", "application/vnd.github.v3+json");
    xhr.send(data);
}

var link_repo = (token)=>{
    console.log("in here");
}

/* REPOSITORY HAS BEEN CREATED */
/* 

let X = JSON.parse(xhr.responseText);
console.log(X.length);

*/
var status_code = (res, status, name)=>{
    switch (status) {
        case 304:
            $("#success").hide();
            $("#error").text(`Error creating ${name} - Unable to modify repository. Try again later!`);
            $("#error").show();
            break;

        case 400:
            $("#success").hide();
            $("#error").text(`Error creating ${name} - Bad POST request, make sure you're not overriding any existing scripts`);
            $("#error").show();
            break;

        case 401:
            $("#success").hide();
            $("#error").text(`Error creating ${name} - Unauthorized access to repo. Try again later!`);
            $("#error").show();
            break;

        case 403:
            $("#success").hide();
            $("#error").text(`Error creating ${name} - Forbidden access to repository. Try again later!`);
            $("#error").show();
            break;

        case 422:
            $("#success").hide();
            $("#error").text(`Error creating ${name} - Unprocessable Entity. Repository may have already been created`);
            $("#error").show();
            break;

        default:
            /* Change mode type to commit */
            chrome.storage.sync.set({"mode_type": "commit"}, data=>{
                $("#error").hide();
                $("#success").html(`Successfully created <a target="blank" href="${res['clone_url']}">${name}</a>. Start <a href="http://leetcode.com">LeetCoding</a>!`);
                $("#success").show();
            });
            /* Get Repo Hook */
            chrome.storage.sync.set({"leethub_hook": res['clone_url']}, data=>{
                console.log("Successfully set new repo hook");
            });

            break;
    }
}