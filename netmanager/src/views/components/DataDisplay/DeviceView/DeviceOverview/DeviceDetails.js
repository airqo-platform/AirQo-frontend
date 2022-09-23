import React, { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@material-ui/core";
import Copyable from "views/components/Copy/Copyable";
import { ChartContainer } from "views/charts";
import { decryptKeyApi } from "views/apis/deviceRegistry";
import { isEmpty } from "underscore";

const DeviceDetails = ({ deviceData }) => {
  const BLANK_PLACE_HOLDER = "-";
  const [readKey, setReadKey] = useState("");
  const [writeKey, setWriteKey] = useState("");

  const decryptKey = async (key, callback) => {
    return await decryptKeyApi(key).then((res) => {
      callback(res.decrypted_key || "Could not decrypt key");
    });
  };

  const deviceStatus = !deviceData.status
    ? deviceData.isActive === true
      ? "deployed"
      : "not deployed"
    : deviceData.status;

  useEffect(() => {
    if (!isEmpty(deviceData)) {
      decryptKey(deviceData.readKey, setReadKey);
      decryptKey(deviceData.writeKey, setWriteKey);
    }
  }, []);

  return (
    <ChartContainer title={"device details"} blue>
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="sticky table">
          <TableBody>
            <TableRow>
              <TableCell>
                <b>Name</b>
              </TableCell>
              <TableCell>
                {deviceData.long_name || BLANK_PLACE_HOLDER}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <b>Deployment status</b>
              </TableCell>
              <TableCell>
                <span
                  style={{
                    color: deviceStatus === "deployed" ? "green" : "red",
                    textTransform: "capitalize",
                  }}
                >
                  {deviceStatus}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <b>Device Number (Channel ID)</b>
              </TableCell>
              <TableCell>
                {deviceData.device_number || BLANK_PLACE_HOLDER}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <b>Longitude</b>
              </TableCell>
              <TableCell>
                {deviceData.longitude || BLANK_PLACE_HOLDER}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <b>Latitude</b>
              </TableCell>
              <TableCell>{deviceData.latitude || BLANK_PLACE_HOLDER}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <b>Owner</b>
              </TableCell>
              <TableCell>{deviceData.owner || BLANK_PLACE_HOLDER}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <b>Manufacturer</b>
              </TableCell>
              <TableCell>
                {deviceData.device_manufacturer || BLANK_PLACE_HOLDER}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <b>ISP</b>
              </TableCell>
              <TableCell>{deviceData.ISP || BLANK_PLACE_HOLDER}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <b>Phone Number</b>
              </TableCell>
              <TableCell>
                {(deviceData.phoneNumber && `0${deviceData.phoneNumber}`) ||
                  BLANK_PLACE_HOLDER}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <b>Read Key</b>
              </TableCell>
              <TableCell>
                <Copyable value={readKey || BLANK_PLACE_HOLDER} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <b>Write Key</b>
              </TableCell>
              <TableCell>
                <Copyable value={writeKey || BLANK_PLACE_HOLDER} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </ChartContainer>
  );
};

export default DeviceDetails;
