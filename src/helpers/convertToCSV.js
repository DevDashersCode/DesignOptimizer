import { unparse } from 'papaparse';

const ConvertToCSV = (data) => {
  if (data) {
    const csvString = unparse(data, { header: true });

    return csvString;
  }
};

export default ConvertToCSV;
