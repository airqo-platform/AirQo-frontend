import { useEffect, useState } from 'react';
import Card from '@/components/CardWrapper';
import TeamsTable from '../components/Teams/table';
import Button from '@/components/Button';
import AddIcon from '@/icons/Actions/plus.svg';
import TeamInviteForm from '../components/Teams/InviteForm';

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
    <div data-testid="team-tab">
      <Card rounded padding="pb-6">
        <div className="flex justify-between items-center px-6 py-5 flex-wrap sm:flex-nowrap gap-2">
          <h3 className="text-lg font-medium text-secondary-neutral-light-800 dark:text-white">
            Team members
          </h3>
          <Button type="button" onClick={() => setOpen(!open)}>
            <AddIcon className="mr-2" /> Invite member
          </Button>
        </div>
        <TeamsTable users={teamMembers} isLoading={loading} />
      </Card>
      <TeamInviteForm open={open} closeModal={handleClose} />
    </div>
  );
};

export default Team;
