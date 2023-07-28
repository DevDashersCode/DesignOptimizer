export const generateInBoundData = (dbMapper, mappingDetails) => {
  let finalData = [];
  mappingDetails.forEach((detail) => {
    let data = dbMapper.filter((m) => m?.Definition === detail.from);

    let value = {};
    if (data.length > 0 && Object.keys(data[0]).length > 0) {
      Object.keys(data[0]).forEach((k) => {
        k !== 'Definition' ? (value[k] = data[0][k]) : (value[k] = detail.to);
      });
    }

    if (Object.keys(value).length > 0) finalData.push(value);
  });

  return finalData;
};
