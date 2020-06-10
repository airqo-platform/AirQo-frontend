import React, { Component } from 'react';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField
} from '@material-ui/core';
import UpdateIcon from '@material-ui/icons/Update';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SaveIcon from '@material-ui/icons/Save';
import FolderIcon from '@material-ui/icons/Folder';
import Tooltip from '@material-ui/core/Tooltip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import DialogTitle from '@material-ui/core/DialogTitle';
import Avatar from '@material-ui/core/Avatar';
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionIcon from '@material-ui/icons/Description';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../../assets/scss/report.css';
import axios from 'axios';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      user_id: this.props.user_id,
      openPrevSaved: false,
      isDraftSelected: false,
      openSave: false,
      openConfirm: false,
      saved_report: [],
      report_name: '',
      report_body_default: {},
      report_name_default: '',
      response_msg: ''
    };
    // bind to this
    this.handlePrevSavedOpen = this.handlePrevSavedOpen.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
    this.handleSaveClose = this.handleSaveClose.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.handleConfirmClose = this.handleConfirmClose.bind(this);
    this.handlePrevSavedClose = this.handlePrevSavedClose.bind(this);
    this.onDraftReportSelected = this.onDraftReportSelected.bind(this);
    this.onDraftDelete = this.onDraftDelete.bind(this);
    this.onUpdateDraft = this.onUpdateDraft.bind(this);
    this.onUpdateDraftCancel = this.onUpdateDraftCancel.bind(this);
  }

  onEditorStateChange = editorState => {
    // console.log(editorState)
    this.setState({
      editorState
    });
  };

  componentDidMount() {
    // local: http://127.0.0.1:4000
    axios
      .get(
        'https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/report/get_default_report_template'
      )
      //.get("http://127.0.0.1:5000/api/v1/report/get_default_report_template")
      .then(res => {
        let result = res.data[0];
        this.setState({
          editorState: EditorState.createWithContent(
            convertFromRaw(JSON.parse(JSON.stringify(result.report_body)))
          )
        });
        //console.log(result.report_body);
        this.setState({ report_body_default: result.report_body });
        this.setState({ report_name_default: result.report_name });
      })
      .catch(e => {
        console.log(e);
      });
  }

  uploadImageCallBack = file => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest(); // eslint-disable-line no-undef
      xhr.open('POST', 'https://api.imgur.com/3/image');
      xhr.setRequestHeader('Authorization', 'Client-ID 8d26ccd12712fca');
      const data = new FormData(); // eslint-disable-line no-undef
      data.append('image', file);
      xhr.send(data);
      xhr.addEventListener('load', () => {
        const response = JSON.parse(xhr.responseText);
        resolve(response);
      });
      xhr.addEventListener('error', () => {
        const error = JSON.parse(xhr.responseText);
        reject(error);
      });
    });
  };

  // save monthly report
  saveReport = () => {
    // hide the save draft report dialog
    this.setState({ openSave: false });
    // get status of the report
    let report_body = convertToRaw(this.state.editorState.getCurrentContent());

    console.log(this.state.report_name, report_body);

    // make api call to save report
    axios
      .post(
        'https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/report/save_monthly_report',
        //"http://127.0.0.1:5000/api/v1/report/save_monthly_report",
        {
          user_id: this.state.user_id,
          report_name: this.state.report_name,
          report_body: report_body
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      .then(res => {
        console.log(res);
        this.setState({ response_msg: res.data.message });
        this.setState({ openConfirm: true }); //
      })
      .catch(e => console.log(e));
  };

  // This deals with save report dialog box
  handleSaveClick = () => {
    this.setState({ openSave: true });
  };
  handleSaveClose = () => {
    this.setState({ openSave: false });
  };
  // hooks the monthly report textfield input
  changeHandler = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  // Handles saved report confirmation feedback
  handleConfirmClose = () => {
    this.setState({ openConfirm: false });
    this.setState({ openPrevSaved: false });
  };

  // load previously saved report
  handlePrevSavedOpen = () => {
    axios
      .get(
        'https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/report/get_monthly_report/' +
          //"http://127.0.0.1:5000/api/v1/report/get_monthly_report/" +
          this.state.user_id
      )
      .then(res => {
        this.setState({ saved_report: res.data });
        console.log(res.data);
        //console.log(this.state, "current user: ", this.props.auth.user._id);
      })
      .catch(e => {
        console.log(e);
      });
    this.setState({ openPrevSaved: true });
  };

  handlePrevSavedClose = () => {
    this.setState({ openPrevSaved: false });
  };

  // renders content of selected draft report
  onDraftReportSelected = (report_name, report_body) => {
    this.setState({
      editorState: EditorState.createWithContent(
        convertFromRaw(JSON.parse(JSON.stringify(report_body)))
      )
    });
    this.setState({ isDraftSelected: true });
    this.setState({ report_name: report_name });
    //this.setState({ report_body: report_body });
    this.setState({ openPrevSaved: false });
  };

  // permanently deletes draft report template from the database
  onDraftDelete = (report_id, report_name) => {
    // make api call to save report
    axios
      .delete(
        'https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/report/delete_monthly_report/' +
          report_name
      )
      .then(res => {
        console.log(res.data);
        this.setState({ response_msg: res.data.message });
        this.setState({ openConfirm: true }); //
      })
      .catch(e => console.log(e));

    // after success delete, return to default report template
    this.setState({
      editorState: EditorState.createWithContent(
        convertFromRaw(
          JSON.parse(JSON.stringify(this.state.report_body_default))
        )
      )
    });

    this.setState({ isDraftSelected: false });
  };

  // handle updating draft report
  onUpdateDraft = () => {
    axios
      .post(
        'https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/report/update_monthly_report/' +
          this.state.report_name,
        {
          report_body: convertToRaw(this.state.editorState.getCurrentContent())
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      .then(res => {
        console.log(res.data);
        this.setState({ response_msg: res.data.message });
        this.setState({ openConfirm: true }); //
      })
      .catch(e => console.log(e));
  };

  //handle cancellation of report update
  onUpdateDraftCancel = () => {
    this.setState({
      editorState: EditorState.createWithContent(
        convertFromRaw(
          JSON.parse(JSON.stringify(this.state.report_body_default))
        )
      )
    });

    this.setState({ isDraftSelected: false });
    //this.setState({ report_body: this.state.report_body_default });
  };

  render() {
    const { editorState } = this.state;
    const editor = {
      height: 'auto',
      width: '210mm',
      margin: '0 auto',
      textAlign: 'justify'
    };
    const delete_report = {
      paddingLeft: '3em',
      color: 'red',
      display: 'block'
    };
    console.log(this.state.user_id);

    return (
      <div>
        {!this.state.isDraftSelected && (
          <div>
            <Tooltip title="Save draft report" placement="right" arrow>
              <Button
                color="primary"
                variant="contained"
                endIcon={<SaveIcon />}
                onClick={this.handleSaveClick}
                className="print">
                <style>{'@media print {.print{display: none;}}'}</style>
                {/* save draft */}
              </Button>
            </Tooltip>
          </div>
        )}
        {this.state.isDraftSelected && (
          <div>
            <Tooltip title="Update draft report" placement="right" arrow>
              <Button
                color="primary"
                variant="contained"
                endIcon={<UpdateIcon />}
                onClick={this.onUpdateDraft}
                className="print">
                <style>{'@media print {.print{display: none;}}'}</style>
                {/* Load Draft */}
              </Button>
            </Tooltip>
          </div>
        )}
        {this.state.isDraftSelected && (
          <div>
            <Tooltip title="Go back to default report" placement="right" arrow>
              <Button
                color="primary"
                variant="contained"
                endIcon={<ArrowBackIcon />}
                onClick={this.onUpdateDraftCancel}
                className="print">
                <style>{'@media print {.print{display: none;}}'}</style>
                {/* Load Draft */}
              </Button>
            </Tooltip>
          </div>
        )}
        <div>
          <Tooltip title="Open previous report" placement="right" arrow>
            <Button
              color="primary"
              variant="contained"
              endIcon={<FolderIcon />}
              onClick={this.handlePrevSavedOpen}
              className="print">
              <style>{'@media print {.print{display: none;}}'}</style>
              {/* Load Draft */}
            </Button>
          </Tooltip>
        </div>

        <div style={editor}>
          <Editor
            editorState={editorState}
            onEditorStateChange={this.onEditorStateChange}
            toolbarClassName="hidden-on-print"
            toolbar={{
              inline: { inDropdown: true, className: 'hidden-on-print' },
              list: { inDropdown: true },
              textAlign: { inDropdown: true },
              link: { inDropdown: true },
              history: { inDropdown: true },
              image: {
                uploadCallback: this.uploadImageCallBack.bind(this),
                alt: { present: false, mandatory: false },
                previewImage: true
              }
            }}
          />
          <style>{'@media print {.hidden-on-print{display: none;}}'}</style>
        </div>
        <div>
          {/* Dialog for report */}
          <Dialog
            open={this.state.openSave}
            onClose={this.handleSaveClose}
            aria-labelledby="form-dialog-title">
            <DialogContent>
              <DialogContentText>
                To save this report, please enter the name in the text field
                below.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                name="report_name"
                value={this.state.report_name}
                onChange={this.changeHandler}
                label="Save As"
                type="text"
                placeholder="analytic_report_001"
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleSaveClose} color="primary">
                Cancel
              </Button>
              <Button onClick={this.saveReport} color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog for confirming saved report  */}
          <Dialog
            open={this.state.openConfirm}
            onClose={this.handleConfirmClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {this.state.response_msg}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleConfirmClose} color="primary">
                OK
              </Button>
            </DialogActions>
          </Dialog>

          {/* Previously saved */}
          <Dialog
            open={this.state.openPrevSaved}
            onClose={this.handlePrevSavedClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="simple-dialog-title">
              Open draft report
            </DialogTitle>

            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                <List>
                  {this.state.saved_report != null ? (
                    this.state.saved_report.map(s => (
                      <div>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <DescriptionIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <a
                            key={s._id}
                            href="#"
                            onClick={this.onDraftReportSelected.bind(
                              this,
                              s.report_name,
                              s.report_body
                            )}>
                            <ListItemText
                              primary={s.report_name}
                              secondary={s.report_date}
                            />
                          </a>
                          <a
                            href="#"
                            style={delete_report}
                            onClick={this.onDraftDelete.bind(
                              this,
                              s._id,
                              s.report_name
                            )}>
                            <DeleteIcon />
                          </a>
                        </ListItem>
                      </div>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <DescriptionIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="No draft report found"
                        secondary="Empty Collection"
                      />
                    </ListItem>
                  )}
                </List>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handlePrevSavedClose} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    );
  }
}

export default Main;
