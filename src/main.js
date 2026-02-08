import "./style.css";

let nouns;
let verbs;
let adjectives;
let givenWord;
let options = [];
let points = 0;

main();

async function main() {
  await loadNouns();
  await loadAdjectives();
  await loadVerbs();

  await loadOptions(adjectives);

  render();
  Router.add("/", () => {
    render();
  });

  Router.add("/myquiz/:level", ({ level }) => {
    loadQuiz(level);
  });

  Router.start();
}

async function loadNouns() {
  const response = await fetch("/nouns.json");
  nouns = await response.json();
}

async function loadAdjectives() {
  const response = await fetch("/adjectives.json");
  adjectives = await response.json();
}

async function loadVerbs() {
  const response = await fetch("/verbs.json");
  verbs = await response.json();
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
      <button data-level="n5">N5</button>
      <button data-level="n4">N4</button>
      <button data-level="n3">N3</button>
      <button data-level="n2">N2</button>
      <button data-level="n1">N1</button>
    </div>
  </div>
`;
}

document.querySelector("#app").addEventListener("click", (e) => {
  const button = e.target.closest("button[data-index]");

  if (!button) return;

  const index = button.dataset.index;
  const selectedOption = options[index];

  if (selectedOption.kana === givenWord.kana) {
    points++;
    document.getElementById(selectedOption.romaji).classList.add("correct");
  } else {
    document.getElementById(selectedOption.romaji).classList.add("incorrect");
  }

  document.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });
});

function loadQuiz(level) {
  document.querySelector("#app").innerHTML = `
  <div id="app">
  <div class="mainWord">${givenWord?.kana + level ?? ""}</div>
   <div class="optionContainer">
      ${options
        .map((option, index) => {
          return `<button data-index="${index}" id="${option.romaji}">
            ${option.kana}
          </button>`;
        })
        .join("")}
    </div>
  </div>
`;
}

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
