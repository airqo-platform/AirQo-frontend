import { isValid, formatISO } from 'date-fns';

/**
 * Formats start and end dates to ISO strings if they are valid.
 * @returns {Object} An object with formatted startDateISO and endDateISO.
 */
const formatDateRangeToISO = (startDate, endDate) => {
  const startDateISO =
    startDate && isValid(startDate) ? formatISO(startDate) : null;
  const endDateISO = endDate && isValid(endDate) ? formatISO(endDate) : null;

  return { startDateISO, endDateISO };
};

export default formatDateRangeToISO;
