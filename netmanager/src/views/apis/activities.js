import axios from "axios";
import { CURRENT_AIRQLOUD_KEY } from "../../config/localStorageKeys";
import { GET_ACCESS_TOKEN } from "../../config/urls/authService";

export const postData = async () => {
  const url = "https://staging-platform.airqo.net/api/v2/devices/activities/maintain"; // Replace with your actual endpoint
  
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

    const response = await axios.post(url, formData);
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

