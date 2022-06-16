import React from 'react'
import ContactCard from './card';
import DataIcon from 'icons/contactUs/Data.svg'
import FeedbackIcon from 'icons/contactUs/Feedback.svg'
import InquiryIcon from 'icons/contactUs/Inquiry.svg'
import ToolsIcon from 'icons/contactUs/Tools.svg'

const Cards = () => {
    return (
        <div className='cards'>
            <ContactCard preamble={"I have a question about"} title={"Air Quality Tools"} page_link={"/contact/form"} icon={<ToolsIcon />}></ContactCard>
            <ContactCard preamble={"I have a question about"} title={"Air Quality Data"} page_link={"/contact/form"} icon={<DataIcon />}></ContactCard>
            <ContactCard preamble={"I have some"} title={"feedback"} page_link={"/contact/form"} icon={<FeedbackIcon />}></ContactCard>
            <ContactCard preamble={"I have a"} title={"general inquiry"} page_link={"/contact/form"} icon={<InquiryIcon />}></ContactCard>
        </div>
    )
}

export default Cards