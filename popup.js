/* global oAuth2 */
/* eslint no-undef: "error" */

let action = false;

$('#authenticate').on('click', () => {
  if (action) {
    oAuth2.begin();
  }
});

/* Get URL for welcome page */
$('#welcome_URL').attr('href', chrome.runtime.getURL('welcome.html'));
$('#hook_URL').attr('href', chrome.runtime.getURL('welcome.html'));

chrome.storage.local.get('leethub_token', (data) => {
  const token = data.leethub_token;
  if (token === null || token === undefined) {
    action = true;
    $('#auth_mode').show();
  } else {
    // To validate user, load user object from GitHub.
    const AUTHENTICATION_URL = 'https://api.github.com/user';

    const xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          /* Show MAIN FEATURES */
          chrome.storage.local.get('mode_type', (data2) => {
            if (data2 && data2.mode_type === 'commit') {
              $('#commit_mode').show();
              /* Get problem stats and repo link */
              chrome.storage.local.get(
                ['stats', 'leethub_hook'],
                (data3) => {
                  const { stats } = data3;
                  if (stats && stats.solved) {
                    $('#p_solved').text(stats.solved);
                    $('#p_solved_easy').text(stats.easy);
                    $('#p_solved_medium').text(stats.medium);
                    $('#p_solved_hard').text(stats.hard);
                  }
                  const leethubHook = data3.leethub_hook;
                  if (leethubHook) {
                    const safeHook = leethubHook.replace(
                      /[^a-zA-Z0-9./_-]/g,
                      '',
                    );
                    const anchor = document.createElement('a');
                    anchor.target = 'blank';
                    anchor.style =
                      'color: cadetblue !important; font-size:0.8em;';
                    anchor.href = `https://github.com/${safeHook}`;
                    anchor.textContent = safeHook;
                    $('#repo_url').empty().append(anchor);
                  }
                },
              );
            } else {
              $('#hook_mode').show();
            }
          });
        } else if (xhr.status === 401) {
          // bad oAuth
          // reset token and redirect to authorization process again!
          chrome.storage.local.set({ leethub_token: null }, () => {
            console.log(
              'BAD oAuth!!! Redirecting back to oAuth process',
            );
            action = true;
            $('#auth_mode').show();
          });
        }
      }
    });
    xhr.open('GET', AUTHENTICATION_URL, true);
    xhr.setRequestHeader('Authorization', `token ${token}`);
    xhr.send();
  }
});
