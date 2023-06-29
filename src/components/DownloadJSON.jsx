const DownloadJSON = ({ jsonData, title, fileName }) => {
  const downloadHandler = () => {
    const jsonContent = JSON.stringify(jsonData, null, 2);
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
