//Work to be done in the future to add a login helper to the website. For now, this file is just a placeholder.
(function () {
  const captchaLabelImg = document.querySelector(
    'img[src*="captcha1.png"], img[alt="CAPTCHA"]',
  );
  if (captchaLabelImg) {
    captchaLabelImg.src = chrome.runtime.getURL("captcha.png");
  }
})();
