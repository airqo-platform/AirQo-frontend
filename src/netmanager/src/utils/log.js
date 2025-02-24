const logText = (text) => {
  console.log(`${text}`);
};

const logElement = (text, element) => {
  console.log(`${text}: ${element}`);
};

const logObject = (text, object) => {
  console.log(`${text}:`);
  console.dir(`${object}`);
};

export { logText, logElement, logObject };
