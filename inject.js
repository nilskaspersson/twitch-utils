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

function forceThrough(fn, timeoutId) {
  window.clearTimeout(timeoutId);
  let i = 0;

  const cb = success => {
    if (!success && i < 20) {
      i++;
      timeoutId = window.setTimeout(() => fn(cb), 50);
    }
  };

  fn(cb);
}

let theatreTimeout;

function enterTheatre() {
  forceThrough(clickTheatre, theatreTimeout);
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

function initView() {
  enterTheatre();
}

function handleLoad() {
  initView();
  window.addEventListener("pushstate", initView);
  window.addEventListener("popstate",  initView);
}

window.addEventListener("load", handleLoad);
