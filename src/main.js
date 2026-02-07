import "./style.css";

let nouns;
let verbs;
let adjectives;
let givenWord;
let options = [];
let points = 0;

async function main() {
  await loadNouns();
  await loadAdjectives();
  await loadVerbs();

  await loadOptions(adjectives);

  console.log(options, givenWord);

  render();
}

async function loadNouns() {
  const response = await fetch("nouns.json");
  nouns = await response.json();
}

async function loadAdjectives() {
  const response = await fetch("adjectives.json");
  adjectives = await response.json();
}

async function loadVerbs() {
  const response = await fetch("verbs.json");
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
  <div className="main word">${givenWord?.kana ?? ""}</div>
   <div>
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

main();

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
