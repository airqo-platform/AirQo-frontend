const CustomLegend = ({ devices, graphColors, isDeviceLegend }) => {
  const len = devices.length;
  return (
    <div className='flex items-center justify-end flex-wrap mt-4 mb-3 mr-7'>
      {isDeviceLegend
        ? devices.map((device, index) => (
            <div
              className='flex justify-center items-center h-5 w-auto rounded-md mx-1 px-1 mb-1'
              key={index}
            >
              <div
                className='rounded-full w-3 h-3 mr-2'
                style={{
                  backgroundColor: graphColors[index],
                }}
              />
              <span className='text-xs text-grey-300 uppercase'>{device.device_name}</span>
            </div>
          ))
        : devices.map((device, index) => (
            <div key={index}>
              <div className='flex justify-center items-center bg-grey-200 h-5 w-auto rounded-md mx-1 px-1 mb-1'>
                <hr
                  className='w-4 h-[2px] border mr-2'
                  style={{ borderColor: graphColors[index] }}
                />
                <span className='text-xs text-grey-300 uppercase'>
                  Sensor 01 - {device.device_name}
                </span>
              </div>
              <div className='flex justify-center items-center bg-grey-200 h-5 w-auto rounded-md mx-1 px-1 mb-1'>
                <hr
                  className='w-4 h-[2px] border border-dashed mr-2'
                  style={{ borderColor: graphColors[index] }}
                />
                <span className='text-xs text-grey-300 uppercase'>
                  Sensor 02 - {device.device_name}
                </span>
              </div>
              {index !== len - 1 && (
                <span className='uppercase mx-2 text-[10px] text-grey-800'>Compared to</span>
              )}
            </div>
          ))}
    </div>
  );
};

export default CustomLegend;
