import Layout from '@/components/Layout';
import { useGetAllAirQloudsQuery } from '@/lib/store/airQloudsApi';
import { wrapper } from '@/lib/store';
import { getRunningOperationPromises } from '@/lib/store/airQloudsApi';

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async (context) => {
    const name = context.params?.name;

    if (typeof name === 'string') {
      store.dispatch(useGetAllAirQloudsQuery.initiate(name));
    }

    await Promise.all(getRunningOperationPromises());

    return {
      props: {},
    };
  },
);

const AirQlouds = () => {
  const {
    data: airqloudsResData,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetAllAirQloudsQuery();
  const airqlouds = !isLoading && airqloudsResData.airqlouds;

  console.log(airqlouds);
  return (
    <Layout>
      <div>
        <span>
          <h3>Analytics</h3> {'>'} <h3>AirQlouds</h3>
        </span>
        <div>
          {!isLoading && (
            <select name='airqlouds-dropdown' id='airqlouds-dropdown'>
              {airqlouds.map((airqloud) => (
                <option key={airqloud._id}>{airqloud.long_name}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </Layout>
  );
};
export default AirQlouds;
