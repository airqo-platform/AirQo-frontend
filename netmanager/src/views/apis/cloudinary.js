import axios from "axios";

// we create new instance to avoid axios interceptors on the main instance
const axiosInstance = axios.create();

const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_NAME}`;

export const cloudinaryImageUpload = async (formData) => {
  return await axiosInstance
    .post(`${cloudinaryUrl}/image/upload`, formData)
    .then((response) => response.data);
};
