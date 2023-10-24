import BorderlessContentBox from '@/components/Layout/borderless_content_box';

const Profile = () => {
  return (
    <BorderlessContentBox>
      <div className='flex flex-col'>
        <h3 className='text-sm font-medium leading-5 text-grey-710'>Personal information</h3>
        <p className='text-sm text-grey-500 leading-5'>Update your photo and personal details.</p>
      </div>
    </BorderlessContentBox>
  );
};

export default Profile;
