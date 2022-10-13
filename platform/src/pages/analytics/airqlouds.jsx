import Layout from '@/components/Layout';
import { useDispatch } from 'react-redux';
import { loadAirQloudsData } from '@/lib/redux/AirQloud/operations';
import { _useAirqloudsData } from '@/lib/redux/AirQloud/selectors';

export async function getServerSideProps(context) {
  const airqlouds = _useAirqloudsData();
  const dispatch = useDispatch();

  if (isEmpty(airqlouds)) dispatch(loadAirQloudsData());

  return {
    props: { airqlouds },
  };
}

const AirQlouds = ({ airqlouds }) => {
  console.log(airqlouds);
  return (
    <Layout>
      <div>
        <span>
          <h3>Analytics</h3> {'>'} <h3>AirQlouds</h3>
        </span>
        <div>
          {/* <select name='airqlouds-dropdown' id='airqlouds-dropdown'>
            {airqlouds.map((airqloud)=>(<option>{airqloud.long_name}</option>))}
          </select> */}
        </div>
      </div>
    </Layout>
  );
};
export default AirQlouds;
