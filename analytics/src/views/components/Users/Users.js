import React from "react";
import { Alert, Glyphicon, Button, Modal } from "react-bootstrap";
import UserEditForm from "./UserEditForm";

export default class Users extends React.Component {
  constructor(props) {
    super(props);
    this.hideEditDialog = this.hideEditDialog.bind(this);
    this.submitEditUser = this.submitEditUser.bind(this);
    this.hideDeleteDialog = this.hideDeleteDialog.bind(this);
    this.cofirmDeleteUser = this.cofirmDeleteUser.bind(this);
  }

  showEditDialog(userToEdit) {
    this.props.mappedshowEditDialog(userToEdit);
  }
  hideEditDialog() {
    this.props.mappedhideEditDialog();
  }
  submitEditUser(e) {
    e.preventDefault();
    const editForm = document.getElementById("EditUserForm");
    const userData = this.props.mappeduserState;
    if (editForm.userName.value !== "") {
      const data = new FormData();
      data.append('id', userData.userToEdit._id);
      data.append('userName', editForm.userName.value);
      data.append('firstName', editForm.firstName.value);
      data.append('lastName', editForm.lastName.value);
      data.append('email', editForm.email.value);
      this.props.mappedEditUser(data);
    } else {
      return;
    }
  }
  showDeleteDialog(userToDelete) {
    this.props.mappedShowDeleteDialog(userToDelete);
  }
  hideDeleteDialog() {
    this.props.mappedHideDeleteDialog();
  }
  cofirmDeleteUser() {
    this.props.mappedConfirmDeleteUser(this.props.mappeduserState.userToDelete);
  }

  showConfirmDialog(userToConfirm) {
    this.props.mappedShowConfirmDialog(userToConfirm);
  }

  hideConfirmDialog() {
    this.props.mappedhideConfirmDialog();
  }

  approveConfirmUser() {
    this.props.mappedApproveConfirmUser(this.props.mappeduserState.userToConfirm);
  }



  componentWillMount() {
    this.props.fetchUsers();
  }

  render() {
    const userState = this.props.mappeduserState;
    const users = userState.users;
    const editUser = userState.userToEdit;
    return (
      <div className="col-md-12">
        <h3 className="centerAlign">Users</h3>
        {!users && userState.isFetching && <p>Loading users....</p>}
        {users.length <= 0 && !userState.isFetching && (
          <p>No Users Available. Add A User to List here.</p>
        )}
        {users && users.length > 0 && !userState.isFetching && (
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>FirstName</th>
                <th>LastName</th>
                <th>email</th>
                <th>userName</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i}>
                  <td className="text-capitalize">{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.userName}</td>
                  <td>
                    <Button
                      onClick={() => this.showEditDialog(user)}
                      bsStyle="info"
                      bsSize="xsmall"
                    >
                      <Glyphicon glyph="pencil" />
                    </Button>
                    <Button
                      className="ml-1"
                      onClick={() => this.showDeleteDialog(user)}
                      bsStyle="info"
                      bsSize="xsmall"
                    >
                      <Glyphicon glyph="trash" />
                    </Button>
                    <Button className="ml-1" onClick={() => this.showConfirmDialog(user)} bsStyle="info" bsSize="xsmall">
                      <Glyphicon glyph="ok" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Dialog for editing user */}
        <Modal
          show={userState.showEditDialog}
          onHide={this.hideEditDialog}
          container={this}
          aria-labelledby="contained-modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title">Edit Your User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="col-md-12">
              {editUser && (
                <UserEditForm
                  userData={editUser}
                  editUser={this.submitEditUser}
                />
              )}
              {editUser && userState.isFetching && (
                <Alert bsStyle="info">
                  <strong>Updating...... </strong>
                </Alert>
              )}
              {editUser && !userState.isFetching && userState.error && (
                <Alert bsStyle="danger">
                  <strong>Failed. {userState.error} </strong>
                </Alert>
              )}
              {editUser && !userState.isFetching && userState.successMsg && (
                <Alert bsStyle="success">
                  <strong> {editUser.firstName} </strong>
                  {userState.successMsg}
                </Alert>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.hideEditDialog}>Close</Button>
          </Modal.Footer>
        </Modal>

        {/*Modal to Delete User */}
        <Modal
          show={userState.showDeleteDialog}
          onHide={this.hideDeleteDialog}
          container={this}
          aria-labelledby="contained-modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title">
              Delete Your User
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {userState.userToDelete &&
              !userState.error &&
              !userState.isFetching && (
                <Alert bsStyle="warning">
                  Are you sure you want to delete this User{" "}
                  <strong className="text-capitalize">
                    {userState.userToDelete.userName}{" "}
                  </strong>{" "}
                  ?
                </Alert>
              )}
            {userState.userToDelete && userState.error && (
              <Alert bsStyle="warning">
                Failed. <strong>{userState.error} </strong>
              </Alert>
            )}

            {userState.userToDelete &&
              !userState.error &&
              userState.isFetching && (
                <Alert bsStyle="success">
                  <strong>Deleting.... </strong>
                </Alert>
              )}

            {!userState.userToDelete &&
              !userState.error &&
              !userState.isFetching && (
                <Alert bsStyle="success">
                  User <strong>{userState.successMsg} </strong>
                </Alert>
              )}
          </Modal.Body>
          <Modal.Footer>
            {!userState.successMsg && !userState.isFetching && (
              <div>
                <Button onClick={this.cofirmDeleteUser}>Yes</Button>
                <Button onClick={this.hideDeleteDialog}>No</Button>
              </div>
            )}
            {userState.successMsg && !userState.isFetching && (
              <Button onClick={this.hideDeleteDialog}>Close</Button>
            )}
          </Modal.Footer>
        </Modal>

        {/* model to confirm a user */}
        <Modal show={userState.showConfirmDialog}
          onHide={this.hideConfirmDialog}
          container={this}
          aria-labelledby="contained-modal-title">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title">Confirm Your User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {userState.userToConfirm && !userState.error && !userState.isFetching &&
              <Alert bsStyle="warning">
                Are you sure you want to confirm this User <strong className="text-capitalize">{userState.userToConfirm.firstName} </strong> ?
</Alert>
            }
            {userState.userToConfirm && userState.error &&
              <Alert bsStyle="warning">
                Failed. <strong>{userState.error} </strong>
              </Alert>
            }

            {userState.userToConfirm && !userState.error && userState.isFetching &&
              <Alert bsStyle="success">
                <strong>Confirming.... </strong>
              </Alert>
            }

            {!userState.userToConfirm && !userState.error && !userState.isFetching &&
              <Alert bsStyle="success">
                User <strong>{userState.successMsg} </strong>
              </Alert>
            }
          </Modal.Body>
          <Modal.Footer>
            {!userState.successMsg && !userState.isFetching &&
              <div>
                <Button onClick={this.approveConfirmUser}>Yes</Button>
                <Button onClick={this.hideConfirmDialog}>No</Button>
              </div>
            }
            {userState.successMsg && !userState.isFetching &&
              <Button onClick={this.hideConfirmDialog}>Close</Button>
            }
          </Modal.Footer>
        </Modal>

      </div>
    );
  }
}
