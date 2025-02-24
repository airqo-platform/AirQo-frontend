import React from 'react';
import { mount, shallow } from 'enzyme';
import LogsTable from '../../views/pages/Logs/logs_table';
import { Provider } from 'react-redux';
import store from '../../store';
import { LOAD_ACTIVE_SERVICE_SUCCESS } from '../../redux/Logs/actions';
import CustomMaterialTable from '../../views/components/Table/CustomMaterialTable';

describe('LogsTable Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(
      <Provider store={store}>
        <LogsTable service="auth" />
      </Provider>
    );
  });
  it('displays loading indicator initially', () => {
    expect(wrapper.contains('[data-testid="loading-indicator"]'));
  });

  it('displays logs when data is fetched', () => {
    const logsData = [
      { meta: { username: 'user1', email: 'user1@example.com' }, message: 'Logged in' }
    ];

    store.dispatch({
      type: LOAD_ACTIVE_SERVICE_SUCCESS,
      payload: 'auth'
    });

    expect(wrapper.contains(<CustomMaterialTable data={logsData} />)).toEqual(true);
  });
});
