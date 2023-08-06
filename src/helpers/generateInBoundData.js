export const generateInBoundData = (dbMapper, mappingDetails) => {
  let finalData = [];
  // allowed cloumns and desired output columns
  const allowedColumns = [
    'Entity Name',
    'Table Name',
    'Attribute Name',
    'Column Name',
    'Logical Data Type',
    'Physical Data Type',
    'Domain Attribute',
    'Attribute Comment',
    'Null Option',
    'Definition',
  ];
  mappingDetails.forEach((detail) => {
    let data = dbMapper.filter((m) => m?.Definition === detail.from);

    let value = {};
    if (data.length > 0 && Object.keys(data[0]).length > 0) {
      Object.keys(data[0]).forEach((k) => {
        if (allowedColumns.includes(k))
          k !== 'Definition' ? (value[k] = data[0][k]) : (value[k] = detail.to);
      });
    }

    if (Object.keys(value).length > 0) finalData.push(value);
  });
  const arrangedData = allowedColumns.map((key) =>
    finalData.find((obj) => key in obj)
  );
  return arrangedData;
};
