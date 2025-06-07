import { useState } from 'react';
import Card from '@/components/CardWrapper';
import Button from '@/components/Button';
import AddIcon from '@/icons/Actions/plus.svg';
import UserClientsTable from '@/components/Settings/API/UserClientsTable';
import AddClientForm from '@/components/Settings/API/AddClientForm';
import AdminClientsTable from '@/components/Settings/API/AdminClientsTable';
import { checkAccess } from '../page';

const API = ({ userPermissions }) => {
  const [showAddClientForm, setShowAddClientForm] = useState(false);

  return (
    <div data-testid="api-tab" className="flex w-full flex-col gap-10">
      <Card
        header={
          <div className="px-3 py-4 md:flex w-full justify-between items-center gap-5">
            <div>
              <h3 className="text-grey-710 dark:text-white font-medium text-lg">
                API access tokens
              </h3>
              <p className="text-grey-500 text-sm md:max-w-[640px] w-full">
                Clients are used to generate API tokens that can be used to
                authenticate with the API. Your secret API tokens are listed
                below. Remember to keep them secure and never share them. <br />
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://docs.airqo.net/airqo-rest-api-documentation"
                  className="text-blue-600"
                  aria-label="Read AirQo REST API Documentation"
                >
                  Read Docs
                </a>
              </p>
            </div>
            <Button
              onClick={() => setShowAddClientForm(true)}
              className="w-[152px] h-11 flex justify-center items-center gap-2 rounded py-3 px-4 mr-5 my-4 md:mb-0 bg-blue-600 text-white text-sm font-medium"
            >
              <AddIcon /> Create client
            </Button>
          </div>
        }
        padding="p-0"
        headerProps={{
          className:
            'px-3 py-2 flex flex-col md:flex-row justify-between items-center gap-2',
        }}
      >
        <UserClientsTable />
      </Card>
      {userPermissions &&
        checkAccess(
          'CREATE_UPDATE_AND_DELETE_NETWORK_USERS',
          userPermissions,
        ) && (
          <Card
            header={
              <div className="px-3 py-4">
                <h3 className="text-grey-710 dark:text-white font-medium text-lg">
                  Clients activation manager
                </h3>
                <p className="text-grey-500 text-sm md:max-w-[640px] w-full">
                  Activate or deactivate clients to enable or disable their
                  access to the API.
                </p>
              </div>
            }
            padding="p-0"
            className="mb-6"
            headerProps={{ className: 'px-3 py-2' }}
          >
            <AdminClientsTable />
          </Card>
        )}
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
