import React from 'react';
import ContactCard from './card';
import DataIcon from 'icons/contactUs/Data.svg';
import FeedbackIcon from 'icons/contactUs/Feedback.svg';
import InquiryIcon from 'icons/contactUs/Inquiry.svg';
import ToolsIcon from 'icons/contactUs/Tools.svg';
import { useTranslation, Trans } from 'react-i18next';

const Cards = () => {
  const { t } = useTranslation();
  return (
    <div className="cards">
      <ContactCard
        preamble={t('about.contactUs.cards.first.subText')}
        title={t('about.contactUs.cards.first.title')}
        page_link={'/contact/form'}
        icon={<ToolsIcon />}></ContactCard>
      <ContactCard
        preamble={t('about.contactUs.cards.second.subText')}
        title={t('about.contactUs.cards.second.title')}
        page_link={'/contact/form'}
        icon={<DataIcon />}></ContactCard>
      <ContactCard
        preamble={t('about.contactUs.cards.third.subText')}
        title={t('about.contactUs.cards.third.title')}
        page_link={'/contact/form'}
        icon={<FeedbackIcon />}></ContactCard>
      <ContactCard
        preamble={t('about.contactUs.cards.fourth.subText')}
        title={t('about.contactUs.cards.fourth.title')}
        page_link={'/contact/form'}
        icon={<InquiryIcon />}></ContactCard>
    </div>
  );
};

export default Cards;
