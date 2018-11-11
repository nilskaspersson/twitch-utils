"use strict";

const createPushStateEvent = `(function(history) {
  const pushState = history.pushState;
  const event     = new CustomEvent("pushstate");

  history.pushState = function(state) {
    if (typeof history.onpushstate === "function") {
      history.onpushstate({ state: state });
    }

    window.dispatchEvent(event);
    return pushState.apply(history, arguments);
  };
})(window.history);`;

const inlineScript           = document.createElement("script");
      inlineScript.type      = "text/javascript";
      inlineScript.innerHTML = createPushStateEvent;

document.getElementsByTagName("head")[0].appendChild(inlineScript);

const USERNAME = document.querySelector(`[data-a-target="user-display-name"]`).textContent;

function forceThrough(fn, timeoutId) {
  window.clearTimeout(timeoutId);
  let i = 0;

  const cb = success => {
    if (!success && i < 50) {
      i++;
      timeoutId = window.setTimeout(() => fn(cb), 50);
    }
  };

  fn(cb);
}

function clickTheatre(cb) {
  const toggler = document.getElementsByClassName("qa-theatre-mode-button")[0];

  if (toggler) {
    toggler.click();
  }

  if (typeof cb === "function") {
    cb(!!toggler);
  }
}

function observeChat(cb) {
  const log = document.querySelector(`[role="log"]`);

  if (typeof cb === "function") {
    cb(!!log);
  }

  if (!log) {
    return;
  }

  const observer = new MutationObserver(handleLogMutation);

  observer.observe(log, {
    childList: true
  });
}

const HIGHLIGHTED_WORDS = [USERNAME, "mest"];

function wordInString(s, word) {
  return word.includes(s);
}

function handleLogMutation(mutationList) {
  mutationList.forEach((mutation) => {
    switch(mutation.type) {
      case "childList":
        mutation.addedNodes.forEach(node => {
          const text = node.querySelector(".text-fragment");

          if (!text) {
            return;
          }

          const name = node.querySelector("[data-a-user]").textContent;

          if (name.toLowerCase() === USERNAME) {
            node.style.opacity = ".75";
          }

          if (text && name !== USERNAME) {
            if (HIGHLIGHTED_WORDS.some(w => wordInString(text.textContent.toLowerCase(), w))) {
              handleHighlightedMessage(node);

              if (document.visibilityState === "hidden") {
                sendNotification(text.textContent, name);
              }
            }
          }
        });
        break;
    }
  });
}

function sendNotification(message, title) {
  chrome.runtime.sendMessage(null, JSON.stringify({
    message : message,
    title   : title,
    type    : "NOTIFICATION"
  }));
}

function handleHighlightedMessage(node) {
  node.style.backgroundImage = "linear-gradient(to right, rgba(100, 65, 164, 0), rgba(100, 65, 164, 1))";
}

let theatreTimeout;
let logTimeout;

function initView() {
  forceThrough(clickTheatre, theatreTimeout);
  forceThrough(observeChat,  logTimeout);
}

function handleLoad() {
  initView();
  window.addEventListener("pushstate", initView);
  window.addEventListener("popstate",  initView);
}

window.addEventListener("load", handleLoad);
