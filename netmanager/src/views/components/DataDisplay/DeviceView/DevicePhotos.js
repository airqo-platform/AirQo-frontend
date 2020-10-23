import React from 'react';

const styles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "79vh",
}

const spanStyles = {
    color: "grey",
    fontSize: "50px",
    textTransform: "capitalize",
    padding: "40px",
    border: "1px dotted grey"
}

export const DevicePhotos = () => {
    return (
        <div style={styles}>
            <span style={spanStyles}>coming soon...</span>
        </div>
    )
};
