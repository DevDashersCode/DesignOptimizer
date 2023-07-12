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
        DataType: `${typeof d.from}`,
        'Destinamtion Nullable': 'Yes',
        Example: d.value,
        Source: d.from,
        'Source Nullable': 'Yes',
      };

      preparedExcelData.push(data);
    });

    console.log(preparedExcelData);
    return preparedExcelData;
  }
};

export { GenerateRawExcel, GeneratePreparedExcel };
