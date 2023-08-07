const DownloadJSON = ({ jsonData, title, fileName, addMapping }) => {
  const downloadHandler = () => {
    let data = jsonData;
    if (addMapping) {
      // const obj = jsonData.reduce((acc, { key, value }) => {
      //   console.log(key, value);
      //   if (key && value) {
      //     const values = value.split(',');
      //     if (values.length > 1) {
      //       const keyValues = [];
      //       values.forEach((v) => keyValues.push(v));
      //       acc[key.toUpperCase()] = keyValues;
      //     } else {
      //       acc[key.toUpperCase()] = value;
      //     }
      //   }
      //   return acc;
      // }, {});
      // data = obj;
      data = JSON.parse(localStorage.getItem('templateMapping'));
    } else {
      data = JSON.parse(localStorage.getItem('rawData'));
    }
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button className="button" onClick={downloadHandler}>
      {title}
    </button>
  );
};

export default DownloadJSON;
