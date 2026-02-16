export const DisableRadioButtons = () => {
  const givenSelected =
    localStorage.getItem("givenWordValue") ||
    document.querySelector('input[name="givenValue"]:checked').value;

  const optionsSelected =
    localStorage.getItem("optionsValue") ||
    document.querySelector('input[name="optionsValue"]:checked').value;

  document
    .querySelectorAll('input[name="givenValue"], input[name="optionsValue"]')
    .forEach((radio) => (radio.disabled = false));

  if (givenSelected) {
    const matchInOptions = document.querySelector(
      `input[name="optionsValue"][value="${optionsSelected}"]`,
    );

    if (matchInOptions) {
      matchInOptions.disabled = true;
    }

    if (optionsSelected) {
      const matchInGiven = document.querySelector(
        `input[name="givenValue"][value="${givenSelected}"]`,
      );

      if (matchInGiven) {
        matchInGiven.disabled = true;
      }
    }
  }
  //TODO - loading from local storage now works, but disabling is broken

  document.querySelector(
    `input[name="optionsValue"][value="${optionsSelected}"]`,
  ).checked = true;
  document.querySelector(
    `input[name="optionsValue"][value="${optionsSelected}"]`,
  ).disabled = false;

  document.querySelector(
    `input[name="givenValue"][value="${givenSelected}"]`,
  ).checked = true;
  document.querySelector(
    `input[name="givenValue"][value="${givenSelected}"]`,
  ).disabled = false;
};
