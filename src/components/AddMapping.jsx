import { useState } from 'react';
import DownloadJSON from './DownloadJSON';

const AddMapping = () => {
  const [data, setData] = useState([{ key: '', value: '', isDisable: true }]);

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
    const rows = [...data, rowData];
    setData(rows);
  };

  const onRemove = (index) => {
    console.log(index);
    const rows = [...data];
    console.log(rows);
    rows.splice(index, 1);
    setData(rows);
  };

  return (
    <div className="mappingContainer">
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
                <td>
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
      {data.length > 1 && (
        <DownloadJSON
          jsonData={data}
          fileName="template_mapping"
          title="Generate Template Mapping"
          addMapping={true}
        />
      )}
    </div>
  );
};

export default AddMapping;
