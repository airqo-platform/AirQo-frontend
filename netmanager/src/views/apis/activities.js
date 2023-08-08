import axios from "axios";
import { CURRENT_AIRQLOUD_KEY } from "../../config/localStorageKeys";
import { 
  recallDeviceApi, 
  deployDeviceApi,
  addMaintenanceLogApi
} from "./deviceRegistry";

export const recallPostData = async () => {
  try {
    const storedData = localStorage.getItem(CURRENT_AIRQLOUD_KEY);
    if (!storedData) {
      console.error("Error: No data found in local storage");
      return;
    }

    const parsedData = JSON.parse(storedData);

    const formData = {
      userName: parsedData.userName,
      email: parsedData.email,
      firstName: parsedData.firstName,
      lastName: parsedData.lastName,
    };

    const response = await axios.post(recallDeviceApi(parsedData.deviceName), formData); 
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

export const maintainPostData = async () => {
  try {
    const storedData = localStorage.getItem(CURRENT_AIRQLOUD_KEY);
    if (!storedData) {
      console.error("Error: No data found in local storage");
      return;
    }

    const parsedData = JSON.parse(storedData);

    const formData = {
      userName: parsedData.userName,
      email: parsedData.email,
      firstName: parsedData.firstName,
      lastName: parsedData.lastName,
    };

    const response = await axios.post(addMaintenanceLogApi(parsedData.deviceName), formData); 
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

export const deployPostData = async () => {
  try {
    const storedData = localStorage.getItem(CURRENT_AIRQLOUD_KEY);
    if (!storedData) {
      console.error("Error: No data found in local storage");
      return;
    }

    const parsedData = JSON.parse(storedData);

    const formData = {
      userName: parsedData.userName,
      email: parsedData.email,
      firstName: parsedData.firstName,
      lastName: parsedData.lastName,
    };

    const response = await axios.post(deployDeviceApi(parsedData.deviceName), formData); 
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

