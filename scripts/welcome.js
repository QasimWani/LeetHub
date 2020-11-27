/* Check for value of select tag, Get Started disabled by default */

$('#type').on('change', function (e) {
    let valueSelected = this.value;
    if(valueSelected)
    {
        $("#hook_button").attr("disabled", false);
    }
    else
    {
        $("#hook_button").attr("disabled", true);
    }
});



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
        $("#name").focus();
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
                    chrome.storage.sync.get("leethub_username", (data)=>{
                        let username = data.leethub_username;
                        if(!username)
                        {
                            /* Improper authorization. */
                            $("#error").text("Improper Authorization error - Grant LeetHub access to your GitHub account to continue (launch extension to proceed)");
                            $("#error").show();
                            $("#success").hide();
                        }
                        else
                        {
                            link_repo(token, username + "/" + repository_name(), false);
                        }
                    });

                }
            }
        });

    }
});

$("#unlink a").on('click', () => {
    unlink_repo();
    $("#unlink").hide();
    $("#success").text("Successfully unlinked your current git repo. Please create/link a new hook.");
});

/* Detect mode type */
chrome.storage.sync.get("mode_type", data=>{
    const mode = data.mode_type;

    if(mode && mode == "commit")
    {
        /* Check if still access to repo */
        chrome.storage.sync.get("leethub_token", data=>{
            const token = data.leethub_token;
            if(token == null || token == undefined)
            {
                /* Not authorized yet. */
                $("#error").text("Authorization error - Grant LeetHub access to your GitHub account to continue (click LeetHub extension on the top right to proceed)");
                $("#error").show();
                $("#success").hide();
                /* Hide accordingly */
                document.getElementById("hook_mode").style.display = "inherit";
                document.getElementById("commit_mode").style.display = "none";
            }
            else
            {
                /* Get access to repo */
                chrome.storage.sync.get("leethub_hook", repo_name=>{
                    repo_name = repo_name.leethub_hook;
                    if(!repo_name)
                    {
                        /* Not authorized yet. */
                        $("#error").text("Improper Authorization error - Grant LeetHub access to your GitHub account to continue (click LeetHub extension on the top right to proceed)");
                        $("#error").show();
                        $("#success").hide();
                        /* Hide accordingly */
                        document.getElementById("hook_mode").style.display = "inherit";
                        document.getElementById("commit_mode").style.display = "none";
                    }
                    else
                    {
                        /* Username exists, at least in storage. Confirm this */
                        link_repo(token, repo_name);
                    }
                });
            }
        });

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
        'auto_init': true,
        'description': "Collection of LeetCode questions to ace the coding interview! - Created using [LeetHub](https://github.com/QasimWani/LeetHub)."
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

/* 
    Method for linking hook with an existing repository 
    Steps:
    1. Check if existing repository exists and the user has write access to it.
    2. Link Hook to it (chrome Storage).
*/
var link_repo = (token, name)=>{
    const AUTHENTICATION_URL = "https://api.github.com/repos/" + name;

    var xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function(event) {
        if(xhr.readyState == 4) {
            const res = JSON.parse(xhr.responseText);
            var bool = link_status_code(xhr.status, name);
            if(xhr.status == 200) //BUG FIX
            {
                if(!bool) //unable to gain access to repo in commit mode. Must switch to hook mode.
                {
                    /* Set mode type to hook */
                    chrome.storage.sync.set({"mode_type": "hook"}, data=>{
                        console.log(`Error linking ${name} to LeetHub`);
                    });
                    /* Set Repo Hook to NONE */
                    chrome.storage.sync.set({"leethub_hook": null}, data=>{
                        console.log("Defaulted repo hook to NONE");
                    });

                    /* Hide accordingly */
                    document.getElementById("hook_mode").style.display = "inherit";
                    document.getElementById("commit_mode").style.display = "none";
                }
                else
                {
                    /* Change mode type to commit */
                    chrome.storage.sync.set({"mode_type": "commit"}, data=>{
                        $("#error").hide();
                        $("#success").html(`Successfully linked <a target="blank" href="${res['html_url']}">${name}</a> to LeetHub. Start <a href="http://leetcode.com">LeetCoding</a> now!`);
                        $("#success").show();
                        $("#unlink").show();
                    });
                    /* Set Repo Hook */
                    chrome.storage.sync.set({"leethub_hook": res['full_name']}, data=>{
                        console.log("Successfully set new repo hook");
                        /* Get problems solved count */
                        chrome.storage.sync.get("stats", psolved=>{
                            psolved = psolved.stats;
                            if(psolved && psolved["solved"])
                            {
                                $("#p_solved").text(psolved["solved"]); 
                            }
                        });
                    });
                    /* Hide accordingly */
                    document.getElementById("hook_mode").style.display = "none";
                    document.getElementById("commit_mode").style.display = "inherit";
                }
            }
        }
    });

    xhr.open('GET', AUTHENTICATION_URL, true);
    xhr.setRequestHeader("Authorization", `token ${token}`);
    xhr.setRequestHeader("Accept", "application/vnd.github.v3+json");
    xhr.send();
}

var unlink_repo = () => {
    /* Set mode type to hook */
    chrome.storage.sync.set({ "mode_type": "hook" }, data => {
        console.log(`Unlinking repo`);
    });
    /* Set Repo Hook to NONE */
    chrome.storage.sync.set({ "leethub_hook": null }, data => {
        console.log("Defaulted repo hook to NONE");
    });

    /* Hide accordingly */
    document.getElementById("hook_mode").style.display = "inherit";
    document.getElementById("commit_mode").style.display = "none";
}

/* Status codes for linking of repo */
var link_status_code = (status, name)=>{
    let bool = false;
    switch (status)
    {
        case 301:
            $("#success").hide();
            $("#error").html(`Error linking <a target="blank" href="${'https://github.com/' + name}">${name}</a> to LeetHub. <br> This repository has been moved permenantly. Try creating a new one.`);
            $("#error").show();
            break;
            
        case 403:
            $("#success").hide();
            $("#error").html(`Error linking <a target="blank" href="${'https://github.com/' + name}">${name}</a> to LeetHub. <br> Forbidden action. Please make sure you have the right access to this repository.`);
            $("#error").show();
            break;
        
        case 404:
            $("#success").hide();
            $("#error").html(`Error linking <a target="blank" href="${'https://github.com/' + name}">${name}</a> to LeetHub. <br> Resource not found. Make sure you enter the right repository name.`);
            $("#error").show();
            break;
        
        default:
            bool = true;
            break;
    }
    return bool;
}
/* Status codes for creating of repo */

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
            $("#error").text(`Error creating ${name} - Unprocessable Entity. Repository may have already been created. Try Linking instead (select 2nd option).`);
            $("#error").show();
            break;

        default:
            /* Change mode type to commit */
            chrome.storage.sync.set({"mode_type": "commit"}, data=>{
                $("#error").hide();
                $("#success").html(`Successfully created <a target="blank" href="${res['html_url']}">${name}</a>. Start <a href="http://leetcode.com">LeetCoding</a>!`);
                $("#success").show();
                $("#unlink").show();
                /* Show new layout */
                document.getElementById("hook_mode").style.display = "none";
                document.getElementById("commit_mode").style.display = "inherit";
            });
            /* Set Repo Hook */
            chrome.storage.sync.set({"leethub_hook": res['full_name']}, data=>{
                console.log("Successfully set new repo hook");
            });

            break;
    }
}