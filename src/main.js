import "./style.css";
import { Router } from "./router.js";

let givenWord;
let options = [];
let points = 0;
let data;
let step = 1;
let currentLevelResults;
let wrongAnswers = [];

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
    wrongAnswers.push(selectedOption);
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
    <div>Points from the previous round: ${currentLevelResults[currentLevelResults.length - 1]?.points ?? "No points saved yet"}</div>
    <button id="next" disabled>Next</button>
    <button id="home">Back to start page</button>
    
    <button id="open">dialog butt</button>

    <dialog id="dialog">
    <div><button id="close" type="button">Close</button>
    </div>
      
      <div id="resultContainer">
        ${currentLevelResults
          .map((result, index) => {
            return `<p data-index="${index}">
            ${result.points} ${new Intl.DateTimeFormat("en-GB").format(new Date(result.date))}
          </p>`;
          })
          .join("")}
      </div>
      <div>
      <button id="clear">Clear results</button>
      </div>
    </dialog>
  </div>
`;
}

//TODO: check if this can be handled better
document.body.addEventListener("click", (e) => {
  //TODO: handle clicking on backdrop to close dialog
  const dialog = document.getElementById("dialog");

  if (e.target.id === "next") {
    loadNextStep();
  } else if (e.target.id === "home") {
    options = [];
    givenWord = "";
    points = 0;
    step = 1;
    wrongAnswers = [];
    Router.go("/");
  } else if (e.target.id === "open") {
    dialog.showModal();
  } else if (e.target.id === "close") {
    dialog.close();
  } else if (e.target.id === "clear") {
    const level = location.pathname.split("/").pop();
    localStorage.removeItem(level);
    dialog.close();
  }
});

document.body.addEventListener("click", (e) => {
  if (e.target.innerHTML === "Start again") {
    startAgain();
  }
});

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

  await saveToLocalStorage(level, points, wrongAnswers);

  step = 1;
  points = 0;
  wrongAnswers = [];

  await loadPreviousResult(level);
  await reset(level);
}

async function saveToLocalStorage(level, points, wrongAnswers) {
  const saved = JSON.parse(localStorage.getItem(level)) || [];

  if (!saved) {
    saved = [];
  }

  saved.push({
    points,
    wrongAnswers,
    date: new Date().toISOString(),
  });

  localStorage.setItem(level, JSON.stringify(saved));
}

async function reset() {
  options = [];
  givenWord = "";
  await loadOptions(data);
  await loadQuiz();
}

async function loadPreviousResult(level) {
  const results = JSON.parse(localStorage.getItem(level)) || [];
  currentLevelResults = results || [];
  console.log(currentLevelResults);
}

main();
