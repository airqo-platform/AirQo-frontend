import React from 'react';
import { Link } from 'react-router-dom';
import PageMini from '../PageMini';

const ContactUs = ({ children, arrow }) => {
    return (
        <PageMini>
            <div className='contact-us'>
                <div className='left-section'>
                    <div className='section-container'>
                        <div className='content'>
                            <h2>Get in touch</h2>
                            <span id='_1'>
                                <p>Makerere University</p>
                            </span>
                            <span id='_2'>
                                <p>Software Systems Centre, Block B, Level 3, College of Computing and Information Sciences, Plot 56 University Pool Road. Kampala, Uganda</p>
                            </span>
                            <span id='_3'>
                                <p>E: <a href='mailto:info@airqo.net?subject=Mail from AirQo Website'>info@airqo.net</a></p>
                            </span>
                        </div>
                    </div>
                </div>
                <div className='right-section'>
                    <Link to='/contact' className='icon' title='Back'>{arrow}</Link>
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