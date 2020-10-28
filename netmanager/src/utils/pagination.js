export const generatePaginateOptions = (arrLength) => {
    const multiple = 25
    let options = [];
    let counter = 10;

    while (counter < arrLength) {
        options.push(counter);
        let newCounter = (Math.floor(counter/multiple) * multiple) + multiple;
        if (newCounter >= arrLength) {
            break;
        }
        counter = newCounter;
    }
    options.push(arrLength);

    return options;
}
