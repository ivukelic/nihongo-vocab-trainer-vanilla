import "./style.css";
import { Router } from "./router.js";
import { DisableRadioButtons } from "./disableRadioButtons.js";
import { inject } from "@vercel/analytics";

let givenWord;
let options = [];
let points = 0;
let data;
let step = 1;
let currentLevelResults;
let wrongAnswers = [];
let givenWordValue;
let optionsValue;
let yourAnswer;

// Functions called during initalization

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
    
    <div class="fieldsetContainer">
      <fieldset>
        <legend>Select given word value:</legend>
        <div>
          <input type="radio" id="kanji" name="givenValue" value="kanji" checked />
          <label for="kanji">kanji</label>
        </div>

        <div>
          <input type="radio" id="kana" name="givenValue" value="kana" />
          <label for="kana">kana</label>
        </div>

        <div>
          <input type="radio" id="romaji" name="givenValue" value="romaji" />
          <label for="romaji">romaji</label>
        </div>

          <div>
          <input type="radio" id="english" name="givenValue" value="english" />
          <label for="english">english</label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Select options value:</legend>
        <div>
          <input type="radio" id="options-kanji" name="optionsValue" value="kanji" />
          <label for="options-kanji">kanji</label>
        </div>

        <div>
          <input type="radio" id="options-kana" name="optionsValue" value="kana" checked/>
          <label for="options-kana">kana</label>
        </div>

        <div>
          <input type="radio" id="options-romaji" name="optionsValue" value="romaji" />
          <label for="options-romaji">romaji</label>
        </div>

          <div>
          <input type="radio" id="options-english" name="optionsValue" value="english" />
          <label for="options-english">english</label>
        </div>
      </fieldset>
    </div>
  </div>
`;
}

// Handling radio buttons/value selection

document.addEventListener("change", (e) => {
  var givenValueChecked = document.querySelector(
    'input[name="givenValue"]:checked',
  );
  var optionsValueChecked = document.querySelector(
    'input[name="optionsValue"]:checked',
  );

  if (!givenValueChecked || !optionsValueChecked) {
    return;
  }

  if (e.target.name === "givenValue") {
    givenWordValue = givenValueChecked.value;
    localStorage.setItem("givenWordValue", givenWordValue);
  } else if (e.target.name === "optionsValue") {
    optionsValue = optionsValueChecked.value;
    localStorage.setItem("optionsValue", optionsValue);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const givenValueChecked = document.querySelector(
    'input[name="givenValue"]:checked',
  );

  const optionsValueChecked = document.querySelector(
    'input[name="optionsValue"]:checked',
  );

  if (!givenValueChecked || !optionsValueChecked) {
    return;
  }

  if (givenValueChecked && optionsValueChecked) {
    givenWordValue =
      localStorage.getItem("givenWordValue") || givenValueChecked.value;
    optionsValue =
      localStorage.getItem("optionsValue") || optionsValueChecked.value;
  }
});

document.addEventListener("change", function () {
  DisableRadioButtons();
});

document.addEventListener("DOMContentLoaded", function () {
  DisableRadioButtons();
});

// Handling selecting answer

document.querySelector("#app").addEventListener("click", (e) => {
  const button = e.target.closest("button[data-index]");

  if (!button) {
    return;
  }

  const index = button.dataset.index;
  yourAnswer = options[index];

  if (yourAnswer === givenWord) {
    points++;
    document.getElementById(yourAnswer.romaji).classList.add("correct");

    document.getElementById("answerInfo").classList.remove("hidden");
    document.getElementById("answerInfo").classList.add("visible");
  } else {
    wrongAnswers.push(yourAnswer);

    document.getElementById(yourAnswer.romaji).classList.add("incorrect");

    document.getElementById("answerInfo").classList.remove("hidden");
    document.getElementById("answerInfo").classList.add("visible");

    document.getElementById("yourAnswer").classList.remove("correctOnly");

    document.getElementById("yourAnswerEnglish").textContent =
      yourAnswer?.english;
    document.getElementById("yourAnswerRomaji").textContent =
      yourAnswer?.romaji;
    document.getElementById("yourAnswerKana").textContent = yourAnswer?.kana;
    document.getElementById("yourAnswerKanji").textContent = yourAnswer?.kanji;
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

document.body.addEventListener("click", (e) => {
  if (e.target.innerHTML === "Start again") {
    startAgain();
  }
});

function loadQuiz(givenWordValue, optionsValue) {
  document.querySelector("#app").innerHTML = `
  <div id="app">
  <div class="mainWord">${givenWord?.[givenWordValue] ?? ""}</div>

<div id="answerInfo" class="answerInfo hidden">
  <div class="correctAnswer">
    <div class="answerHeader">Correct answer</div>
    <div>English: ${givenWord.english}</div>
    <div>Romaji: ${givenWord.romaji}</div>
    <div>Kana: ${givenWord.kana}</div>
    <div>Kanji: ${givenWord.kanji}</div>
  </div>
  <div id="yourAnswer" class="yourAnswer correctOnly">
    <div class="answerHeader">Your answer</div>
    <div>English: <span id="yourAnswerEnglish"></span></div>
    <div>Romaji: <span id="yourAnswerRomaji"></span></div>
    <div>Kana: <span id="yourAnswerKana"></span></div>
    <div>Kanji: <span id="yourAnswerKanji"></span></div>
  </div>

</div>  

  <div class="optionContainer">
      ${options
        .map((option, index) => {
          return `<button data-index="${index}" id="${option.romaji}">
            ${option[optionsValue]}
          </button>`;
        })
        .join("")}
    </div>
    
    <div class="infoContainer">
      <div>${step} step</div>
      <div>points: ${points}</div>
    </div>
    
    <div class="prevPoints">Points from the previous round: ${currentLevelResults[currentLevelResults.length - 1]?.points ?? "No points saved yet"}</div>
    
    <div class="bottomButtonContainer">
      <button id="next" disabled>Next</button>
      <button id="home">Back to start page</button>
      <button id="open">See previous scores</button>
    </div>
    
    <dialog id="dialog">
    <div>
      <button id="close" type="button">Close</button>
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
      <button id="clear">Clear score</button>
    </div>
    </dialog>
  </div>
`;
}

//TODO: check if this can be handled better
document.body.addEventListener("click", (e) => {
  //TODO: handle clicking on backdrop to close dialog
  const dialog = document.getElementById("dialog");

  if (!dialog) {
    return;
  }

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

async function main() {
  inject();
  render();

  Router.add("/", () => {
    render();
    DisableRadioButtons();
  });

  Router.add("/myquiz/:level", ({ level }) => {
    prepareQuiz(level, givenWordValue, optionsValue);
  });

  Router.start();
}

// Quiz related functions

async function prepareQuiz(level, givenWordValue, optionsValue) {
  if (givenWordValue === undefined && optionsValue === undefined) {
    givenWordValue = localStorage.getItem("givenWordValue");
    optionsValue = localStorage.getItem("optionsValue");
  }

  await loadData(level);
  await loadOptions(data);
  await loadPreviousResult(level);
  await loadQuiz(givenWordValue, optionsValue);
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
  let saved = JSON.parse(localStorage.getItem(level)) || [];

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
  yourAnswer = "";
  options = [];
  givenWord = "";
  await loadOptions(data);
  await loadQuiz(givenWordValue, optionsValue);
}

async function loadPreviousResult(level) {
  const results = JSON.parse(localStorage.getItem(level)) || [];
  currentLevelResults = results || [];
}

main();
