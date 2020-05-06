import React from "react";
import "./App.css";
import { Navbar, Nav, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import UserForm from "./UserForm";

export default class AddUser extends React.Component {
  constructor(props) {
    super(props);
    this.toggleAddUser = this.toggleAddUser.bind(this);
    this.addUser = this.addUser.bind(this);
  }
  toggleAddUser(e) {
    e.preventDefault();
    this.props.mappedToggleAddUser();
  }
  addUser(e) {
    e.preventDefault();
    const form = document.getElementById("addUserForm");
    if (form.userName.value !== "" && form.userDescription.value !== "") {
      const data = new FormData();
      data.append('userName', form.userName.value);
      data.append('firstName', form.firstName.value);
      data.append('lastName', form.lastName.value);
      data.append('email', form.email.value);
      data.append('password', form.password.value);
      data.append('password2', form.password2.value);
      this.props.mappedAddUser(data);
      form.reset();
    } else {
      return;
    }
  }
  render() {
    const userState = this.props.mappedAppState;
    return (
      <div>
        <Navbar inverse collapseOnSelect className="customNav">
          <Navbar.Header>
            <Navbar.Brand>
              <a href="/#">The Users</a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <LinkContainer to={{ pathname: "/", query: {} }}>
                <NavItem eventKey={1}>Home</NavItem>
              </LinkContainer>
            </Nav>
            <Nav pullRight>
              <LinkContainer
                to={{ pathname: "/", query: {} }}
                onClick={this.toggleAddUser}
              >
                <NavItem eventKey={1}>Add User</NavItem>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <div className="container">
          {userState.showAddActor && <UserForm addUser={this.addUser} />}
          {/* Each Smaller Components */}
          {this.props.children}
        </div>
      </div>
    );
  }
}
