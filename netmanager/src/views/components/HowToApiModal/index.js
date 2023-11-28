import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core';

const HowToApiModal = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} style={{ padding: '20px' }}>
      <DialogTitle>How to the API</DialogTitle>
      <DialogContent>
        <ol>
          <li>To use an API, you'll need to add an access token</li>
          <li>Go to the Settings page.</li>
          <li>Find the Client section and create a registered client if you don't have one yet.</li>
          <li>Click on the "Generate Token" button.</li>
          <li>Copy the generated API token.</li>
          <li>
            Paste the API token in your API requests. For example:
            <br />
            <span
              style={{
                backgroundColor: '#f0f0f0',
                padding: '5px',
                borderRadius: '5px',
                fontFamily: 'monospace'
              }}
            >
              https://example.com/api/v2/devices?token=YOUR_API_TOKEN
            </span>
          </li>
        </ol>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HowToApiModal;
