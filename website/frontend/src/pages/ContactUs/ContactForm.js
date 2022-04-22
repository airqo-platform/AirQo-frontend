import React from 'react';
import ContactUs from '.';
import { useInitScrollTop } from 'utils/customHooks';

const ContactForm = () => {
    useInitScrollTop();
    return (
        <ContactUs>
            <form>
                <div>
                    <label>Your full name*</label><br />
                    <input type="text" required />
                </div>
                <div>
                    <label>Email address*</label><br />
                    <input type="email" required />
                </div>
                <div>
                    <label>Your message*</label><br />
                    <textarea type="text" rows="8" cols="30" required/>
                </div>
                <input type="submit" value="Submit" className='submit-button' />
            </form>
        </ContactUs>
    )
}

export default ContactForm;