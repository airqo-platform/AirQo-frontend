import React from 'react'
import FeedbackImg from 'assets/img/Feedback.png'
import { Link } from 'react-router-dom'
import { useInitScrollTop } from 'utils/customHooks';

const Feedback = () => {
    useInitScrollTop();
    return (
        <div className='contactus-feedback'>
            <div>
                <img src={FeedbackImg} alt='Thank you for your feedback' />
            </div>
            <h2>Thanks for reaching out. <br />We’ll get back to you!</h2>
            <button>
                <Link to='/'>Back Home</Link>
            </button>
        </div>
    )
}

export default Feedback