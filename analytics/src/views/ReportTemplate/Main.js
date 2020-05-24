import React, { Component } from "react";
import { render } from "react-dom";
import {
  EditorState,
  convertFromRaw,
  convertToRaw,
  ContentState,
  convertFromHTML,
} from "draft-js";
import { Divider, Drawer, Button, Grid } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "../../assets/scss/report.css";
import axios from "axios";

// function uploadImageCallBack(file) {
//   return new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest();
//     xhr.open("POST", "https://api.imgur.com/3/image");
//     xhr.setRequestHeader("Authorization", "Client-ID XXXXX");
//     const data = new FormData();
//     data.append("image", file);
//     xhr.send(data);
//     xhr.addEventListener("load", () => {
//       const response = JSON.parse(xhr.responseText);
//       resolve(response);
//     });
//     xhr.addEventListener("error", () => {
//       const error = JSON.parse(xhr.responseText);
//       reject(error);
//     });
//   });
// }

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
    };
  }

  onEditorStateChange = (editorState) => {
    // console.log(editorState)
    this.setState({
      editorState,
    });
  };

  componentDidMount() {
    axios
      .get("127.0.0.1:4000/api/v1/report/get_default_report_template")
      .then(console.log(response.data))
      .catch();
  }

  uploadImageCallBack = (file) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest(); // eslint-disable-line no-undef
      xhr.open("POST", "https://api.imgur.com/3/image");
      xhr.setRequestHeader("Authorization", "Client-ID 8d26ccd12712fca");
      const data = new FormData(); // eslint-disable-line no-undef
      data.append("image", file);
      xhr.send(data);
      xhr.addEventListener("load", () => {
        const response = JSON.parse(xhr.responseText);
        resolve(response);
      });
      xhr.addEventListener("error", () => {
        const error = JSON.parse(xhr.responseText);
        reject(error);
      });
    });
  };

  render() {
    const { editorState } = this.state;
    const editor = {
      height: "auto",
      width: "210mm",
      margin: "0 auto",
      textAlign: "justify",
    };

    const rawState = JSON.stringify(
      convertToRaw(editorState.getCurrentContent())
    );
    console.log(rawState);
    return (
      <>
        <div>
          <Button
            color="primary"
            variant="contained"
            endIcon={<SaveIcon />}
            onClick=""
            className="print"
          >
            <style>{"@media print {.print{display: none;}}"}</style>
            {/* Save Draft */}
          </Button>
        </div>
        <div>
          <Button
            color="primary"
            variant="contained"
            endIcon={<CloudDownloadIcon />}
            onClick=""
            className="print"
          >
            <style>{"@media print {.print{display: none;}}"}</style>
            {/* Load Draft */}
          </Button>
        </div>
        <div style={editor}>
          <Editor
            editorState={editorState}
            onEditorStateChange={this.onEditorStateChange}
            toolbarClassName="hidden-on-print"
            toolbar={{
              inline: { inDropdown: true, className: "hidden-on-print" },
              list: { inDropdown: true },
              textAlign: { inDropdown: true },
              link: { inDropdown: true },
              history: { inDropdown: true },
              image: {
                uploadCallback: this.uploadImageCallBack.bind(this),
                alt: { present: false, mandatory: false },
                previewImage: true,
              },
            }}
          />
          <style>{"@media print {.hidden-on-print{display: none;}}"}</style>
        </div>
      </>
    );
  }
}

export default Main;
