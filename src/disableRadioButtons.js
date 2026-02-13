export const DisableRadioButtons = () => {
  const givenSelected = document.querySelector(
    'input[name="givenValue"]:checked',
  );

  const optionsSelected = document.querySelector(
    'input[name="optionsValue"]:checked',
  );

  document
    .querySelectorAll('input[name="givenValue"], input[name="optionsValue"]')
    .forEach((radio) => (radio.disabled = false));

  if (givenSelected) {
    const matchInOptions = document.querySelector(
      `input[name="optionsValue"][value="${givenSelected.value}"]`,
    );

    if (matchInOptions) {
      matchInOptions.disabled = true;
    }
  }

  if (optionsSelected) {
    const matchInGiven = document.querySelector(
      `input[name="givenValue"][value="${optionsSelected.value}"]`,
    );

    if (matchInGiven) {
      matchInGiven.disabled = true;
    }
  }
};
