/* Enum for languages supported by LeetCode. */

// Set to true to enable console log
const debug = true;

// Languages supported by BOJ
const languages = {
  'Python 3': '.py',
  'PyPy3': '.py',
  'C++': '.cpp',
  'C++17': '.cpp',
  'C++17 (Clang)': '.cpp',
  'C99': '.c',
  'D': '.d',
  'Java 11': '.java',
  'C# 9.0 (.NET)': '.cs',
  'node.js': '.js',
  'Ruby': '.rb',
  'Swift': '.swift',
  'Go': '.go',
  'Kotlin (JVM)': '.kt',
  'Rust 2018': '.rs',
  'MS SQL Server': '.sql'
};

// BOJ Levels
const bj_level = {
  0:	"Unrated",
  1:	"Bronze V",
  2:	"Bronze IV",
  3:	"Bronze III",
  4:	"Bronze II",
  5:	"Bronze I",
  6:	"Silver V",
  7:	"Silver IV",
  8:	"Silver III",
  9:	"Silver II",
  10:	"Silver I",
  11:	"Gold V",
  12:	"Gold IV",
  13:	"Gold III",
  14:	"Gold II",
  15:	"Gold I",
  16:	"Platinum V",
  17:	"Platinum IV",
  18:	"Platinum III",
  19:	"Platinum II",
  20:	"Platinum I",
  21:	"Diamond V",
  22:	"Diamond IV",
  23:	"Diamond III",
  24:	"Diamond II",
  25:	"Diamond I",
  26:	"Ruby V",
  27:	"Ruby IV",
  28:	"Ruby III",
  29:	"Ruby II",
  30:	"Ruby I",
}

const categories = {
  'math':'수학',
  'implementation':'구현',
  'dp':'다이나믹 프로그래밍',
  'graphs':'그래프 이론',
  'data_structures':'자료 구조',
  'string':'문자열',
  'greedy':'그리디 알고리즘',
  'bruteforcing':'브루트포스 알고리즘',
  'graph_traversal':'그래프 탐색',
  'sorting':'정렬',
  'geometry':'기하학',
  'number_theory':'정수론',
  'trees':'트리',
  'segtree':'세그먼트 트리',
  'binary_search':'이분 탐색',
  'bfs':'너비 우선 탐색',
  'arithmetic':'사칙연산',
  'simulation':'시뮬레이션',
  'dfs':'깊이 우선 탐색',
  'combinatorics':'조합론',
  'prefix_sum':'누적 합',
  'ad_hoc':'애드 혹',
  'constructive':'구성적',
  'bitmask':'비트마스킹',
  'dijkstra':'다익스트라',
  'case_work':'많은 조건 분기',
  'backtracking':'백트래킹',
  'disjoint_set':'분리 집합',
  'parsing':'파싱',
  'divide_and_conquer':'분할 정복',
  'sweeping':'스위핑',
  'tree_set':'트리를 사용한 집합과 맵',
  'priority_queue':'우선순위 큐',
  'hash_set':'해시를 사용한 집합과 맵',
  'dp_tree':'트리에서의 다이나믹 프로그래밍',
  'two_pointer':'두 포인터',
  'stack':'스택',
  'flow':'최대 유량',
  'primality_test':'소수 판정',
  'lazyprop':'느리게 갱신되는 세그먼트 트리',
  'game_theory':'게임 이론',
  'dp_bitfield':'비트필드를 이용한 다이나믹 프로그래밍',
  'exponentiation_by_squaring':'분할 정복을 이용한 거듭제곱',
  'arbitrary_precision':'임의 정밀도 / 큰 수 연산',
  'offline_queries':'오프라인 쿼리',
  'recursion':'재귀',
  'sieve':'에라토스테네스의 체',
  'mst':'최소 스패닝 트리',
  'probability':'확률론',
  'bipartite_matching':'이분 매칭',
  'lca':'최소 공통 조상',
  'hashing':'해싱',
  'knapsack':'배낭 문제',
  'floyd_warshall':'플로이드–와샬',
  'scc':'강한 연결 요소',
  'parametric_search':'매개 변수 탐색',
  'topological_sorting':'위상 정렬',
  'precomputation':'런타임 전의 전처리',
  'coordinate_compression':'값 / 좌표 압축',
  'linear_algebra':'선형대수학',
  'inclusion_and_exclusion':'포함 배제의 원리',
  'euclidean':'유클리드 호제법',
  'convex_hull':'볼록 껍질',
  'fft':'고속 푸리에 변환',
  'trie':'트라이',
  'sparse_table':'희소 배열',
  'suffix_array':'접미사 배열과 LCP 배열',
  'mcmf':'최소 비용 최대 유량',
  'smaller_to_larger':'작은 집합에서 큰 집합으로 합치는 테크닉',
  'calculus':'미적분학',
  'cht':'볼록 껍질을 이용한 최적화',
  'kmp':'KMP',
  'deque':'덱',
  'randomization':'무작위화',
  'sqrt_decomposition':'제곱근 분할법',
  'sliding_window':'슬라이딩 윈도우',
  'euler_tour_technique':'오일러 경로 테크닉',
  'mitm':'중간에서 만나기',
  'hld':'Heavy-light 분할',
  'geometry_3d':'3차원 기하학',
  'sprague_grundy':'스프라그–그런디 정리',
  'lis':'가장 긴 증가하는 부분 수열: O(n log n)',
  'line_intersection':'선분 교차 판정',
  'centroid':'센트로이드',
  'articulation':'단절점과 단절선',
  'centroid_decomposition':'센트로이드 분할',
  'ternary_search':'삼분 탐색',
  'gaussian_elimination':'가우스 소거법',
  'permutation_cycle_decomposition':'순열 사이클 분할',
  'mfmc':'최대 유량 최소 컷 정리',
  '2_sat':'2-sat',
  'queue':'큐',
  'bitset':'비트 집합',
  'eulerian_path':'오일러 경로',
  'pst':'퍼시스턴트 세그먼트 트리',
  'physics':'물리학',
  'heuristics':'휴리스틱',
  'cactus':'선인장',
  'pythagoras':'피타고라스 정리',
  'mo':'mo\'s',
  'crt':'중국인의 나머지 정리',
  'biconnected_component':'이중 연결 요소',
  '0_1_bfs':'0-1 너비 우선 탐색',
  'splay_tree':'스플레이 트리',
  'divide_and_conquer_optimization':'분할 정복을 사용한 최적화',
  'planar_graph':'평면 그래프',
  'extended_euclidean':'확장 유클리드 호제법',
  'bellman_ford':'벨만–포드',
  'flt':'페르마의 소정리',
  'aho_corasick':'아호-코라식',
  'merge_sort_tree':'머지 소트 트리',
  'modular_multiplicative_inverse':'모듈로 곱셈 역원',
  'multi_segtree':'다차원 세그먼트 트리',
  'berlekamp_massey':'벌래캠프–매시',
  'euler_characteristic':'오일러 지표 (χ=V-E+F)',
  'pbs':'병렬 이분 탐색',
  'regex':'정규 표현식',
  'euler_phi':'오일러 피 함수',
  'rabin_karp':'라빈–카프',
  'linked_list':'연결 리스트',
  'link_cut_tree':'링크/컷 트리',
  'point_in_convex_polygon':'볼록 다각형 내부의 점 판정',
  'rotating_calipers':'회전하는 캘리퍼스',
  'linearity_of_expectation':'기댓값의 선형성',
  'dp_deque':'덱을 이용한 다이나믹 프로그래밍',
  'polygon_area':'다각형의 넓이',
  'mobius_inversion':'뫼비우스 반전 공식',
  'dp_connection_profile':'커넥션 프로파일을 이용한 다이나믹 프로그래밍',
  'manacher':'매내처',
  'tsp':'외판원 순회 문제',
  'slope_trick':'함수 개형을 이용한 최적화',
  'pollard_rho':'폴라드 로',
  'numerical_analysis':'수치해석',
  'interpreter':'인터프리터',
  'tree_isomorphism':'트리 동형 사상',
  'offline_dynamic_connectivity':'오프라인 동적 연결성 판정',
  'hall':'홀의 결혼 정리',
  'alien':'Aliens 트릭',
  'dual_graph':'쌍대 그래프',
  'miller_rabin':'밀러–라빈 소수 판별법',
  'linear_programming':'선형 계획법',
  'point_in_non_convex_polygon':'오목 다각형 내부의 점 판정',
  'matroid':'매트로이드',
  'voronoi':'보로노이 다이어그램',
  'burnside':'번사이드 보조정리',
  'discrete_log':'이산 로그',
  'lucas':'뤼카 정리',
  'kitamasa':'키타마사',
  'hungarian':'헝가리안',
  'bipartite_graph':'이분 그래프',
  'general_matching':'일반적인 매칭',
  'min_enclosing_circle':'최소 외접원',
  'z':'z',
  'knuth':'크누스 최적화',
  'duality':'쌍대성',
  'dominator_tree':'도미네이터 트리',
  'rope':'로프',
  'statistics':'통계학',
  'stoer_wagner':'스토어–바그너',
  'palindrome_tree':'회문 트리',
  'bidirectional_search':'양방향 탐색',
  'monotone_queue_optimization':'단조 큐를 이용한 최적화',
  'hirschberg':'히르쉬버그',
  'discrete_sqrt':'이산 제곱근',
  'geometry_hyper':'4차원 이상의 기하학',
  'stable_marriage':'안정 결혼 문제',
  'simulated_annealing':'담금질 기법',
  'suffix_tree':'접미사 트리',
  'directed_mst':'유향 최소 신장 트리',
  'majority_vote':'보이어–무어 다수결 투표',
  'pigeonhole_principle':'비둘기집 원리',
  'half_plane_intersection':'반평면 교집합',
  'bayes':'베이즈 정리',
  'green':'그린 정리',
  'knuth_x':'크누스 X',
  'top_tree':'탑 트리',
  'dancing_links':'춤추는 링크',
  'pick':'픽의 정리',
  'a_star':'a*',
  'rb_tree':'레드-블랙 트리',
  'delaunay':'델로네 삼각분할',
  'discrete_kth_root':'이산 k제곱근',
  'circulation':'서큘레이션',
  'tree_compression':'트리 압축',
  'generating_function':'생성 함수',
  'multipoint_evaluation':'다중 대입값 계산',
  'differential_cryptanalysis':'차분 공격'
}

/* Commit messages */
const readmeMsg = 'Create README - BaekjunHub';
const discussionMsg = 'Prepend discussion post - BaekjunHub';
const createNotesMsg = 'Create NOTES - BaekjunHub';



/* state of upload for progress */
let uploadState = { uploading: false }
var bojData = {
  // Meta data of problem
  'meta': {
    'title': '',
    'problemId': '',
    'level': '',
    'problemDescription': '',
    'language': '',
    'message': '',
    'fileName': '',
    'category': '',
    'readme': ''
  },
  'submission': {
    'submissionId': '',
    'code': '',
    'memory': '',
    'runtime': ''
  }
}


const loader = setInterval(() => {

  const successTagpre = document.getElementById("status-table");
  if(successTagpre == null || typeof successTagpre === 'undefined') return null;

  var success = false;
  const successTag = successTagpre.childNodes[1].childNodes[0].childNodes[3].childNodes[0].innerHTML;
  if (checkElem(successTag)){
    if(successTag === "맞았습니다!!"){
      if(debug) console.log("맞았네..???");
      findData();
      success=true;
    }
    else if(successTag === "틀렸습니다"){
      clearTimeout(loader);
    }
  }
  if(success&&ready()) {
    clearTimeout(loader);
    
    startUpload();
    chrome.storage.local.get('stats', (s) => {
      const { stats } = s;
      const filePath = bojData.meta.problemId + bojData.meta.problemId + bojData.meta.language;
      let sha = null;
      let recentSubmissionId = null;
      if (
        stats !== undefined &&
        stats.submission !== undefined &&
        stats.submission[filePath] !== undefined
      ) {
        sha = stats.submission[filePath].sha;
        recentSubmissionId = stats.submission[filePath].submissionId;
      }

      if(recentSubmissionId === bojData.submission.submissionId){
        if(uploadState['countdown']) clearTimeout(uploadState['countdown']); 
        delete uploadState['countdown']
        uploadState.uploading = false; 
        markUploaded(); 
        console.log("Git up to date with submission ID "+recentSubmissionId);
        return;
      }
      else{
        if(debug) console.log("Stats:");
        if(debug) console.log(stats);
        if(debug) console.log(bojData.meta.title.replace(/\s+/g, '-')); 

        if (sha === null) {
          uploadGit(
            btoa(unescape(encodeURIComponent(bojData.meta.readme))),
            bojData.meta.title,
            'README.md',
            readmeMsg,
            'upload',
          );
        }
        /* Upload code to Git */
        setTimeout(function () {
          uploadGit(
            btoa(unescape(encodeURIComponent(bojData.submission.code))),
            bojData.meta.title,
            bojData.meta.fileName,
            bojData.meta.message,
            'upload',
            true,
            // callback is called when the code upload to git is a success
            () => { 
              if(uploadState['countdown']) clearTimeout(uploadState['countdown']); 
              delete uploadState['countdown']
              uploadState.uploading = false; 
              markUploaded(); 
            }
          ); // Encode `code` to base64
        }, 2000);
      }
    });

    
  }
}, 1000);


/* Main function for uploading code to GitHub repo, and callback cb is called if success */
const upload = (token, hook, code, directory, filename, sha, msg, cb=undefined) => {
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
        const sha = JSON.parse(xhr.responseText).content.sha; // get updated SHA.
        chrome.storage.local.get('stats', (data2) => {
          let { stats } = data2;
          if (stats === null || stats === {} || stats === undefined) {
            // create stats object
            stats = {};
            stats.solved = 0;
            stats.unrated = 0;
            stats.silver = 0;
            stats.gold = 0;
            stats.platinum = 0;
            stats.diamond = 0;
            stats.ruby = 0;

            stats.submission = {};
          }
          const filePath = bojData.meta.problemId + bojData.meta.problemId + bojData.meta.language;

          const submissionId = bojData.submission.submissionId;
          stats.submission[filePath] = { submissionId , sha}; // update sha key.
          chrome.storage.local.set({ stats }, () => {
            if(debug) console.log(
              `Successfully committed ${filename} to github`,
            );

            // if callback is defined, call it
            if(cb !== undefined) {
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
const update = (token, hook, addition, directory, msg, prepend, cb=undefined) => {
  const URL = `https://api.github.com/repos/${hook}/contents/${directory}/README.md`;

  /* Read from existing file on GitHub */
  const xhr = new XMLHttpRequest();
  xhr.addEventListener(' ', function () {
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
          cb
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
  cb = undefined
) {
  /* Get necessary payload data */
  chrome.storage.local.get('BaekjunHub_token', (t) => {
    const token = t.BaekjunHub_token;
    if (token) {
      chrome.storage.local.get('mode_type', (m) => {
        const mode = m.mode_type;
        if (mode === 'commit') {
          /* Get hook */
          chrome.storage.local.get('BaekjunHub_hook', (h) => {
            const hook = h.BaekjunHub_hook;
            if (hook) {
              /* Get SHA, if it exists */

              /* to get unique key */
              const filePath = problemName + fileName;
              chrome.storage.local.get('stats', (s) => {
                const { stats } = s;
                let sha = null;

                if (
                  stats !== undefined &&
                  stats.submission !== undefined &&
                  stats.submission[filePath] !== undefined
                ) {
                  sha = stats.submission[filePath].sha;
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
                    cb
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
                    cb
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

// Parse all BOJ Data
function findData(){
  // language, submisssionId, problemId, memory, runtime
  findFromResultTable();
  // problemDescription
  findProblemDescription();
  // code, message, title, difficulty
  findCode();
  bojData.meta.fileName = bojData.meta.title+languages[bojData.meta.language];
  bojData.meta.readme+="# ["+bojData.meta.level+"] "+bojData.meta.title+' - '+bojData.meta.problemId+'\n\n';
  bojData.meta.readme+="### 성능 요약\n\n";
  bojData.meta.readme+="메모리: "+bojData.submission.memory+'KB, ';
  bojData.meta.readme+="시간: "+bojData.submission.memory+'ms\n\n';
  bojData.meta.readme+="### 분류\n\n";
  bojData.meta.readme+=bojData.meta.category+'\n\n';
  bojData.meta.readme+="### 문제 설명\n\n";
  bojData.meta.readme+=bojData.meta.problemDescription+'\n\n';

  console.log(bojData);
}

function findFromResultTable(){

  bojData.submission.memory = document.getElementById("status-table").childNodes[1].childNodes[0].childNodes[4].innerText;
  bojData.submission.runtime = document.getElementById("status-table").childNodes[1].childNodes[0].childNodes[5].innerText;
  bojData.meta.language = document.getElementById("status-table").childNodes[1].childNodes[0].childNodes[6].childNodes[0].innerHTML;
  findSubmissionId();
  findProblemId();
  findSolvedAPI();
}

/* Function for finding and parsing the full code. */
/* - At first find the submission details url. */
/* - Then send a request for the details page. */
/* - Finally, parse the code from the html reponse. */
/* - Also call the callback if available when upload is success */
function findCode() {

  /* Get the submission details url from the submission page. */
  var submissionURL = '';
  // const e = document.getElementsByClassName('status-column__3SUg');
  if (checkElem(bojData.submission.submissionId)) {
    // for normal problem submisson
    submissionURL = "https://www.acmicpc.net/source/" + bojData.submission.submissionId;
    if(debug) console.log("https://www.acmicpc.net/source/"+bojData.submission.submissionId);
  } else{
    return;
  }
  
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
        var code = doc.getElementsByClassName('codemirror-textarea')[0].innerHTML;
        
        bojData.submission.code = code.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');        
      }
    };
    xhttp.open('GET', submissionURL, false);
    xhttp.send();
  }
}

function findSolvedAPI(){
  const levelxhttp = new XMLHttpRequest();
  levelxhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      /* received submission details as html reponse. */
      var leveldoc = JSON.parse(this.response);
      bojData.meta.title = leveldoc.titleKo.replace(/\s+/g, '-');
      bojData.meta.level = bj_level[leveldoc.level];
      bojData.meta.message = `[${bojData.meta.level}] Title: ${bojData.meta.title} Time: ${bojData.submission.runtime} ms, Memory: ${bojData.submission.memory} KB -BaekjunHub`; 
      var string = '';
      leveldoc.tags.forEach((tag)=>string+=categories[tag.key]+'('+tag.key+"), ");
      console.log(string.length);
      var length = string.length;
      bojData.meta.category = string.substring(0, length-2);
      if(debug) console.log(leveldoc);
    }
  }
  levelxhttp.open('GET', "https://solved.ac/api/v3/problem/show?problemId="+bojData.meta.problemId, false);
  levelxhttp.send();
}
// Get Submission Number
function findSubmissionId(){
  const problemElem = document.getElementById("status-table").childNodes[1].childNodes[0].childNodes[0];
  bojData.submission.submissionId = problemElem.innerText;
}

function findProblemId(){
  const problemElem = document.getElementById("status-table").childNodes[1].childNodes[0].childNodes[2];
  
  if(debug) console.log("getProblemId: ");
  if(debug) console.log(problemElem);
  let resultId = "";
  for(let i =0; i <= problemElem.childElementCount; i++){
    let temp_name = problemElem.childNodes[i].innerHTML;
    if(temp_name== null || temp_name=='undefined' || temp_name==undefined) continue;
    if(temp_name.length > resultId.length){
      if(debug) console.log("adding: "+temp_name);
      resultId = temp_name;
    }
  }
  if(debug) console.log(resultId);
  bojData.meta.problemId = resultId;
}


/* Parser function for the question and tags */
function findProblemDescription() {
  var questionDescription = "";
  var submissionURL;
  if (checkElem(bojData.meta.problemId)) {
    submissionURL = "https://www.acmicpc.net/problem/" + bojData.meta.problemId;
  } else{
    return;
  }

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
        questionDescription = doc.getElementById('problem_description').innerText;
        questionDescription = questionDescription.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\t/g, ' ').trim();
      }
    };
    xhttp.open('GET', submissionURL, false);
    xhttp.send();  
    bojData.meta.problemDescription = questionDescription;
  }
}

/* Since we dont yet have callbacks/promises that helps to find out if things went bad */
/* we will start 10 seconds counter and even after that upload is not complete, then we conclude its failed */
function startUploadCountDown() {
  uploadState.uploading = true;
  uploadState['countdown'] = setTimeout(() => {
    if (uploadState.uploading = true) {
      // still uploading, then it failed
      uploadState.uploading = false;
      markUploadFailed();
    }
  }, 10000);
}


// Upload icon - Set Loading Icon
/* start upload will inject a spinner on left side to the "Run Code" button */
function startUpload() {
  elem = document.getElementById('BaekjunHub_progress_anchor_element')
  if (elem !== undefined) {
    elem = document.createElement('span')
    elem.id = "BaekjunHub_progress_anchor_element"
    elem.className = "runcode-wrapper__8rXm"
    elem.style = "margin-left: 10px;padding-top: 0px;"
  }
  elem.innerHTML = `<div id="BaekjunHub_progress_elem" class="BaekjunHub_progress"></div>`
  target = document.getElementById("status-table").childNodes[1].childNodes[0].childNodes[3];
  if (target.childNodes.length > 0) {
    target.childNodes[0].append(elem);
  }
  // start the countdown
  startUploadCountDown();
}

// Upload icon - Set Completed Icon
/* This will create a tick mark before "Run Code" button signalling BaekjunHub has done its job */
function markUploaded() {
  elem = document.getElementById("BaekjunHub_progress_elem");
  elem.className = "";
  style = 'display: inline-block;transform: rotate(45deg);height:13px;width:5px;border-bottom:3px solid #78b13f;border-right:3px solid #78b13f;'
  elem.style = style;
}

// Upload icon - Set Failed Icon
/* This will create a failed tick mark before "Run Code" button signalling that upload failed */
function markUploadFailed() {
  elem = document.getElementById("BaekjunHub_progress_elem");
  elem.className = "";
  style = 'display: inline-block;transform: rotate(45deg);height:13px;width:5px;border-bottom:3px solid red;border-right:3px solid red;'
  elem.style = style;
}

/* Sync to local storage */
chrome.storage.local.get('isSync', (data) => {
  keys = [
    'BaekjunHub_token',
    'BaekjunHub_username',
    'pipe_BaekjunHub',
    'stats',
    'BaekjunHub_hook',
    'mode_type',
  ];
  if (!data || !data.isSync) {
    keys.forEach((key) => {
      chrome.storage.sync.get(key, (data) => {
        chrome.storage.local.set({ [key]: data[key] });
      });
    });
    chrome.storage.local.set({ isSync: true }, (data) => {
      if(debug) console.log('BaekjunHub Synced to local values');
    });
  } else {
    if(debug) console.log(data);
    if(debug) console.log('BaekjunHub Local storage already synced!');
  }
});

// inject the style
injectStyle();

/* inject css style required for the upload progress feature */
function injectStyle() {
  const style = document.createElement('style');
  style.textContent = '.BaekjunHub_progress {\
    display: inline-block; \
    pointer-events: none; \
    width: 0.8em; \
    height: 0.8em; \
    border: 0.4em solid transparent; \
    border-color: #eee; \
    border-top-color: #3E67EC; \
    border-radius: 50%; \
    animation: loadingspin 1.0s linear infinite; } @keyframes loadingspin { 100% { transform: rotate(360deg) }}';
  document.head.append(style);
}

/* Util function to check if an element exists */
function checkElem(elem) {
  return elem && elem.length > 0;
}

function ready(){
  if(bojData.meta.title === '') return false;
  if(bojData.meta.problemId === '') return false;
  if(bojData.meta.level === '') return false;
  if(bojData.meta.problemDescription === '') return false;
  if(bojData.meta.language === '') return false;
  if(bojData.meta.message === '') return false;
  if(bojData.meta.fileName === '') return false;
  if(bojData.submission.submissionId === '') return false;
  if(bojData.submission.code === '') return false;
  if(bojData.submission.memory === '') return false;
  if(bojData.submission.runtime === '') return false;
  return true;
}