const GenerateRawExcel = (data) => {
  console.log(data);
  if (data) {
    const rawExcelData = [];
    for (const [key, value] of Object.entries(data?.message?.data)) {
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

    console.log(rawExcelData);
    return rawExcelData;
  }
};

const GeneratePreparedExcel = (data) => {
  if (data) {
    const preparedExcelData = [];
    data.forEach((d) => {
      const data = {
        Prepared: d.to,
        ToDataType: `${typeof d.from}`,
        'Destinamtion Nullable': 'As is',
        Source: d.from,
        // 'Source Nullable': 'Yes',
        FromDataType: `${typeof d.from}`,
        Example: d.value,
      };

      preparedExcelData.push(data);
    });

    console.log(preparedExcelData);
    return preparedExcelData;
  }
};

export { GenerateRawExcel, GeneratePreparedExcel };
