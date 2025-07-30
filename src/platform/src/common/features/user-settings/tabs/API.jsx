import { useState } from 'react';
import UserClientsTable from '../components/API/UserClientsTable';
import AddClientForm from '../components/API/AddClientForm';

const API = () => {
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  return (
    <div data-testid="tab-content">
      <UserClientsTable />

      {showAddClientForm && (
        <AddClientForm
          open={showAddClientForm}
          closeModal={() => setShowAddClientForm(false)}
        />
      )}
    </div>
  );
};

export default API;
