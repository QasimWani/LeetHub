const option = () => {
  return $('#type').val();
};

const repositoryName = () => {
  return $('#name').val().trim();
};

/* Status codes for creating of repo */

const statusCode = (res, status, name) => {
  switch (status) {
    case 304:
      $('#success').hide();
      $('#error').text(
        `Error creating ${name} - Unable to modify repository. Try again later!`,
      );
      $('#error').show();
      break;

    case 400:
      $('#success').hide();
      $('#error').text(
        `Error creating ${name} - Bad POST request, make sure you're not overriding any existing scripts`,
      );
      $('#error').show();
      break;

    case 401:
      $('#success').hide();
      $('#error').text(
        `Error creating ${name} - Unauthorized access to repo. Try again later!`,
      );
      $('#error').show();
      break;

    case 403:
      $('#success').hide();
      $('#error').text(
        `Error creating ${name} - Forbidden access to repository. Try again later!`,
      );
      $('#error').show();
      break;

    case 422:
      $('#success').hide();
      $('#error').text(
        `Error creating ${name} - Unprocessable Entity. Repository may have already been created. Try Linking instead (select 2nd option).`,
      );
      $('#error').show();
      break;

    default:
      /* Change mode type to commit */
      chrome.storage.local.set({ mode_type: 'commit' }, () => {
        $('#error').hide();
        $('#success').html(
          `Successfully created <a target="blank" href="${res.html_url}">${name}</a>. Start <a href="http://leetcode.com">LeetCoding</a>!`,
        );
        $('#success').show();
        $('#unlink').show();
        /* Show new layout */
        document.getElementById('hook_mode').style.display = 'none';
        document.getElementById('commit_mode').style.display =
          'inherit';
      });
      /* Set Repo Hook */
      chrome.storage.local.set(
        { leethub_hook: res.full_name },
        () => {
          console.log('Successfully set new repo hook');
        },
      );

      break;
  }
};

const createRepo = (token, name) => {
  const AUTHENTICATION_URL = 'https://api.github.com/user/repos';
  let data = {
    name,
    private: true,
    auto_init: true,
    description:
      'Collection of LeetCode questions to ace the coding interview! - Created using [LeetHub](https://github.com/QasimWani/LeetHub)',
  };
  data = JSON.stringify(data);

  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (xhr.readyState === 4) {
      statusCode(JSON.parse(xhr.responseText), xhr.status, name);
    }
  });

  xhr.open('POST', AUTHENTICATION_URL, true);
  xhr.setRequestHeader('Authorization', `token ${token}`);
  xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
  xhr.send(data);
};

/* Status codes for linking of repo */
const linkStatusCode = (status, name) => {
  let bool = false;
  switch (status) {
    case 301:
      $('#success').hide();
      $('#error').html(
        `Error linking <a target="blank" href="${`https://github.com/${name}`}">${name}</a> to LeetHub. <br> This repository has been moved permenantly. Try creating a new one.`,
      );
      $('#error').show();
      break;

    case 403:
      $('#success').hide();
      $('#error').html(
        `Error linking <a target="blank" href="${`https://github.com/${name}`}">${name}</a> to LeetHub. <br> Forbidden action. Please make sure you have the right access to this repository.`,
      );
      $('#error').show();
      break;

    case 404:
      $('#success').hide();
      $('#error').html(
        `Error linking <a target="blank" href="${`https://github.com/${name}`}">${name}</a> to LeetHub. <br> Resource not found. Make sure you enter the right repository name.`,
      );
      $('#error').show();
      break;

    default:
      bool = true;
      break;
  }
  $('#unlink').show();
  return bool;
};

/* 
    Method for linking hook with an existing repository 
    Steps:
    1. Check if existing repository exists and the user has write access to it.
    2. Link Hook to it (chrome Storage).
*/
const linkRepo = (token, name) => {
  const AUTHENTICATION_URL = `https://api.github.com/repos/${name}`;

  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (xhr.readyState === 4) {
      const res = JSON.parse(xhr.responseText);
      const bool = linkStatusCode(xhr.status, name);
      if (xhr.status === 200) {
        // BUG FIX
        if (!bool) {
          // unable to gain access to repo in commit mode. Must switch to hook mode.
          /* Set mode type to hook */
          chrome.storage.local.set({ mode_type: 'hook' }, () => {
            console.log(`Error linking ${name} to LeetHub`);
          });
          /* Set Repo Hook to NONE */
          chrome.storage.local.set({ leethub_hook: null }, () => {
            console.log('Defaulted repo hook to NONE');
          });

          /* Hide accordingly */
          document.getElementById('hook_mode').style.display =
            'inherit';
          document.getElementById('commit_mode').style.display =
            'none';
        } else {
          /* Change mode type to commit */
          /* Save repo url to chrome storage */
          chrome.storage.local.set(
            { mode_type: 'commit', repo: res.html_url },
            () => {
              $('#error').hide();
              $('#success').html(
                `Successfully linked <a target="blank" href="${res.html_url}">${name}</a> to LeetHub. Start <a href="http://leetcode.com">LeetCoding</a> now!`,
              );
              $('#success').show();
              $('#unlink').show();
            },
          );
          /* Set Repo Hook */
          chrome.storage.local.set(
            { leethub_hook: res.full_name },
            () => {
              console.log('Successfully set new repo hook');
              /* Get problems solved count */
              chrome.storage.local.get('stats', (psolved) => {
                const { stats } = psolved;
                if (stats && stats.solved) {
                  $('#p_solved').text(stats.solved);
                  $('#p_solved_easy').text(stats.easy);
                  $('#p_solved_medium').text(stats.medium);
                  $('#p_solved_hard').text(stats.hard);
                }
              });
            },
          );
          /* Hide accordingly */
          document.getElementById('hook_mode').style.display = 'none';
          document.getElementById('commit_mode').style.display =
            'inherit';
        }
      }
    }
  });

  xhr.open('GET', AUTHENTICATION_URL, true);
  xhr.setRequestHeader('Authorization', `token ${token}`);
  xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
  xhr.send();
};

const unlinkRepo = () => {
  /* Set mode type to hook */
  chrome.storage.local.set({ mode_type: 'hook' }, () => {
    console.log(`Unlinking repo`);
  });
  /* Set Repo Hook to NONE */
  chrome.storage.local.set({ leethub_hook: null }, () => {
    console.log('Defaulted repo hook to NONE');
  });

  /* Hide accordingly */
  document.getElementById('hook_mode').style.display = 'inherit';
  document.getElementById('commit_mode').style.display = 'none';
};

/* Check for value of select tag, Get Started disabled by default */

$('#type').on('change', function () {
  const valueSelected = this.value;
  if (valueSelected) {
    $('#hook_button').attr('disabled', false);
  } else {
    $('#hook_button').attr('disabled', true);
  }
});

$('#hook_button').on('click', () => {
  /* on click should generate: 1) option 2) repository name */
  if (!option()) {
    $('#error').text(
      'No option selected - Pick an option from dropdown menu below that best suits you!',
    );
    $('#error').show();
  } else if (!repositoryName()) {
    $('#error').text(
      'No repository name added - Enter the name of your repository!',
    );
    $('#name').focus();
    $('#error').show();
  } else {
    $('#error').hide();
    $('#success').text('Attempting to create Hook... Please wait.');
    $('#success').show();

    /* 
      Perform processing
      - step 1: Check if current stage === hook.
      - step 2: store repo name as repoName in chrome storage.
      - step 3: if (1), POST request to repoName (iff option = create new repo) ; else display error message.
      - step 4: if proceed from 3, hide hook_mode and display commit_mode (show stats e.g: files pushed/questions-solved/leaderboard)
    */
    chrome.storage.local.get('leethub_token', (data) => {
      const token = data.leethub_token;
      if (token === null || token === undefined) {
        /* Not authorized yet. */
        $('#error').text(
          'Authorization error - Grant LeetHub access to your GitHub account to continue (launch extension to proceed)',
        );
        $('#error').show();
        $('#success').hide();
      } else if (option() === 'new') {
        createRepo(token, repositoryName());
      } else {
        chrome.storage.local.get('leethub_username', (data2) => {
          const username = data2.leethub_username;
          if (!username) {
            /* Improper authorization. */
            $('#error').text(
              'Improper Authorization error - Grant LeetHub access to your GitHub account to continue (launch extension to proceed)',
            );
            $('#error').show();
            $('#success').hide();
          } else {
            linkRepo(token, `${username}/${repositoryName()}`, false);
          }
        });
      }
    });
  }
});

$('#unlink a').on('click', () => {
  unlinkRepo();
  $('#unlink').hide();
  $('#success').text(
    'Successfully unlinked your current git repo. Please create/link a new hook.',
  );
});

/* Detect mode type */
chrome.storage.local.get('mode_type', (data) => {
  const mode = data.mode_type;

  if (mode && mode === 'commit') {
    /* Check if still access to repo */
    chrome.storage.local.get('leethub_token', (data2) => {
      const token = data2.leethub_token;
      if (token === null || token === undefined) {
        /* Not authorized yet. */
        $('#error').text(
          'Authorization error - Grant LeetHub access to your GitHub account to continue (click LeetHub extension on the top right to proceed)',
        );
        $('#error').show();
        $('#success').hide();
        /* Hide accordingly */
        document.getElementById('hook_mode').style.display =
          'inherit';
        document.getElementById('commit_mode').style.display = 'none';
      } else {
        /* Get access to repo */
        chrome.storage.local.get('leethub_hook', (repoName) => {
          const hook = repoName.leethub_hook;
          if (!hook) {
            /* Not authorized yet. */
            $('#error').text(
              'Improper Authorization error - Grant LeetHub access to your GitHub account to continue (click LeetHub extension on the top right to proceed)',
            );
            $('#error').show();
            $('#success').hide();
            /* Hide accordingly */
            document.getElementById('hook_mode').style.display =
              'inherit';
            document.getElementById('commit_mode').style.display =
              'none';
          } else {
            /* Username exists, at least in storage. Confirm this */
            linkRepo(token, hook);
          }
        });
      }
    });

    document.getElementById('hook_mode').style.display = 'none';
    document.getElementById('commit_mode').style.display = 'inherit';
  } else {
    document.getElementById('hook_mode').style.display = 'inherit';
    document.getElementById('commit_mode').style.display = 'none';
  }
});
