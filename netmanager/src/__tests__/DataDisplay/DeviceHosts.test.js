import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditHostDialog from '../../views/components/Hosts/HostView';
import HostView from '../../views/components/Hosts/HostView';

describe('EditHostDialog', () => {
  it('renders with initial state', () => {
    render(<EditHostDialog data={[]} setLoading={() => {}} onHostEdited={() => {}} />);

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveButton).toBeDisabled();

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const phoneNumberInput = screen.getByLabelText(/Phone Number/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const siteSelect = screen.getByLabelText(/Sites/i);
    expect(firstNameInput).toBeInTheDocument();
    expect(lastNameInput).toBeInTheDocument();
    expect(phoneNumberInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(siteSelect).toBeInTheDocument();
  });

  it('enables "Save Changes" button when input fields are changed', () => {
    render(<EditHostDialog data={[]} setLoading={() => {}} onHostEdited={() => {}} />);
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'paul' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'ochieng' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '21982912821' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'ochieng@gmail.com' }
    });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveButton).toBeEnabled();
  });
});

describe('HostView', () => {
  it('renders with initial state', () => {
    render(<HostView />);

    const sendMoneyButton = screen.getByRole('button', { name: /Send Money/i });
    expect(sendMoneyButton).toBeInTheDocument();

    const loadingIndicator = screen.queryByText(/Loading/i);
    expect(loadingIndicator).toBeNull();

    const transactionDetailsTable = screen.getByText(/Host Transaction Details/i);
    const deviceDetailsTable = screen.getByText(/Host Device Details/i);
    expect(transactionDetailsTable).toBeInTheDocument();
    expect(deviceDetailsTable).toBeInTheDocument();
  });
});
