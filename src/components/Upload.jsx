import { useCallback, useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useDropzone } from 'react-dropzone';
import DownloadJSON from './DownloadJSON';
import { generateGUID } from '../helpers/generateGUID';
import { convertToJsonMapper } from '../helpers/convertToJsonMapper';
import { GenerateSchema } from '../helpers/generateSchema';

const convertDropdown = [
  { id: 1, value: 'raw', label: 'Raw' },
  { id: 2, value: 'prepared', label: 'Prepared' },
];

const Upload = () => {
  const [csvData, setCsvData] = useState(null);
  const [downloadFile, setDownloadFile] = useState(false);
  const [finalData, setFinalData] = useState(null);
  const [selectedConversion, setSelectedConversion] = useState(
    convertDropdown[0].value
  );
  const [preparedData, setPreparedData] = useState(null);
  const [preparedSchema, setPreparedSchema] = useState(null);
  const [rawSchema, setRawSchema] = useState(null);
  const [fileName, setFileName] = useState('');

  const parseFile = useCallback((file) => {
    Papa.parse(file, {
      header: true,
      complete: (res) => setCsvData(res.data),
    });
  }, []);

  const onDrop = useCallback(
    (acceptedFiles) => {
      setDownloadFile(false);
      setCsvData(null);
      setPreparedData(null);
      setPreparedSchema(null);
      setFileName('');
      setRawSchema(null);
      acceptedFiles.forEach((file) => {
        const currentFileName = file.name.split('.')[0].toLowerCase();
        if (file.type === 'text/csv' && selectedConversion === 'raw') {
          parseFile(file);
          setDownloadFile(true);
          setFileName(`${currentFileName}-event-raw-v1-0.json`);
        }

        if (
          file.type === 'application/json' &&
          selectedConversion === 'prepared'
        ) {
          const reader = new FileReader();

          reader.onload = () => {
            const content = reader.result;
            const data = JSON.parse(content);
            const mapperData = convertToJsonMapper(data.message.data);
            setPreparedData(mapperData);
            setDownloadFile(true);
            setFileName(`${currentFileName}-event-prepared-v1-0.json`);
          };

          reader.readAsText(file);
        }
      });
    },
    [parseFile, selectedConversion]
  );

  const clearData = useCallback(() => {
    setDownloadFile(false);
    setCsvData(null);
  }, []);

  const onFileDialogOpen = () => clearData();
  const onDragEnter = () => clearData();

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    onDragEnter,
    onFileDialogOpen,
    accept: {
      'text/csv': [],
      'application/json': [],
    },
    multiple: false,
  });

  useEffect(() => {
    if (downloadFile) {
      setFinalData(null);
      let finalData;
      if (selectedConversion === 'raw') {
        finalData = {
          magic: 'atMSG',
          type: 'DT',
          messageSchemaId: null,
          messageSchema: null,
          message: {
            data: csvData && csvData[0],
          },
          headers: {
            operation: 'UPDATE',
            chanageSequence: generateGUID().replaceAll('-', ''),
            timestamp: `${new Date()}`,
            streamPosition: generateGUID().replaceAll('-', ''),
            transactionId: generateGUID().replaceAll('-', ''),
            transactionEventCounter: 1,
            transactionLastEvent: false,
          },
        };
      }

      if (selectedConversion === 'prepared') {
        finalData = {
          type: 'ca.cn.transportation',
          source: 'A108:SRS-YIT',
          id: generateGUID(),
          time: new Date(),
          datacontenttype: 'application/json',
          systemTrace: {
            correlationID: generateGUID(),
            inboundTimestamp: new Date(),
            outboundTimestamp: new Date(),
            messageCreationTimestamp: new Date(),
            naturalKey: 'CN19999',
          },
          data: JSON.parse(preparedData),
        };
      }

      // Genereate Schema for the prepared data
      const options = {
        required: true,
        example: true,
      };
      const version = 'http://json-schema.org/draft-07/schema#';
      const schema = GenerateSchema(0, 'root', finalData, '', options, version);

      if (selectedConversion === 'raw') {
        setRawSchema(JSON.parse(schema));
      }

      if (selectedConversion === 'prepared') {
        setPreparedSchema(JSON.parse(schema));
      }

      setFinalData(finalData);
    }
  }, [csvData, downloadFile, preparedData, selectedConversion]);

  useEffect(() => {
    setDownloadFile(false);
    setCsvData(null);
    setPreparedData(null);
    setPreparedSchema(null);
    setFileName('');
    setRawSchema(null);
  }, [selectedConversion]);

  const onConversionHandler = (event) => {
    setSelectedConversion(event.target.value);
  };

  return (
    <div>
      <div className="conversionDropDown">
        <p>Select conversion</p>
        <select value={selectedConversion} onChange={onConversionHandler}>
          {convertDropdown.map((version) => (
            <option key={version.value} value={version.value}>
              {version.label}
            </option>
          ))}
        </select>
      </div>
      <div
        {...getRootProps({
          className: `dropzone 
          ${isDragAccept && 'dropzoneAccept'} 
          ${isDragReject && 'dropzoneReject'}`,
        })}
      >
        <input {...getInputProps()} onClick={() => setDownloadFile(false)} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop file here, or click to select file</p>
        )}
      </div>
      <div className="conversionDropDown">
        <div>
          {downloadFile && (
            <DownloadJSON
              jsonData={finalData}
              title={'Download JSON'}
              fileName={fileName}
            />
          )}
        </div>
        <div>
          {downloadFile &&
            preparedSchema &&
            selectedConversion === 'prepared' && (
              <DownloadJSON
                jsonData={preparedSchema}
                title={'Download Prepared Schema'}
                fileName={`${
                  fileName.split('-')[0]
                }-event-prepared-schema-v1-0`}
              />
            )}
        </div>
        <div>
          {downloadFile && rawSchema && selectedConversion === 'raw' && (
            <DownloadJSON
              jsonData={rawSchema}
              title={'Download Raw Schema'}
              fileName={`${fileName.split('-')[0]}-event-raw-schema-v1-0`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
