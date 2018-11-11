function saveHighlights(event) {
  chrome.storage.sync.set({
    highlights: event.target.value
  });
}

const highlightsElem = document.getElementById("highlights");

highlightsElem.addEventListener("change", saveHighlights);

function initValues() {
  chrome.storage.sync.get({
    highlights: "",
  }, ({ highlights }) => {
    highlightsElem.value = highlights;
  });
}

document.addEventListener("DOMContentLoaded", initValues);
