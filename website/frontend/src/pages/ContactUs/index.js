import React from 'react';
import PageMini from '../PageMini';

const ContactUs = ({ children }) => {
    return (
        <PageMini>
            <div className='contact-us'>
                <div className='left-section'>
                    <div className='section-container'>
                        <div className='content'>
                            <h2>Get in Touch</h2>
                            <p>We're here to help, we check our email frequently.</p>
                            <span id='_1'>
                                <p><b>Uganda, East Africa</b><br />Makerere University</p>
                            </span>
                            <span id='_2'>
                                <p>Software Systems Centre, Block B,<br />Level 3, College of Computing and<br /> Information Sciences, Plot 56 University<br /> Pool Road</p>
                            </span>
                            <span id='_3'>
                                <p>+256 703734167 <br />info@airqo.net</p>
                            </span>
                        </div>
                    </div>
                </div>
                <div className='right-section'>
                    <div className='section-container'>
                        <div className='content'>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </PageMini>
    )
}

export default ContactUs;