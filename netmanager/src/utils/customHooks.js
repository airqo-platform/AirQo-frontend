import { useEffect } from "react";

export function useInitScrollTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}

export function useJiraHelpDesk() {
  useEffect(() => {
    // if (user._id != {}) {
    function jiraHelpdesk(callback) {
      let jhdScript = document.createElement("script");
      jhdScript.type = "text/javascript";
      jhdScript.setAttribute("data-jsd-embedded", null);
      jhdScript.setAttribute(
        "data-key",
        "cf4a44fc-f333-4e48-8e6c-6b94f97cea15"
      );
      jhdScript.setAttribute(
        "data-base-url",
        "https://jsd-widget.atlassian.com"
      );
      jhdScript.src = "https://jsd-widget.atlassian.com/assets/embed.js";
      if (jhdScript.readyState) {
        // old IE support
        jhdScript.onreadystatechange = function () {
          if (
            jhdScript.readyState === "loaded" ||
            jhdScript.readyState === "complete"
          ) {
            jhdScript.onreadystatechange = null;
            callback();
          }
        };
      } else {
        //modern browsers
        jhdScript.onload = function () {
          callback();
        };
      }
      try {
        document.getElementById("jira-help-desk").appendChild(jhdScript);
      } catch (e) {
        // eslint-disable-next-line no-empty
      }
    }

    jiraHelpdesk(function () {
      let DOMContentLoaded_event = document.createEvent("Event");
      DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
      window.document.dispatchEvent(DOMContentLoaded_event);
    });
  }, []);
}
