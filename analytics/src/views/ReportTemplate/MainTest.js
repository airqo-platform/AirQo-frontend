import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Divider, Drawer, Button, Grid } from '@material-ui/core';
import PictureAsPdfSharpIcon from '@material-ui/icons/PictureAsPdfSharp';
import SaveIcon from '@material-ui/icons/Save';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

import Pdf from 'react-to-pdf';

import { Card, CardContent } from '@material-ui/core';
import InsertChartIcon from '@material-ui/icons/InsertChartOutlined';
import ReactToPrint from 'react-to-print';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      setOpen: false
    };
    this.ref = React.createRef();
  }

  render() {
    const styles = {
      root: {
        height: '100%',
        fontFamily: 'Helvetica Neue',
        lineHeight: '1.5em'
      },
      content: {
        alignItems: 'center',
        display: 'flex'
      },
      title: {
        fontWeight: 700,
        textAlign: 'center',
        lineHeight: '3em'
      },
      icon: {
        height: 32,
        width: 32
      },
      progress: {
        marginTop: '1em'
      },
      divider: {
        margin: '1em 0em'
      },
      picarea: {
        width: 300,
        height: 150,
        margin: 'auto 0',
        border: '1px dotted #888'
      },
      load_draft: {
        width: 'auto',
        margin: 'auto'
      }
    };

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    const d = new Date();

    const handleOpen = () => {
      this.setState({ setOpen: true });
    };

    const handleClose = () => {
      this.setState({ setOpen: false });
    };
    function ListItemLink(props) {
      return <ListItem
        button
        component="a"
        {...props}
             />;
    }

    return (
      <div>
        <div>
          <Button
            color="primary"
            variant="outlined"
            endIcon={<SaveIcon />}
            onClick=""
            className="contacts"
          >
            <style>{'@media print {.contacts{display: none;}}'}</style>
            Save Draft
          </Button>
        </div>
        <div>
          <Button
            color="primary"
            variant="outlined"
            endIcon={<CloudDownloadIcon />}
            onClick={handleOpen}
            className="contacts"
          >
            <style>{'@media print {.contacts{display: none;}}'}</style>
            Load Draft
          </Button>
        </div>
        <CardContent>
          <div
            ref={this.ref}
            style={{
              width: '210mm',
              margin: '0 auto',
              textAlign: 'justify'
            }}
          >
            <h1 style={styles.title}>KCCA MONTHLY AIR QUALITY REPORT</h1>
            <h3 style={styles.title}>
              {monthNames[d.getMonth()]}, {d.getFullYear()}{' '}
            </h3>
            <Divider style={styles.divider} />
            <p>
              Welcome to the KCCA Air Quality Report for the month of{' '}
              {monthNames[d.getMonth()]}, {d.getFullYear()}. This report is
              generated monthly by the Directorate of Air Quality and is
              intended to provide an insight into the changes in air quality
              across the city and in specific locations and explore their
              possible causes and consequences.
            </p>
            <div style={styles.progress} />
            <p>
              KCCA has over 25 air quality and weather monitoring devices across
              the city and in partnership with AirQo and US EMbassy access to
              many more sources of air quality data.
            </p>
            <h3 style={styles.progress}>
              Citywide air quality trends over the month{' '}
            </h3>
            <div style={styles.progress} />
            <p>
              As we make the transition to the wet season we have had an
              increase in air quality across the city. We have also seen
              improvements as a result of the lockdown wich have again improved
            </p>
            <h3>District by district variation over the month</h3>
            <div style={styles.picarea} />
            <p>
              The ongoing roadworks that have taken place in Kawempe mean that
              this is somewhat higher than the other districts. This can be seen
              in the following chart for the second week where a significant
              difference change is seen on device 21
            </p>
            <h3 style={styles.progress}>Story of the week</h3>
            <p>
              Vestibulum ac diam sit amet quam vehicula elementum sed sit amet
              dui. Vestibulum ante ipsum primis in faucibus orci luctus et
              ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet
              aliquam vel, ullamcorper sit amet ligula. Vestibulum ante ipsum
              primis in faucibus orci luctus et ultrices posuere cubilia Curae;
              Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit
              amet ligula. Lorem ipsum dolor sit amet, consectetur adipiscing
              elit. Curabitur aliquet quam id dui posuere blandit. Donec
              sollicitudin molestie malesuada. Praesent sapien massa, convallis
              a pellentesque nec, egestas non nisi.
            </p>
            <table>
              <tr>
                <td>
                  {' '}
                  <p style={{ marginRight: '1em' }}>
                    Vestibulum ac diam sit amet quam vehicula elementum sed sit
                    amet dui. Vestibulum ante ipsum primis in faucibus orci
                    luctus et ultrices posuere cubilia Curae; Donec velit neque,
                    auctor sit amet aliquam vel, ullamcorper sit amet ligula.
                    Vestibulum ante ipsum primis in faucibus orci luctus et
                    ultrices posuere cubilia Curae; Donec velit neque, auctor
                    sit amet aliquam vel, ullamcorper sit amet ligula. Lorem
                    ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
                    aliquet quam id dui posuere blandit. Donec sollicitudin
                    molestie malesuada. Praesent sapien massa, convallis a
                    pellentesque nec, egestas non nisi.
                  </p>
                </td>
                <td>
                  <div style={styles.picarea} />
                </td>
              </tr>
            </table>
            <Button
              color="primary"
              variant="outlined"
              style={styles.progress}
            >
              Join us next month for more of the same
            </Button>
          </div>
        </CardContent>
        <Dialog
          open={this.state.setOpen}
          onClose={handleClose}
          style={styles.load_draft}
        >
          <DialogTitle>Draft Templates</DialogTitle>
          <DialogContent>
            <List
              component="nav"
              aria-label="secondary mailbox folders"
            >
              <ListItem button>
                <ListItemText primary="air-quality-report-04-2020-v1" />
              </ListItem>
              <ListItemLink href="#simple-list">
                <ListItemText primary="air-quality-report-04-2020-v2" />
              </ListItemLink>
            </List>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              variant="contained"
              onClick={handleClose}
              color="primary"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default Main;
