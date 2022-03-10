import React, { useState, useEffect } from "react";
import { ChartContainer } from "views/charts";
import { QRCodeApi } from "views/apis/deviceRegistry";
import QRCode from "qrcode.react";
import { isEmpty, omit, pick } from "underscore";

const DeviceQRCode = ({ deviceData, fromDeviceData }) => {
  const [src, setSrc] = useState("");
  useEffect(() => {
    if (!isEmpty(deviceData)) {
      QRCodeApi({ id: deviceData._id, include_site: "no" }).then((resData) => {
        setSrc(resData.data);
      });
    }
  }, []);

  return (
    <ChartContainer title={"device QR Code"} green centerItems>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        {!fromDeviceData && isEmpty(deviceData) && <span>Loading...</span>}
        {src && (
          <img alt="device qr code" src={src} height={"80%"} width={"auto"} />
        )}
        {fromDeviceData && !isEmpty(deviceData) && (
          <QRCode
            value={JSON.stringify(
              pick(deviceData, "name", "long_name", "latitude", "longitude")
            )}
            renderAs="svg"
            size={256}
          />
        )}
      </div>
    </ChartContainer>
  );
};

export default DeviceQRCode;
