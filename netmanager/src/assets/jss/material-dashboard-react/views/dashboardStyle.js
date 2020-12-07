import {
  successColor,
  whiteColor,
  grayColor,
  hexToRgb,
} from "assets/jss/material-dashboard-react.js";

const dashboardStyle = {
  successText: {
    color: successColor[0],
  },
  upArrowCardCategory: {
    width: "16px",
    height: "16px",
  },
  stats: {
    color: grayColor[0],
    display: "inline-flex",
    fontSize: "12px",
    lineHeight: "22px",
    marginLeft: "5px",
    "& svg": {
      top: "4px",
      width: "16px",
      height: "16px",
      position: "relative",
      marginRight: "3px",
      marginLeft: "3px",
    },
    "& .fab,& .fas,& .far,& .fal,& .material-icons": {
      top: "4px",
      fontSize: "16px",
      position: "relative",
      marginRight: "3px",
      marginLeft: "3px",
    },
  },
  cardCategory: {
    color: grayColor[0],
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    paddingTop: "10px",
    marginBottom: "0",
  },
  cardCategoryWhite: {
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0",
  },
  cardTitle: {
    // width:  "50%",
    color: grayColor[2],
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: grayColor[1],
      fontWeight: "400",
      lineHeight: "1",
    },
    border: "1px solid yellow",
  },
  itemContainer: {
    margin: "20px 0",
    width: "31%",
    height: "495px",
    overflow: "scroll",
  },
  cardTitleWhite: {
    color: whiteColor,
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: grayColor[1],
      fontWeight: "400",
      lineHeight: "1",
    },
  },
  cardTitleBlue: {
    color: whiteColor,
    backgroundColor: "#2f67e2",
    position: "sticky",
    top: 0,
    zIndex: 20,
    padding: "10px",
    borderRadius: "5px 5px 0 0",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: grayColor[1],
      fontWeight: "400",
      lineHeight: "1",
    },
  },
  cardTitleGreen: {
    color: whiteColor,
    backgroundColor: "#22b0c5",
    position: "sticky",
    top: 0,
    zIndex: 20,
    padding: "10px",
    borderRadius: "5px 5px 0 0",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: grayColor[1],
      fontWeight: "400",
      lineHeight: "1",
    },
  },
  cardBody: {
    minHeight: "430px",
    margin: 0,
  },

  leafletMarkerIcon: {
    color: "#000",
    fontSize: "12px",
    fontWeight: "700",
    lineHeight: "35px",
    textAlign: "center",
    verticalAlign: "bottom",
    boxShadow: "2px 1px 4px rgba(0,0,0,0.2)",
    borderRadius: "30px",
    borderWidth: "3px",
    opacity: "1",
  },

  pm25Good: {
    background: "#45e50d",
    border: "2px solid #45e50d",
    backgroundColor: "#45e50d !important",
  },

  pm25Moderate: {
    background: "#f8fe28 !important",
    border: "2px solid #f8fe28",
  },

  pm25UH4SG: {
    background: "#ee8310 !important",
    border: "2px solid #ee8310",
  },

  pm25UnHealthy: {
    background: "#fe0000 !important",
    border: "2px solid #fe0000",
  },

  pm25VeryUnHealthy: {
    background: "#8639c0 !important",
    border: "2px solid #8639c0",
  },

  pm25Harzadous: {
    background: "#81202e !important",
    border: "2px solid #81202e",
  },

  pm25UnCategorised: {
    background: "#808080",
    border: "2px solid #808080",
  },
};

export default dashboardStyle;
