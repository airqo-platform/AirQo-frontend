import React from 'react';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedIn from 'assets/svg/LinkedIn.svg';

const Profile = ({ImgPath, name, title, twitterProfileLink, linkedInProfileLink}) => (
    <div className="profile">
        <img src={ImgPath} alt="Profile Img" />
        <div className="info">
            <div className="info-left">
                <h3>{name}</h3>
                <h6>{title}</h6>
            </div>
            <a href={twitterProfileLink || linkedInProfileLink}>
                {twitterProfileLink ? <TwitterIcon className="profile_twitter_handle" /> : <LinkedIn /> }
            </a>
        </div>
    </div>
);

export default Profile;
