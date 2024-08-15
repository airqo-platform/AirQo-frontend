import { useState } from 'react';
import ContentBox from '@/components/Layout/content_box';
import Button from '@/components/Button';
import AddIcon from '@/icons/Actions/plus.svg';
import UserClientsTable from '@/components/Settings/API/UserClientsTable';
import AddClientForm from '@/components/Settings/API/AddClientForm';
import AdminClientsTable from '@/components/Settings/API/AdminClientsTable';
import { checkAccess } from '..';

const API = ({ userPermissions }) => {
  const [showAddClientForm, setShowAddClientForm] = useState(false);

  return (
    <div
      data-testid="api-tab"
      className="px-3 lg:px-16 mb-5 flex flex-col gap-10"
    >
      <ContentBox noMargin>
        <div className="px-3 py-4 md:flex justify-between items-center gap-5">
          <div>
            <h3 className="text-grey-710 font-medium text-lg">
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
        <div>
          <div className="w-full">
            <UserClientsTable />
          </div>
        </div>
      </ContentBox>
      {userPermissions &&
        checkAccess(
          'CREATE_UPDATE_AND_DELETE_NETWORK_USERS',
          userPermissions
        ) && (
          <ContentBox noMargin>
            <div className="px-3 py-4">
              <h3 className="text-grey-710 font-medium text-lg">
                Clients activation manager
              </h3>
              <p className="text-grey-500 text-sm md:max-w-[640px] w-full">
                Activate or deactivate clients to enable or disable their access
                to the API.
              </p>
            </div>
            <div className="w-full">
              <AdminClientsTable />
            </div>
          </ContentBox>
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
