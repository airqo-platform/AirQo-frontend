const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_NAME}`;

export const cloudinaryImageUpload = async (formData) => {
  return await fetch(`${cloudinaryUrl}/image/upload`, {
    method: "POST",
    body: formData,
  }).then((response) => response.json());
};
