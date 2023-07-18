import { useEffect, useState } from 'react';
import { source } from '../helpers/mappingSource';

const AddMappingData = ({ templateData, operation, deletedValue }) => {
  const [sourceData, setSourceData] = useState(source);
  const mappingTemplate = JSON.stringify(sourceData, null, 2);
  const [mappingData, setMappingData] = useState(mappingTemplate);
  const templateObj = {};

  templateData?.forEach((t) => {
    if (t.key && t.value) {
      templateObj[t.key] = t.value;
    }
  });

  // setMappingData(JSON.stringify(templateObj, null, 2));
  // try {
  //   sourceData = { ...JSON.parse(mappingData), ...templateObj };
  //
  // } catch {
  //   sourceData = {};
  // }
  useEffect(() => {
    if (sourceData) {
      setMappingData(
        JSON.stringify({ ...sourceData, ...templateObj }, null, 2)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateData]);

  const handleChangeHandler = (e) => {
    setMappingData(e.target.value);

    try {
      const obj = JSON.parse(e.target.value);
      setSourceData({ ...obj, ...templateObj });
    } catch {
      setSourceData({});
    }
  };
  useEffect(() => {
    if (operation === 'del' && deletedValue) {
      const obj = JSON.parse(mappingData);
      if (deletedValue.key in obj) {
        delete obj[deletedValue.key];
      }
      setMappingData(JSON.stringify(obj, null, 2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedValue, operation]);

  localStorage.setItem('templateMapping', mappingData);

  return (
    <div className="textareaContainer">
      <textarea
        value={mappingData}
        placeholder="Update mapping template data"
        onChange={handleChangeHandler}
        className="textarea"
      />
      {/* {mappingTemplate && (
        <DownloadJSON
          jsonData={JSON.parse(mappingData)}
          fileName="template_mapping"
          title="Download Template"
          addMapping={false}
        />
      )} */}
    </div>
  );
};

export default AddMappingData;
