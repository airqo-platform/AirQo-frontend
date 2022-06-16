import React from 'react';
import ContactUs from '.';
import { useInitScrollTop } from 'utils/customHooks';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ContactForm = () => {
    useInitScrollTop();
    const history = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        history('/contact/sent');
    }
    return (
        <ContactUs arrow={<ArrowBackIcon />}>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Full name</label><br />
                    <input type="text" required />
                </div>
                <div>
                    <label>Email address</label><br />
                    <input type="email" required />
                </div>
                <div>
                    <label>Your message*</label><br />
                    <textarea type="text" rows="8" cols="30" required />
                </div>
                <div className='checkpoint'>
                    <input type='checkbox' required />
                    <label>I agree to the <Link to='/terms'>Terms of Service</Link> and <Link to='/terms'>Privacy Policy</Link></label>
                </div>
                <input type="submit" value="Send" className='submit-button' />
            </form>
        </ContactUs>
    )
}

export default ContactForm;