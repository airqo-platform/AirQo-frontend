import React, { useState } from "react";
import { useDispatch } from "react-redux";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Paper from "@material-ui/core/Paper";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import { Button, Grid } from "@material-ui/core";
import { isEqual } from "underscore";
import { updateMainAlert } from "redux/MainAlert/operations";
import { updateDeviceDetails } from "../../../apis/deviceRegistry";

const gridItemStyle = {
    padding: "5px"
}

export default function DeviceEdit({ deviceData }) {

    const dispatch = useDispatch();
    const [editData, setEditData] = useState(deviceData);
    const [editLoading, setEditLoading] = useState(false);
    const handleTextFieldChange = (event) => {
        setEditData({
            ...editData,
            [event.target.id]: event.target.value,
        })
    }

    const handleSelectFieldChange = (id) => (event) => {
        setEditData({
            ...editData,
            [id]: event.target.value,
        })
    }

    const handleEditSubmit = async () => {
        setEditLoading(true);
        await updateDeviceDetails(deviceData.name, editData)
            .then(responseData => {
                dispatch(updateMainAlert({
                    message: responseData.message,
                    show: true,
                    severity: "success"
                }))
            })
            .catch(err => {
                dispatch(updateMainAlert({
                    message: err.response.data.message,
                    show: true,
                    severity: "error"
                }))
            });
        setEditLoading(false);
    }

    const weightedBool = (primary, secondary) => {
        if (primary) {
            return primary;
        }
        return secondary;
    }
    return (
        <div>
            <Paper style={{ margin: "0 auto", minHeight: "400px", padding: "20px 20px", maxWidth: "1500px"}}>
                <Grid container spacing={1}>
                    <Grid items xs={6} style={gridItemStyle}>
                        <TextField
                            required
                            id="name"
                            label="Device Name"
                            value={editData.name}
                            fullWidth
                            disabled
                            onChange={handleTextFieldChange}
                            InputProps={{
                              readOnly: true,
                            }}
                        />
                    </Grid>
                    <Grid items xs={6} style={gridItemStyle}>
                        <TextField
                            id="owner"
                            label="Owner"
                            value={editData.owner}
                            onChange={handleTextFieldChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid items xs={6} style={gridItemStyle}>
                        <TextField
                            id="description"
                            label="Description"
                            value={editData.description}
                            onChange={handleTextFieldChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid items xs={6} style={gridItemStyle}>
                        <TextField
                            id="device_manufacturer"
                            label="Manufacturer"
                            value={editData.device_manufacturer}
                            onChange={handleTextFieldChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid items xs={6} style={gridItemStyle}>
                        <TextField
                            id="latitude"
                            label="Latitude"
                            value={editData.latitude}
                            onChange={handleTextFieldChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid items xs={6} style={gridItemStyle}>
                        <TextField
                            id="product_name"
                            label="Product Name"
                            value={editData.product_name}
                            onChange={handleTextFieldChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid items xs={6} style={gridItemStyle}>
                        <TextField
                            id="longitude"
                            label="Longitude"
                            value={editData.longitude}
                            onChange={handleTextFieldChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid items xs={6} style={gridItemStyle}>
                         <TextField
                            id="phoneNumber"
                            label="Phone Number"
                            value={editData.phoneNumber}
                            onChange={handleTextFieldChange}
                            fullWidth
                         />
                    </Grid>
                    <Grid items xs={6} style={gridItemStyle}>
                        <FormControl
                            required
                            fullWidth
                        >
                            <InputLabel htmlFor="demo-dialog-native">
                              Data Access
                            </InputLabel>
                            <Select
                              native
                              value={editData.visibility}
                              onChange={handleSelectFieldChange("visibility")}
                              inputProps={{
                                native: true,
                                style: {height: "40px", marginTop: "10px", border: "1px solid red"},
                              }}
                              input={<Input id="demo-dialog-native" />}
                            >
                              <option aria-label="None" value="" />
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid items xs={6} style={gridItemStyle}>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="demo-dialog-native">
                              Internet Service Provider
                            </InputLabel>
                            <Select
                              native
                              value={editData.ISP}
                              onChange={handleSelectFieldChange("ISP")}
                              inputProps={{
                                native: true,
                                style: {height: "40px", marginTop: "10px"},
                              }}
                              input={<Input id="demo-dialog-native" />}
                            >
                              <option aria-label="None" value="" />
                              <option value="MTN">MTN</option>
                              <option value="Africell">Africell</option>
                              <option value="Airtel">Airtel</option>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid
                      container
                      alignItems="flex-end"
                      alignContent="flex-end"
                      justify="flex-end"
                      xs={12}
                      style={{margin: "10px 0"}}
                      >

                          <Button
                            variant="contained"
                            onClick={() => setEditData(deviceData)}
                          >
                            Cancel
                          </Button>

                          <Button
                            variant="contained"
                            color="primary"
                            disabled={weightedBool(editLoading, isEqual(deviceData, editData))}
                            onClick={handleEditSubmit}
                            style={{ marginLeft: "10px" }}
                          >
                            Edit device
                          </Button>
                      </Grid>

                </Grid>
            </Paper>
        </div>
    );
};
