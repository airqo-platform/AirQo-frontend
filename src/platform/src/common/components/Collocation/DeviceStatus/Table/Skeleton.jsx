import { Skeleton } from '@/common/components/Skeleton';

const TableSkeleton = () => (
  <tbody data-testid="device-summary-skeleton">
    {Array.from({ length: 9 }).map((_, index) => (
      <tr className="border-b border-b-skeleton h-14" key={index}>
        <td scope="row" className="w-[53px] pl-5">
          <Skeleton className="w-5 h-[15px]" />
        </td>
        <td scope="row" className="w-[61px] pl-4">
          <Skeleton className="w-[53px] h-[15px]" />
        </td>
        <td scope="row" className="w-[175px] pl-4">
          <Skeleton className="w-[84px] h-[15px]" />
        </td>
        <td scope="row" className="w-[175px] pl-4">
          <Skeleton className="w-[97px] h-[15px]" />
        </td>
        <td scope="row" className="w-[175px] pl-4">
          <Skeleton className="w-[97px] h-[15px]" />
        </td>
        <td scope="row" className="w-[175px] pl-4">
          <Skeleton className="w-[97px] h-[15px]" />
        </td>
        <td scope="row" className="w-[175px] pl-4">
          <Skeleton className="w-[33px] h-[15px]" />
        </td>
      </tr>
    ))}
  </tbody>
);

export default TableSkeleton;
