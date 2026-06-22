/* global oAuth2, githubRequest, displayStats */
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
    const AUTHENTICATION_URL = 'https://api.github.com/user';

    githubRequest(
      'GET',
      AUTHENTICATION_URL,
      token,
      null,
      (status) => {
        if (status === 200) {
          /* Show MAIN FEATURES */
          chrome.storage.local.get('mode_type', (data2) => {
            if (data2 && data2.mode_type === 'commit') {
              $('#commit_mode').show();
              /* Get problem stats and repo link */
              chrome.storage.local.get(
                ['stats', 'leethub_hook'],
                (data3) => {
                  displayStats(data3.stats);
                  const leethubHook = data3.leethub_hook;
                  if (leethubHook) {
                    $('#repo_url').html(
                      `<a target="blank" style="color: cadetblue !important; font-size:0.8em;" href="https://github.com/${leethubHook}">${leethubHook}</a>`,
                    );
                  }
                },
              );
            } else {
              $('#hook_mode').show();
            }
          });
        } else if (status === 401) {
          chrome.storage.local.set({ leethub_token: null }, () => {
            console.log(
              'BAD oAuth!!! Redirecting back to oAuth process',
            );
            action = true;
            $('#auth_mode').show();
          });
        }
      },
    );
  }
});
