import PersonIcon from '@/icons/Settings/person.svg';
import MailIcon from '@/icons/Settings/mail.svg';
import PlusIcon from '@/icons/Settings/plus.svg';
import Button from '@/components/Button';
import { useState } from 'react';
import { isEmpty } from 'underscore';
import { inviteUserToGroupTeam } from '@/core/apis/Account';
import Spinner from '../../Spinner';
import AlertBox from '../../AlertBox';

const TeamInviteForm = ({ open, closeModal }) => {
  const [emails, setEmails] = useState(['']);
  const [emailErrors, setEmailErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState({
    isError: false,
    message: '',
    type: '',
  });

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
    // Email validation regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if email is not empty and matches the regex pattern
    if (email && email.match(emailRegex)) {
      return true; // Email is valid and not empty
    }

    return false; // Email is either empty or invalid
  };

  const handleCancel = () => {
    setEmails(['']);
    setEmailErrors([]);
    closeModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (emails[0] === '') {
      setIsError({
        isError: true,
        message: 'Please enter an email',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    const isValid = emails.every((email) => isValidEmail(email));

    if (isValid) {
      try {
        const activeGroup = JSON.parse(localStorage.getItem('activeGroup'));
        if (!activeGroup) {
          throw new Error('No active group found');
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
              message: error?.response?.data?.errors?.message,
              type: 'error',
            });
            setLoading(false);
          });
      } catch (error) {
        console.error(error);
        setLoading(false);
        return;
      }
    } else {
      // Display an error message or handle invalid emails
      console.log('Invalid emails:', emailErrors);
    }
  };

  return (
    <dialog id='report_detail_popup' className={`modal ${open && 'modal-open'} w-screen h-screen`}>
      <form
        method='dialog'
        className='modal-box p-6 overflow-y-scroll rounded max-w-[400px] max-h-[449px] w-full h-full shadow border border-slate-100'
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
        <div className='flex justify-between items-start mb-5'>
          <div className='w-14 h-14 rounded-[28px] flex justify-center items-center bg-primary-100'>
            <PersonIcon />
          </div>
          <button onClick={handleCancel} className='btn btn-sm btn-circle btn-ghost'>
            ✕
          </button>
        </div>
        <div className='self-stretch h-full'>
          <h3 className='text-lg font-medium text-secondary-neutral-light-800 leading-[26px] mb-2'>
            Invite team member
          </h3>
          <p className='text-sm text-secondary-neutral-light-400 leading-5 mb-5'>
            Your new organisation has been created. Invite your team to collaborate on this project.
          </p>

          <div className='flex flex-col gap-3 justify-start'>
            {emails.map((email, index) => (
              <div key={index}>
                <div className='relative' key={index}>
                  <input
                    type='text'
                    placeholder='Enter organization email'
                    className='input input-bordered w-full pl-9 placeholder-shown:text-secondary-neutral-light-300 text-secondary-neutral-light-800 text-sm leading-[26px] border border-secondary-neutral-light-100 bg-secondary-neutral-light-25 rounded'
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                  />
                  <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                    <MailIcon />
                  </div>
                  {index > 0 && (
                    <button
                      className='absolute inset-y-0 right-0 flex justify-center items-center mr-3 pointer-events-auto'
                      onClick={() => handleRemoveEmail(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
                {emailErrors[index] && email && (
                  <div className='relative flex justify-end pr-3'>
                    <span className='text-xs text-red-500'>{emailErrors[index]}</span>
                  </div>
                )}
              </div>
            ))}

            <div>
              <Button
                className='text-sm font-medium text-primary-600 leading-5 gap-2 h-5 mt-3 mb-8 w-auto pl-0'
                onClick={handleAddEmail}
              >
                <PlusIcon /> <span>Add email</span>
              </Button>
            </div>

            <div className='flex gap-3'>
              <Button
                className='text-sm font-medium text-secondary-neutral-light-600 leading-5 w-[170px] h-[44px] border border-secondary-neutral-light-100 rounded'
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className='text-sm font-medium bg-primary-600 text-white leading-5 w-[170px] h-[44px] rounded disabled:bg-gray-400 disabled:text-gray-800'
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <Spinner /> : 'Send invites'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </dialog>
  );
};

export default TeamInviteForm;
