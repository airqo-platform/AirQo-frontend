import React from 'react';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Link } from 'react-router-dom';
import PageMini from '../PageMini';
import { useInitScrollTop } from 'utils/customHooks';

const Register = () => {

    useInitScrollTop();
  
    return (
        <PageMini>
            <div className="GetInvolved">
                <div className="section-left">
                    <div className="content-wrapper">
                        <div className="section-nav">
                            <h5>Get Involved</h5>
                            <ArrowForwardIosIcon className="icon" />
                            <h5 style={{opacity:"0.5"}}>Researcher</h5>
                        </div>
                        <h1 className="section-title">“Research” efforts to close the air quality data in Africa.</h1>
                        <p className="content">Access real-time and historic air quality information across Africa through our easy-to-use air quality analytics dashboard</p>
                    </div>
                </div>
                <div className="form-section">
                    <div className="wrapper">
                        <form className="register-form">
                            <div className="form-field">
                                <label>First name</label>
                                <input type="text" id="fname" required/>
                            </div>
                            <div className="form-field">
                                <label>Last name</label>
                                <input type="text" id="lname" required/>
                            </div>
                            <div className="form-field">
                                <label>Email address</label>
                                <input type="email" id="email" required/>
                            </div>
                            <div className="input-field">
                                <input type="checkbox" required/><label>I agree to the <u>Terms of Service</u> and <u>Privacy Policy</u></label>
                            </div>
                        </form>
                        <div class="section-button-row">
                            <Link to="/get-involved" style={{textDecoration: "none"}}>
                                <a className="back-btn" type="button">back</a>
                            </Link>
                            <Link to="/get-involved/check-mail" style={{textDecoration: "none"}}>
                                <a className="register-btn" type="button">Create your account</a>
                            </Link>
                        </div>
                        
                    </div>
                </div>
            </div>
        </PageMini>
  );
};

export default Register;
