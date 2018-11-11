"use strict";

chrome.runtime.onMessage.addListener(data => {
  const message = JSON.parse(data);

  if (message.type === "NOTIFICATION") {
    chrome.notifications.create(null, {
      iconUrl : "favicon.ico",
      message : message.message,
      title   : message.title,
      type    : "basic"
    });
  }
});
