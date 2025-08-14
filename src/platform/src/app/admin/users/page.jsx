'use client';
import { useEffect, useState, useMemo } from 'react';
import ReusableTable from '@/components/Table';
import { getUsersApi } from '@/core/apis/Account';
import { format, parseISO, isValid } from 'date-fns';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getInitials = (row) => {
    const a = (row?.firstName || '').trim();
    const b = (row?.lastName || '').trim();
    let letters = `${a?.[0] || ''}${b?.[0] || ''}`.trim();
    if (!letters) letters = a.slice(0, 2) || '';
    if (!letters && row?.email)
      letters = row.email.replace(/[^a-z]/gi, '').slice(0, 2);
    return (letters || 'UN').toUpperCase();
  };

  const formatDate = (value) => {
    if (!value) return 'Never Logged In';
    let d = typeof value === 'string' ? parseISO(value) : new Date(value);
    if (!isValid(d) && typeof value === 'string')
      d = parseISO(value.replace(' ', 'T'));
    if (!isValid(d)) d = new Date(value);
    if (!isValid(d)) return 'Never Logged In';
    return format(d, 'PP, p');
  };

  const columns = useMemo(
    () => [
      {
        key: 'profilePicture',
        label: 'Avatar',
        render: (value, row) =>
          value ? (
            <img
              src={value}
              alt={
                `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'User'
              }
              className="w-8 h-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-semibold">
              {getInitials(row)}
            </div>
          ),
      },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'privilege', label: 'Role' },
      {
        key: 'isActive',
        label: 'Status',
        render: (value) => (
          <span
            className={`px-2 py-1 rounded text-xs ${
              value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {value ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        key: 'lastLogin',
        label: 'Last Login',
        render: (value) => formatDate(value),
      },
    ],
    [],
  );

  // STATUS FILTER (Active / Inactive)
  const filters = useMemo(
    () => [
      {
        key: 'isActive',
        label: 'Status',
        type: 'select',
        placeholder: 'All',
        options: [
          { label: 'Active', value: true },
          { label: 'Inactive', value: false },
        ],
      },
    ],
    [],
  );

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await getUsersApi();
        if (isMounted && res?.success) {
          setUsers(res.users || []);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Users
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Manage system users</p>
      </div>

      <ReusableTable
        title="System Users"
        data={users}
        columns={columns}
        searchable
        filterable
        filters={filters}
        loading={loading}
        pageSize={10}
        multiSelect
        actions={[
          {
            label: 'Activate',
            value: 'activate',
            handler: (rows) => {
              const ids = rows.map((r) => r._id ?? r.id);
              console.log('Activate ->', ids);
            },
          },
          {
            label: 'Deactivate',
            value: 'deactivate',
            handler: (rows) => {
              const ids = rows.map((r) => r._id ?? r.id);
              console.log('Deactivate ->', ids);
            },
          },
        ]}
      />
    </div>
  );
};

export default UsersPage;
