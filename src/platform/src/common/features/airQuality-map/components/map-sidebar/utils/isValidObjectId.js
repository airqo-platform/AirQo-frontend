const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
export default (id) => OBJECT_ID_REGEX.test(id);
