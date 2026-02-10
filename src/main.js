import "./style.css";

let givenWord;
let options = [];
let points = 0;
let data;
let step = 1;
let lastRoundPoints;

async function loadData(level) {
  const response = await fetch(`/${level}.json`);
  data = await response.json();
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

async function loadRandomWord(data) {
  return data[Math.floor(Math.random() * data?.length)];
}

async function loadOptions(data) {
  for (let i = 0; i < 4; ++i) {
    options.push(await loadRandomWord(data));
  }
  givenWord = options[0];
  options = shuffle(options);
}

function render() {
  document.querySelector("#app").innerHTML = `
  <div id="app">
    <div class="buttonContainer">
      <button data-level="N5">N5</button>
      <button data-level="N4">N4</button>
      <button data-level="N3">N3</button>
      <button data-level="N2">N2</button>
      <button data-level="N1">N1</button>
    </div>
  </div>
`;
}

document.querySelector("#app").addEventListener("click", (e) => {
  const button = e.target.closest("button[data-index]");

  if (!button) return;

  const index = button.dataset.index;
  const selectedOption = options[index];

  if (selectedOption === givenWord) {
    points++;
    document.getElementById(selectedOption.romaji).classList.add("correct");
  } else {
    document.getElementById(selectedOption.romaji).classList.add("incorrect");
  }

  document.querySelectorAll("button").forEach((button) => {
    if (button.id === "next") {
      if (step === 3) {
        button.innerText = "Start again";
      }
      button.removeAttribute("disabled");
    } else if (button.id === "home") {
      button.disabled = false;
    } else {
      button.disabled = true;
    }
  });
});

function loadQuiz() {
  document.querySelector("#app").innerHTML = `
  <div id="app">
  <div class="mainWord">${givenWord?.kana ?? ""}</div>
   <div class="optionContainer">
      ${options
        .map((option, index) => {
          return `<button data-index="${index}" id="${option.romaji}">
            ${option.kana}
          </button>`;
        })
        .join("")}
    </div>
    <div>${step + " step, points: " + points}</div>
    <div>Points from the previous round: ${lastRoundPoints ?? "No points saved yet"}</div>
    <button id="next" disabled>Next</button>
    <button id="home">Back to start page</button>
  </div>
`;
}

//TODO: check if this can be handled better
document.body.addEventListener("click", (e) => {
  if (e.target.id === "next") {
    loadNextStep();
  } else if (e.target.id === "home") {
    options = [];
    givenWord = "";
    points = 0;
    step = 1;
    Router.go("/");
  }
});

document.body.addEventListener("click", (e) => {
  if (e.target.innerHTML === "Start again") {
    startAgain();
  }
});

const Router = (() => {
  const routes = [];

  function add(path, handler) {
    routes.push({ path, handler });
  }

  function match(pathname) {
    for (const route of routes) {
      const paramNames = [];
      const regexPath = route.path.replace(/:([^/]+)/g, (_, name) => {
        paramNames.push(name);
        return "([^/]+)";
      });

      const match = pathname.match(new RegExp("^" + regexPath + "$"));

      if (!match) continue;

      const params = {};
      paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });

      return { handler: route.handler, params };
    }
  }

  function go(path) {
    history.pushState({}, "", path);
    resolve();
  }

  function resolve() {
    const result = match(location.pathname);
    if (result) {
      result.handler(result.params);
    } else {
      console.warn("No route:", location.pathname);
    }
  }

  function start() {
    window.addEventListener("popstate", resolve);

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-level]");
      if (!btn) return;

      const level = btn.dataset.level;
      Router.go(`/myquiz/${level}`);
    });

    resolve();
  }

  return { add, go, start };
})();

async function main() {
  render();

  Router.add("/", () => {
    render();
  });

  Router.add("/myquiz/:level", ({ level }) => {
    prepareQuiz(level);
  });

  Router.start();
}

async function prepareQuiz(level) {
  await loadData(level);
  await loadOptions(data);
  await loadPreviousResult(level);
  await loadQuiz();
}

async function loadNextStep() {
  step++;
  await reset();
}

async function startAgain() {
  const level = location.pathname.split("/").pop();

  await saveToLocalStorage(level, points);

  step = 1;
  points = 0;

  await loadPreviousResult(level);
  await reset(level);
}

async function saveToLocalStorage(level, points) {
  const saved = JSON.parse(localStorage.getItem("results")) || {};

  if (!saved[level]) {
    saved[level] = [];
  }

  saved[level].push({
    points,
    date: new Date().toISOString(),
  });

  localStorage.setItem("results", JSON.stringify(saved));
}

async function reset() {
  options = [];
  givenWord = "";
  await loadOptions(data);
  await loadQuiz();
}

async function loadPreviousResult(level) {
  const results = JSON.parse(localStorage.getItem("results")) || {};
  const currentLevelResults = results[level] || [];
  lastRoundPoints = currentLevelResults[currentLevelResults.length - 1]?.points;
}

main();
