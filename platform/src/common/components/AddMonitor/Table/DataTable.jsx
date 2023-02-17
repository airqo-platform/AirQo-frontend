import { humanReadableDate } from '@/core/utils/dateTime';

const DataTable = ({ paginatedData }) => {
  return (
    <table className='border-collapse text-sm text-left w-full mb-6'>
      <thead>
        <tr className='border-b border-b-slate-300 text-black'>
          <th scope='col' className='font-normal w-[61px] py-3 px-6'>
            <input type='checkbox' />
          </th>
          <th scope='col' className='font-normal w-[145px] px-4 py-3 opacity-40'>
            Monitor name
          </th>
          <th scope='col' className='font-normal w-[145px] px-4 py-3 opacity-40'>
            Date added
          </th>
          <th scope='col' className='font-normal w-[145px] px-4 py-3 opacity-40'>
            Added by
          </th>
          <th scope='col' className='font-normal w-[209px] px-4 py-3 opacity-40'>
            Comments
          </th>
        </tr>
      </thead>
      <tbody>
        {paginatedData.length > 0 &&
          paginatedData.map((device) => {
            return (
              <tr className='border-b border-b-slate-300' key={device._id}>
                <td scope='row' className='w-[61px] py-3 px-6'>
                  <input type='checkbox' />
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'>
                  {device.long_name}
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'>
                  {humanReadableDate(device.createdAt)}
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'>
                  {' '}
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'></td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};

export default DataTable;
