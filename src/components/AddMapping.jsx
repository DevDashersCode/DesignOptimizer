import { useState } from 'react';
import DownloadJSON from './DownloadJSON';
import AddMappingData from './MappingData';

const AddMapping = ({ userTemplateData }) => {
  const [data, setData] = useState([{ key: '', value: '', isDisable: true }]);
  const [finalData, setFinalData] = useState(data);
  const [operation, setOperation] = useState('');
  const [deletedValue, setDeletedValue] = useState(null);

  const onChangeHandler = (index, e) => {
    const { name, value } = e.target;
    const rows = [...data];
    rows[index][name] = value;
    setData(rows);

    if (rows[index] && rows[index].key && rows[index].value) {
      rows[index]['isDisable'] = false;
    } else {
      rows[index]['isDisable'] = true;
    }
  };

  const onAdd = () => {
    const rowData = { key: '', value: '', isDisable: true };
    const rows = [rowData, ...data];
    setData(rows);

    setFinalData(rows);
    setOperation('add');
  };

  const onRemove = (index) => {
    const rows = [...data];

    const deletedRow = rows.splice(index, 1);
    setDeletedValue(deletedRow[0]);
    setData(rows);
    setFinalData(rows);
    setOperation('del');
  };

  return (
    <>
      <div className="mappingContainer">
        <div className="column">
          <AddMappingData
            templateData={finalData}
            operation={operation}
            deletedValue={deletedValue}
            userTemplateData={userTemplateData}
          />
        </div>
        <div className="addMapping">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Key</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{index}</td>
                    <td>
                      <input
                        type="text"
                        value={data[index].key}
                        name="key"
                        onChange={(e) => onChangeHandler(index, e)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={data[index].value}
                        name="value"
                        onChange={(e) => onChangeHandler(index, e)}
                      />
                    </td>
                    <td className="table-buttons">
                      <button
                        className="addButtonBackground"
                        onClick={onAdd}
                        disabled={item.isDisable}
                      >
                        Add
                      </button>
                      {data.length > 1 && (
                        <button
                          className="removeButtonBackground"
                          onClick={() => onRemove(index)}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="marginTop">
        <DownloadJSON
          jsonData={JSON.parse(localStorage.getItem('templateMapping'))}
          fileName="template_mapping"
          title="Download Template"
          addMapping={true}
        />
      </div>
    </>
  );
};

export default AddMapping;
