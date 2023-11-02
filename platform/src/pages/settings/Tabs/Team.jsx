import { useEffect, useState } from 'react';
import ContentBox from '@/components/Layout/content_box';
import TeamsTable from '@/components/Settings/Teams/table';
import Button from '@/components/Button';
import AddIcon from '@/icons/Actions/plus.svg';
import TeamInviteForm from '@/components/Settings/Teams/InviteForm';

const Team = ({ users, loading }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (users) {
      setTeamMembers(users);
    }
  }, [users]);

  return (
    <div data-testid='team-tab'>
      <ContentBox>
        <div className='flex justify-between items-center px-6 py-5 flex-wrap sm:flex-nowrap gap-2'>
          <h3 className='text-secondary-neutral-light-800 font-medium text-lg'>Team members</h3>
          <Button
            onClick={() => setOpen(!open)}
            className='flex justify-center items-center gap-2 rounded py-3 px-4 bg-blue-600 text-white text-sm font-medium'
          >
            <AddIcon /> Invite member
          </Button>
        </div>
        <TeamsTable users={teamMembers} isLoading={loading} />
      </ContentBox>
      <TeamInviteForm open={open} closeModal={handleClose} />
    </div>
  );
};

export default Team;
