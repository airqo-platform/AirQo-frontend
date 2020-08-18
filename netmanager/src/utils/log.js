const log = {
  logText: (text) => {
    console.log(`${text}`);
  },
  logElement: (text, element) => {
    console.log(`${text}: ${element}`);
  },
  logObject: (text, object) => {
    console.log(`${text}:`);
    console.dir(`${object}`);
  },
};

export default log;
