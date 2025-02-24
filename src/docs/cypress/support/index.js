Cypress.on("window:before:load", function (window) {
  const original = window.EventTarget.prototype.addEventListener;

  window.EventTarget.prototype.addEventListener = function () {
    if (arguments && arguments[0] === "beforeunload") {
      return;
    }
    return original.apply(this, arguments);
  };

  Object.defineProperty(window, "onbeforeunload", {
    get: function () {},
    set: function () {},
  });
});
