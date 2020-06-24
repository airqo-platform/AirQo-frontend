/* eslint-disable */
import { connect } from "react-redux";
import * as incidentActions from "../../../../../redux/IncidentReport/actions";

import DeviceManagement from "views/components/DataDisplay/DeviceManagement";

// map state from store to props
const mapStateToProps = (state, ownProps) => {
    return {
        mappedAlerts: state.alerts,
        mappedIssues: state.issues,
        mappedAuth: state.auth,
        mappedErrors: state.errors,
        mappedDefaults: state.mapDefaults,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchAlerts: () => dispatch(incidentActions.fetchAlerts()),
        fetchIssues: () => dispatch(incidentActions.fetchIssues()),
    };
};

const containerCreator = connect(mapStateToProps, mapDispatchToProps);

const connectedDeviceManagement = containerCreator(DeviceManagement);

export { connectedDeviceManagement };