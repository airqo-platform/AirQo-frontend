import Collocate from '@/icons/Collocation/collocate.svg';
import Button from '@/components/Button';
import BoxedAddIcon from '@/icons/Actions/addBoxed.svg';
import UploadIcon from '@/icons/Actions/upload.svg';

const EmptyState = () => (
  <div
    className="flex justify-center items-center flex-col mx-auto py-20"
    data-testid="collocate-empty-state"
  >
    <Collocate />
    <div className="flex flex-col justify-center text-center mt-10">
      <h4 className="text-xl font-normal mb-6">
        This is where you will manage your collocated monitors
      </h4>
      <div>
        <p className="text-grey-300 text-sm font-light">
          You can add a monitor to start collocation or import your own data
        </p>
      </div>
      <div className="flex justify-center items-center mt-6">
        <Button path="/collocation/add_monitor">
          <div className="mr-[10px]">
            <BoxedAddIcon />
          </div>
          Add monitors
        </Button>
        <div className="mr-[14px]"></div>
        <Button disabled>
          <div className="mr-[10px]">
            <UploadIcon />
          </div>
          Import data
        </Button>
      </div>
    </div>
  </div>
);

export default EmptyState;
