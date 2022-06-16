import React, { useState } from 'react';
import ContactUs from '.';
import { useInitScrollTop } from 'utils/customHooks';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch } from 'react-redux';
import { postContactUsInquiry } from 'reduxStore/ContactUs/operations';
import { useInquiryData } from 'reduxStore/ContactUs/selectors';
import { isEmpty } from 'underscore';

const ContactForm = () => {
    useInitScrollTop();
    const history = useNavigate();
    const dispatch = useDispatch();
    const inquiryData = useInquiryData();
    const [loading, setLoading] = useState(false);
    const [fullName, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const category = 'general';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await dispatch(postContactUsInquiry({ fullName, email, message, category }));
        setLoading(false);
        !isEmpty(inquiryData) && inquiryData.success && history('/contact/sent');
    }

    return (
        <ContactUs arrow={<ArrowBackIcon />}>
            {
                isEmpty(inquiryData) &&
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Full name</label><br />
                        <input type="text" value={fullName} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label>Email address</label><br />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label>Your message*</label><br />
                        <textarea type="text" rows="8" cols="30" value={message} onChange={(e) => setMessage(e.target.value)} required />
                    </div>
                    <div className='checkpoint'>
                        <input type='checkbox' required />
                        <label>I agree to the <Link to='/terms'>Terms of Service</Link> and <Link to='/terms'>Privacy Policy</Link></label>
                    </div>
                    <button type="submit" className='submit-button'>
                        Send{loading && <span>...</span>}
                    </button>
                </form>
            }
        </ContactUs>
    )
}

export default ContactForm;