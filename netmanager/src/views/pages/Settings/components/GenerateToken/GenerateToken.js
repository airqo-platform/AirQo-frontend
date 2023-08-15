import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Button,
  TextField,
  InputAdornment,
  IconButton
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { CircularLoader } from 'views/components/Loader/CircularLoader';
import PropTypes from 'prop-types';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CloseIcon from '@material-ui/icons/Close';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import { generateAccessTokenForUserApi } from '../../../../apis/accessControl';

const GenerateToken = (props) => {
  const { className, mappedAuth, ...rest } = props;

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [showTokenInput, setShowTokenInput] = useState(true);

  useEffect(() => {
    if (apiResponse) {
      setTimeout(() => setApiResponse(null), 1500);
    }
  }, [apiResponse]);

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClose = () => {
    setShowTokenInput(false);
  };

  const { user } = mappedAuth;

  const generateToken = async () => {
    setLoading(true);
    try {
      const response = await generateAccessTokenForUserApi(user._id);
      setToken(response.created_token.token);
      setApiResponse('Token created successfully!');
      setShowTokenInput(true);
    } catch (error) {
      console.error(error);
      setApiResponse('An error occurred while creating the token.');
    }
    setLoading(false);
  };

  return (
    <Card
      style={{
        margin: '30px 0'
      }}>
      <CardHeader subheader="Generate an access token" title="Access Token" />
      {apiResponse && <Alert severity={token ? 'success' : 'error'}>{apiResponse}</Alert>}
      {showTokenInput && token && (
        <>
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              label="Access Token"
              id="access-token"
              type="text"
              variant="outlined"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleCopy}>
                      <FileCopyIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            {copied && (
              <Alert severity="success" style={{ marginTop: '10px' }}>
                Copied to clipboard!
              </Alert>
            )}
          </CardContent>
        </>
      )}

      <Divider />

      <CardActions>
        {!loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%'
            }}>
            <Button color="primary" variant="outlined" onClick={generateToken}>
              Generate Token
            </Button>
            {showTokenInput && token && (
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            )}
          </div>
        ) : (
          <div
            style={{
              width: '150px',
              display: 'flex',
              justifyContent: 'center'
            }}>
            <CircularLoader loading={loading} />
          </div>
        )}
      </CardActions>
    </Card>
  );
};

GenerateToken.propTypes = {
  className: PropTypes.string,
  mappedAuth: PropTypes.object.isRequired,
  mappeduserState: PropTypes.object.isRequired
};

export default usersStateConnector(GenerateToken);
