import React, { useState, useEffect } from "react";
import { ChartContainer } from "views/charts";
import { QRCodeApi } from "views/apis/deviceRegistry";
import { isEmpty } from "underscore";

const DeviceQRCode = ({ deviceData }) => {
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
        {!src && <span>Loading...</span>}
        {src && <img alt="device qr code" src={src} height={"80%"} width={"auto"} />}
      </div>
    </ChartContainer>
  );
};

export default DeviceQRCode;
