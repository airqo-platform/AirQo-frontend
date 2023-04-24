const Skeleton = () => (
  <tbody data-testid='device-summary-skeleton'>
    {Array.from({ length: 9 }).map((_, index) => (
      <tr className='border-b border-b-skeleton h-14' key={index}>
        <td scope='row' className='w-[53px] pl-5'>
          <div className='w-5 h-[15px] bg-skeleton rounded' />
        </td>
        <td scope='row' className='w-[61px] pl-4'>
          <div className='rounded w-[53px] h-[15px] bg-skeleton' />
        </td>
        <td scope='row' className='w-[175px] pl-4'>
          <div className='rounded w-[84px] h-[15px] bg-skeleton' />
        </td>
        <td scope='row' className='w-[175px] pl-4'>
          <div className='rounded w-[97px] h-[15px] bg-skeleton' />
        </td>
        <td scope='row' className='w-[175px] pl-4'>
          <div className='rounded w-[97px] h-[15px] bg-skeleton' />
        </td>
        <td scope='row' className='w-[175px] pl-4'>
          <div className='rounded w-[97px] h-[15px] bg-skeleton' />
        </td>
        <td scope='row' className='w-[175px] pl-4'>
          <div className='rounded w-[33px] h-[15px] bg-skeleton' />
        </td>
      </tr>
    ))}
  </tbody>
);

export default Skeleton;
