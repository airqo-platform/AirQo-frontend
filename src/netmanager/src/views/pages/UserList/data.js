import uuid from 'uuid/v1';

export default [
  {
    id: uuid(),
    name: 'Emilee Simchenko',
    address: {
      country: 'USA',
      state: 'Nevada',
      city: 'Las Vegas',
      street: '1798  Hickory Ridge Drive'
    },
    email: 'emilee.simchenko@devias.io',
  },
  {
    id: uuid(),
    name: 'Kwak Seong-Min',
    address: {
      country: 'USA',
      state: 'Michigan',
      city: 'Detroit',
      street: '3934  Wildrose Lane'
    },
    email: 'kwak.seong.min@devias.io',
  },
  {
    id: uuid(),
    name: 'Merrile Burgett',
    address: {
      country: 'USA',
      state: 'Utah',
      city: 'Salt Lake City',
      street: '368 Lamberts Branch Road'
    },
    email: 'merrile.burgett@devias.io',
  }
];
