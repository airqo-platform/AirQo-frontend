import React from "react";
import 'assets/css/collapse.css'

class Collapse extends React.Component {
  constructor(props) {
    super(props);

    const initialCollapsed =
      props.initialCollapsed !== undefined ? props.initialCollapsed : true;
    this.state = {
      collapsed: initialCollapsed,
    };
  }

  toggle() {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    const stateStyle = { display: this.state.collapsed ? "none" : "inherit" };
    const icon = this.state.collapsed ? "triangle-right" : "triangle-down";
    const collapsedClass = this.state.collapsed ? "collapsed" : "expanded";
    return (
      <div className={`Collapse-container ${collapsedClass}`}>
        <div
          className={`Collapse-header ${this.props.className || ""}`}
          onClick={() => this.toggle()}
        >
          {this.props.header}
        </div>
        <div className="Collapse-content" style={stateStyle}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Collapse;
