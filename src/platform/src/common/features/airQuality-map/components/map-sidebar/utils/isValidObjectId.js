const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const isValidObjectId = (id) => OBJECT_ID_REGEX.test(id);

export default isValidObjectId;
