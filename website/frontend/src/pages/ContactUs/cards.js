import React from 'react'
import ContactCard from './card';

const Cards = () => {
    return (
        <div className='cards'>
            <ContactCard preamble={"I have a question about"} title={"Air Quality Tools"} page_link={"/contact/form"}></ContactCard>
            <ContactCard preamble={"I have a question about"} title={"Air Quality Data"} page_link={"/contact/form"}></ContactCard>
            <ContactCard preamble={"I have some"} title={"feedback"} page_link={"/contact/form"}></ContactCard>
            <ContactCard preamble={"I have a"} title={"general inquiry"} page_link={"/contact/form"}></ContactCard>
        </div>
    )
}

export default Cards