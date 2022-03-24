import React from 'react';

const NewsletterSection = ()=>(
    <div className="Newsletter">
        <h3>Get air quality updates!</h3>
        <p>Subscribe to our newsletter and learn about the air quality you are breathing</p>
        <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" className="newsletter-form-input" />
            <button type="submit" className="newsletter-form-btn">Subscribe</button>
        </form>
    </div>
);

export default NewsletterSection;