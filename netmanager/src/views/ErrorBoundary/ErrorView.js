import get from "lodash/get";
import React from "react";
import URI from "urijs";

import Collapse from "./Collapse";
import Alert from "./Alert";

function buildUrl(path, params) {
  let url = new URI(path);
  if (params) {
    url.query(params);
  }
  return url.toString();
}

// TODO: Instead of having a bunch of renderSomeError methods, each method can
// simply be a separate component. This helps with debugging with React DevTools.
class ErrorView extends React.Component {
  stringifyStatus = (status) => {
    if (typeof status === "object") {
      const errorObject = status;
      status = "";
      for (const field in errorObject) {
        let value = errorObject[field];
        value = Array.isArray(value) ? value.join(",") : value;
        status = `${status ? status + ", " : ""}${field}: ${value}`;
      }
    }
    return status;
  };

  renderUserFriendlyHttpError(error) {
    const status = get(error, "response.status", 500);
    const statusText = get(error, "response.statusText", "Unknown error");

    if (status >= 500) {
      return (
        <Alert type="danger" title="An error occurred">
          <p>
            There has been an error with your request. Please try refreshing the
            page. If the error persists, contact AirQo support.
          </p>
        </Alert>
      );
    } else if (status >= 400) {
      return (
        <Alert type="danger" title="Forbidden">
          <p>You don’t have permissions to view this page or resource.</p>
        </Alert>
      );
    } else {
      return (
        <Alert type="danger" title={statusText}>
          <p>
            Our servers responded with {status} {statusText}.
          </p>
        </Alert>
      );
    }
  }

  renderHttpError(error) {
    const method = get(error, "config.method", "???").toUpperCase();
    const url = buildUrl(
      get(error, "config.url", ""),
      get(error, "config.params", undefined)
    );
    const req = `${method} ${url}`;

    const status = get(error, "response.status", 500);
    const statusText = get(error, "response.statusText", "Unknown error");
    const resp = `${status} ${statusText}`;

    return (
      <Alert type="danger" title="HTTP error">
        <p>While making the following request:</p>
        <p className="ml-20 text-16 text-bold">{req}</p>
        <p>The server returned:</p>
        <p className="ml-20 text-16 text-bold text-oc-red-7">{resp}</p>
        <div className="mt-10">
          <Collapse header="Details">
            <pre className="text-12" style={{ overflowX: "scroll" }}>
              {JSON.stringify(this.props.error, null, 2)}
            </pre>
          </Collapse>
        </div>
      </Alert>
    );
  }

  renderUnknownError(error) {
    return (
      <Alert type="danger" title="Oh no, an unknown error has happened">
        <div className="mt-10">
          <Collapse header="Details">
            <pre className="text-12" style={{ overflowX: "scroll" }}>
              <p>{error.toString()}</p>
              {JSON.stringify(error, null, 2)}
            </pre>
          </Collapse>
        </div>
      </Alert>
    );
  }

  render() {
    const error = this.props.error;

    if ("config" in error && "response" in error) {
      if (process.env.NODE_ENV === "production") {
        return this.renderUserFriendlyHttpError(error);
      } else {
        return this.renderHttpError(error);
      }
    }

    return this.renderUnknownError(error);
  }
}

export default ErrorView;
