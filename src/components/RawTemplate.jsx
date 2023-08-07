import { useEffect, useState } from 'react';

const RawTemplate = ({ data }) => {
  const [rawData, setRawData] = useState();

  useEffect(() => {
    if (data) {
      setRawData(data ? JSON.stringify(data, null, 2) : '');
      localStorage.setItem('rawData', JSON.stringify(data, null, 2));
    }
  }, [data]);

  const handleChangeHandler = (e) => {
    setRawData(e.target.value);
    try {
      const rawValue = JSON.parse(e.target.value);
      localStorage.setItem('rawData', JSON.stringify(rawValue, null, 2));
      // setRawData(JSON.stringify(rawValue, null, 2));
      window.dispatchEvent(new Event('storage'));
    } catch {
      console.log('invalid');
    }
  };
  return (
    <div className="raw-textareaContainer">
      <textarea
        value={rawData}
        placeholder="Raw data comes here..."
        className="textarea"
        onChange={handleChangeHandler}
      />
    </div>
  );
};

export default RawTemplate;
