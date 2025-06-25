import React, { useState } from 'react';
import PersonIcon from '@/icons/Settings/person.svg';
import MailIcon from '@/icons/Settings/mail.svg';
import PlusIcon from '@/icons/Settings/plus.svg';
import Button from '@/components/Button';
import { isEmpty } from 'underscore';
import { inviteUserToGroupTeam } from '@/core/apis/Account';
import AlertBox from '@/components/AlertBox';
import DialogWrapper from '@/components/Modal/DialogWrapper';
import { useSelector } from 'react-redux';

const TeamInviteForm = ({ open, closeModal }) => {
  const [emails, setEmails] = useState(['']);
  const [emailErrors, setEmailErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState({
    isError: false,
    message: '',
    type: '',
  }); // Get active group from Redux store instead of localStorage
  const activeGroup = useSelector((state) => state.groups.activeGroup);

  const handleEmailChange = (index, value) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);

    if (!isEmpty(value)) {
      const updatedEmailErrors = [...emailErrors];
      updatedEmailErrors[index] = isValidEmail(value) ? '' : 'Invalid email';
      setEmailErrors(updatedEmailErrors);
    }
  };

  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleRemoveEmail = (index) => {
    const updatedEmails = [...emails];
    updatedEmails.splice(index, 1);
    setEmails(updatedEmails);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && email.match(emailRegex);
  };

  const handleCancel = () => {
    setEmails(['']);
    setEmailErrors([]);
    closeModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!emails[0]) {
      setIsError({
        isError: true,
        message: 'Please enter an email',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    const allValid = emails.every((email) => isValidEmail(email));

    if (allValid) {
      // Get active group from Redux store instead of localStorage
      if (!activeGroup || !activeGroup._id) {
        setIsError({
          isError: true,
          message: 'No active group found. Please select a group first.',
          type: 'error',
        });
        setLoading(false);
        return;
      }

      inviteUserToGroupTeam(activeGroup._id, emails)
        .then((response) => {
          setIsError({
            isError: true,
            message: response.message,
            type: 'success',
          });

          setTimeout(() => {
            setLoading(false);
            setEmails(['']);
            setEmailErrors([]);
            closeModal();
          }, 3000);
        })
        .catch((error) => {
          setIsError({
            isError: true,
            message:
              error?.response?.data?.errors?.message || 'Something went wrong',
            type: 'error',
          });
          setLoading(false);
        });
    } else {
      setIsError({
        isError: true,
        message: 'One or more emails are invalid',
        type: 'error',
      });
      setLoading(false);
    }
  };

  return (
    <DialogWrapper
      open={open}
      onClose={handleCancel}
      handleClick={handleSubmit}
      primaryButtonText="Send invites"
      loading={loading}
      ModalIcon={PersonIcon}
    >
      <AlertBox
        message={isError.message}
        type={isError.type}
        show={isError.isError}
        hide={() =>
          setIsError({
            isError: false,
            message: '',
            type: '',
          })
        }
      />
      <div className="w-full">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 leading-[26px] mb-2">
          Invite team member
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-5 mb-5">
          Your new organisation has been created. Invite your team to
          collaborate on this project.
        </p>
        <div className="flex flex-col gap-3">
          {emails.map((email, index) => (
            <div key={index}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter organization email"
                  className="input input-bordered w-full pl-9 placeholder:text-gray-400 text-gray-800 dark:text-gray-100 text-sm leading-[26px] border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded"
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MailIcon />
                </div>
                {index > 0 && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex justify-center items-center mr-3"
                    onClick={() => handleRemoveEmail(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
              {emailErrors[index] && email && (
                <div className="flex justify-end pr-3">
                  <span className="text-xs text-red-500">
                    {emailErrors[index]}
                  </span>
                </div>
              )}
            </div>
          ))}
          <div className="w-full flex justify-start">
            <Button
              type="button"
              variant="text"
              className="shadow-none"
              paddingStyles="py-3 m-0"
              onClick={handleAddEmail}
            >
              <PlusIcon /> <span>Add email</span>
            </Button>
          </div>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default TeamInviteForm;
