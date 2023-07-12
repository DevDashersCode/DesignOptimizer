import { useCallback, useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useDropzone } from 'react-dropzone';
import DownloadJSON from './DownloadJSON';
import { generateGUID } from '../helpers/generateGUID';
import { convertToJsonMapper } from '../helpers/convertToJsonMapper';
import { GenerateSchema } from '../helpers/generateSchema';
import AddMapping from './AddMapping';
import {
  GeneratePreparedExcel,
  GenerateRawExcel,
} from '../helpers/generateExcelData';
import convertToCSV from '../helpers/convertToCSV';
import DownloadCSV from './DownloadCSV';
import { camelCase } from 'lodash';
import { read } from 'xlsx';
import DownloadXLSX from './DownloadXLSX';

const convertDropdown = [
  { id: 1, value: 'raw', label: 'Raw' },
  { id: 2, value: 'prepared', label: 'Prepared' },
];
console.log(camelCase('MaintenanceNotification'));
const templateDropdown = [
  { id: 1, value: 'no', label: 'No' },
  { id: 2, value: 'yes', label: 'Yes' },
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
  const [templateFileName, setTemplateFileName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(
    templateDropdown[0].value
  );
  const [userTemplate, setUserTemplate] = useState(null);
  const [mappingDetails, setMappingDetails] = useState(null);
  const [downloadableCSVData, setDownloadableCSVData] = useState('');
  const [downloadExcelFile, setDownloadExcelFile] = useState(false);
  const [uploadedWorkbook, setUploadedWorkbook] = useState(null);
  const [excelData, setExcelData] = useState(null);

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
      setMappingDetails(null);
      setDownloadableCSVData('');
      setExcelData(null);
      acceptedFiles.forEach((file) => {
        console.log(file.type);
        const currentFileName = file.name.split('.')[0].toLowerCase();
        if (file.type === 'text/csv' && selectedConversion === 'raw') {
          parseFile(file);
          setDownloadFile(true);
          setFileName(`${currentFileName}-event-raw-v1-0.json`);
        }

        if (
          file.type === 'application/json' &&
          selectedConversion === 'prepared' &&
          userTemplate
        ) {
          const reader = new FileReader();

          reader.onload = () => {
            const content = reader.result;
            const data = JSON.parse(content);
            const convertedData = convertToJsonMapper(data, userTemplate);
            const { mappingDetails, converted } = convertedData;
            setMappingDetails(mappingDetails);
            setPreparedData(converted);
            setDownloadFile(true);
            setFileName(`${currentFileName}-event-prepared-v1-0.json`);
          };

          reader.readAsText(file);
        }
        console.log(userTemplate);
        if (
          file.type === 'application/json' &&
          selectedConversion === 'prepared' &&
          userTemplate === null
        ) {
          const reader = new FileReader();
          console.log(reader);
          reader.onload = () => {
            const content = reader.result;
            const data = JSON.parse(content);
            console.log(data);
            setUserTemplate(data);
            setTemplateFileName(file.name);
          };
          reader.readAsText(file);
        }

        if (
          file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
          console.log(file);
          const reader = new FileReader();
          reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            console.log(data);
            const workbook = read(data, { type: 'array' });
            setUploadedWorkbook(workbook);
            console.log(workbook);
          };

          reader.readAsArrayBuffer(file);
        }
      });
    },
    [parseFile, selectedConversion, userTemplate]
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
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
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
          data: preparedData,
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

      console.log(finalData);

      if (
        selectedConversion === 'raw' &&
        finalData &&
        finalData?.message?.data
      ) {
        const data = GenerateRawExcel(finalData);
        setExcelData(data);
        const csvString = convertToCSV(data);
        setDownloadableCSVData(csvString);
      }

      if (selectedConversion === 'prepared' && finalData && finalData?.data) {
        const data = GeneratePreparedExcel(mappingDetails);
        setExcelData(data);
        const csvString = convertToCSV(data);
        setDownloadableCSVData(csvString);
      }

      setFinalData(finalData);
    }
  }, [csvData, downloadFile, mappingDetails, preparedData, selectedConversion]);

  useEffect(() => {
    setDownloadFile(false);
    setCsvData(null);
    setPreparedData(null);
    setPreparedSchema(null);
    setFileName('');
    setRawSchema(null);
    setUserTemplate(null);
    setTemplateFileName('');
    setMappingDetails(null);
    setDownloadableCSVData('');
    setExcelData(null);
  }, [selectedConversion, selectedTemplate]);

  const onConversionHandler = (event) => {
    setSelectedConversion(event.target.value);
  };

  const onTemplateHandler = (event) => {
    setSelectedTemplate(event.target.value);
  };

  let dragDropText = '';
  let dragDropLabel = '';

  if (selectedConversion === 'raw') {
    dragDropText = (
      <p>Drag 'n' drop csv file here, or click to select csv file</p>
    );
    dragDropLabel = <p>Please select CSV file</p>;
  }

  if (selectedConversion === 'prepared' && selectedTemplate === 'no') {
    dragDropLabel = <p>Please create teamplate mapping</p>;
  }

  if (
    selectedConversion === 'prepared' &&
    selectedTemplate === 'yes' &&
    userTemplate === null
  ) {
    dragDropText = (
      <p>Drag 'n' drop template file here, or click to select template file</p>
    );
    dragDropLabel = <p>Please select template file</p>;
  }

  if (
    selectedConversion === 'prepared' &&
    selectedTemplate === 'yes' &&
    downloadExcelFile &&
    !uploadedWorkbook
  ) {
    dragDropText = (
      <p>
        Drag 'n' drop excel template file here, or click to select excel
        template file
      </p>
    );
    dragDropLabel = <p>Please select excel template file</p>;
  } else if (
    selectedConversion === 'prepared' &&
    selectedTemplate === 'yes' &&
    userTemplate
  ) {
    dragDropText = (
      <p>Drag 'n' drop raw file here, or click to select raw file</p>
    );
    dragDropLabel = <p>Please select raw file</p>;
  }

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
      {selectedConversion === 'prepared' && (
        <div className="conversionDropDown">
          <p>Do you have template mapping ?</p>
          <select value={selectedTemplate} onChange={onTemplateHandler}>
            {templateDropdown.map((template) => (
              <option key={template.value} value={template.value}>
                {template.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {templateFileName && (
        <p>You have selected tempalate mapping: {templateFileName}</p>
      )}
      {templateFileName && (
        <label>
          <input
            type="checkbox"
            checked={downloadExcelFile}
            onChange={() => setDownloadExcelFile(!downloadExcelFile)}
          />
          <span className="checkBoxLabel">
            Wanted to download mapping excel file{' '}
          </span>
        </label>
      )}
      {dragDropLabel}
      {(selectedConversion === 'raw' ||
        (selectedConversion === 'prepared' && selectedTemplate === 'yes')) && (
        <div
          {...getRootProps({
            className: `dropzone 
          ${isDragAccept && 'dropzoneAccept'} 
          ${isDragReject && 'dropzoneReject'}`,
          })}
        >
          <input {...getInputProps()} onClick={() => setDownloadFile(false)} />
          {isDragActive ? <p>Drop the files here ...</p> : dragDropText}
        </div>
      )}
      {selectedConversion === 'prepared' && selectedTemplate === 'no' && (
        <AddMapping />
      )}
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
          {downloadFile &&
            preparedSchema &&
            selectedConversion === 'prepared' &&
            downloadableCSVData && (
              <DownloadCSV
                csvData={downloadableCSVData}
                title={'Download prepared mapping CSV'}
                fileName={'prepared-mapping.csv'}
              />
            )}
        </div>

        {downloadFile && rawSchema && selectedConversion === 'raw' && (
          <DownloadJSON
            jsonData={rawSchema}
            title={'Download Raw Schema'}
            fileName={`${fileName.split('-')[0]}-event-raw-schema-v1-0`}
          />
        )}
        {downloadFile &&
          rawSchema &&
          selectedConversion === 'raw' &&
          downloadableCSVData && (
            <DownloadCSV
              csvData={downloadableCSVData}
              title={'Download raw mapping CSV'}
              fileName={'raw-mapping.csv'}
            />
          )}

        {downloadFile &&
          rawSchema &&
          downloadableCSVData &&
          selectedConversion === 'raw' &&
          downloadExcelFile &&
          uploadedWorkbook &&
          excelData && (
            <DownloadXLSX data={excelData} workbook={uploadedWorkbook} />
          )}

        {downloadFile &&
          preparedSchema &&
          downloadableCSVData &&
          selectedConversion === 'prepared' &&
          downloadExcelFile &&
          uploadedWorkbook &&
          excelData && (
            <DownloadXLSX data={excelData} workbook={uploadedWorkbook} />
          )}
      </div>
    </div>
  );
};

export default Upload;
