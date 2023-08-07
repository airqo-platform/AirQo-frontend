import axios from "axios";
const postData = async () => {
  const url = "https://staging-platform.airqo.net/api/v2/devices/activities/maintain"; // Replace with a more accurate endpoint
  const formData = {
    userName: "exampleUser",
    email: "example@example.com",
    firstName: "John",
    lastName: "Doe",
  };
  try {
    const response = await axios.post(url, formData);
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
};
export default postData;