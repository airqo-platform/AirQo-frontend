import React from 'react';
import TwitterIcon from '@mui/icons-material/Twitter';

const Profile = ({ImgPath, name, title}) => (
    <div className="profile">
        <img src={ImgPath} alt="Profile Img" />
        <div className="info">
            <div className="info-left">
                <h3>{name}</h3>
                <h6>{title}</h6>
            </div>
            <TwitterIcon className="profile_twitter_handle"/>
        </div>
    </div>
);

export default Profile;
