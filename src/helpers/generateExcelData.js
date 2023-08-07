import { getDataObject } from './convertToJsonMapper';

const GenerateRawExcel = (data) => {
  if (data) {
    const rawExcelData = [];
    const obj = getDataObject(data);
    if (obj) {
      for (const [key, value] of Object.entries(obj)) {
        const data = {
          Raw: key,
          DataType: `${typeof value}`,
          'Destinamtion Nullable': 'Yes',
          Example: value,
          Source: key,
          'Source Nullable': 'Yes',
        };

        rawExcelData.push(data);
      }
      return rawExcelData;
    }
  }
};

const GeneratePreparedExcel = (data) => {
  if (data) {
    const preparedExcelData = [];
    data.forEach((d) => {
      const data = {
        Prepared: d.to,
        ToDataType: d.from ? `${typeof d.from}` : '',
        'Destinamtion Nullable': d.from ? 'As is' : '',
        Source: d.from,
        // 'Source Nullable': 'Yes',
        FromDataType: d.from ? `${typeof d.from}` : '',
        Example: d.from ? d.value : '',
      };

      preparedExcelData.push(data);
    });

    return preparedExcelData;
  }
};

export { GenerateRawExcel, GeneratePreparedExcel };
