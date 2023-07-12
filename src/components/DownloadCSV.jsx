const DownloadCSV = ({ csvData, title, fileName }) => {
  const downloadHandler = () => {
    if (csvData) {
      const csvContent =
        'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData);
      const link = document.createElement('a');
      link.setAttribute('href', csvContent);
      link.setAttribute('download', fileName);
      link.click();
    }
  };

  return (
    <button className="button" onClick={downloadHandler}>
      {title}
    </button>
  );
};

export default DownloadCSV;
