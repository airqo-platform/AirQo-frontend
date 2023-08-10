import React from 'react';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import GenerateToken from '../views/pages/Settings/components/GenerateToken/GenerateToken';

const mockStore = configureMockStore();

describe('GenerateToken', () => {
  it('renders correctly', () => {
    const store = mockStore({});
    const wrapper = shallow(<GenerateToken store={store} />);
    expect(wrapper).toMatchSnapshot();
  });
});
