import React from "react";

import ErrorView from "./ErrorView";

/**
 * ErrorBoundary
 *
 * A component that will catch an error thrown in a render-phase method of its
 * descendants and display an ErrorView. Note that this only catches render-phase
 * errors, so to catch an error in an asynchronous call or event handler, you
 * should add the error to the component's state and then rethrow it inside of
 * render():
 *
 * class Foo extends React.Component<Props, State> {
 *     state = {
 *         error: undefined,
 *     };
 *
 *     handleLoad = () => {
 *         try {
 *            // code that throws an error
 *         } catch (error) {
 *             this.setState({ error });
 *         }
 *     }
 *
 *     render() {
 *         if (this.state.error) throw this.state.error;
 *
 *         // render JSX
 *     }
 * }
 *
 * const Bar = () => <ErrorBoundary><Foo /></ErrorBoundary>;
 */
class ErrorBoundary extends React.Component {
  state = {
    error: undefined,
  };

  componentDidCatch(error) {
    console.log(error);
    this.setState({ error });
  }

  render() {
    // eslint-disable-next-line react/prop-types
    const { children } = this.props;
    const { error } = this.state;

    return error ? <ErrorView error={error} /> : children;
  }
}

export default ErrorBoundary;
