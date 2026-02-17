export const DisableRadioButtons = () => {
  const givenSelected =
    localStorage.getItem("givenWordValue") ||
    document.querySelector('input[name="givenValue"]:checked').value;

  const optionsSelected =
    localStorage.getItem("optionsValue") ||
    document.querySelector('input[name="optionsValue"]:checked').value;

  document.querySelector(
    `input[name="optionsValue"][value="${optionsSelected}"]`,
  ).checked = true;

  document
    .querySelectorAll('input[name="givenValue"], input[name="optionsValue"]')
    .forEach((radio) => (radio.disabled = false));

  if (givenSelected) {
    document.querySelector(
      `input[name="givenValue"][value="${givenSelected}"]`,
    ).checked = true;
    const matchInOptions = document.querySelector(
      `input[name="optionsValue"][value="${givenSelected}"]`,
    );

    if (matchInOptions) {
      matchInOptions.disabled = true;
    }

    if (optionsSelected) {
      const matchInGiven = document.querySelector(
        `input[name="givenValue"][value="${optionsSelected}"]`,
      );

      if (matchInGiven) {
        matchInGiven.disabled = true;
      }
    }
  }
};
