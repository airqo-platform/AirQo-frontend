import { useEffect, useState } from "react";
import { useUserPreferenceData } from "redux/UserPreference/selectors";

export function useInitScrollTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}

export function useJiraHelpDesk() {
  const preferenceKey = "feedbackBtn";
  const userPreferenceData = useUserPreferenceData();
  const [scrpt, setScrpt] = useState();

  useEffect(() => {
    function jiraHelpdesk(callback) {
      if (
        userPreferenceData[preferenceKey] &&
        userPreferenceData[preferenceKey].value
      ) {
        let jhdScript = document.createElement("script");
        jhdScript.type = "text/javascript";
        jhdScript.setAttribute("data-jsd-embedded", null);
        jhdScript.setAttribute("data-key", process.env.REACT_APP_JIRA_KEY);
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
        setScrpt(jhdScript);
      } else {
        scrpt &&
          scrpt.parentNode.removeChild(scrpt) &&
          setTimeout(() => window.location.reload(false), 500);
      }
    }

    jiraHelpdesk(function () {
      let DOMContentLoaded_event = document.createEvent("Event");
      DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
      window.document.dispatchEvent(DOMContentLoaded_event);
    });
  }, [userPreferenceData]);
}
