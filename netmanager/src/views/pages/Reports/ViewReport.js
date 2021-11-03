import React from "react";
import { useParams } from "react-router-dom";

const ViewReport = () => {
  const { id } = useParams();
  return <div>view report {id}</div>;
};

export default ViewReport;
