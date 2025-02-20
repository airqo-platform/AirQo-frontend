//we will use this to delete the Authorization header for our axios requests
//depending on whether the user is logged in or not
import jwt_decode from 'jwt-decode';

const setAuthToken = (token) => {
  if (token) {
    const decoded_token = jwt_decode(token);
    const tenant = decoded_token.organization;

    if (typeof tenant === 'undefined') {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('currentUser');
      throw new Error(
        "This user's organization could not be determined, Please refresh to login again"
      );
    }
  }
};
export default setAuthToken;
