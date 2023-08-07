import { useCallback, useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useDropzone } from 'react-dropzone';
import DownloadJSON from './DownloadJSON';
import { generateGUID } from '../helpers/generateGUID';
import {
  convertToJsonMapper,
  getDataObject,
} from '../helpers/convertToJsonMapper';
import { GenerateSchema } from '../helpers/generateSchema';
import AddMapping from './AddMapping';
import {
  GeneratePreparedExcel,
  GenerateRawExcel,
} from '../helpers/generateExcelData';
import convertToCSV from '../helpers/convertToCSV';
import DownloadCSV from './DownloadCSV';
import { read } from 'xlsx';
import * as XLSX from 'xlsx';
import DownloadXLSX from './DownloadXLSX';
import { generateInBoundData } from '../helpers/generateInBoundData';
import RawTemplate from './RawTemplate';

const convertDropdown = [
  { id: 1, value: 'raw', label: 'Raw' },
  { id: 2, value: 'prepared', label: 'Prepared' },
];

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
  const [preparedData, setPreparedData] = useState(
    JSON.parse(localStorage.getItem('rawData'))
  );
  const [preparedSchema, setPreparedSchema] = useState(null);
  const [rawSchema, setRawSchema] = useState(null);
  const [fileName, setFileName] = useState('');
  const [templateFileName, setTemplateFileName] = useState('userTemplate.json');
  const [excelTemplateFileName, setExcelTemplateFileName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(
    templateDropdown[0].value
  );
  const [userTemplate, setUserTemplate] = useState();
  const [mappingDetails, setMappingDetails] = useState(null);
  const [downloadableCSVData, setDownloadableCSVData] = useState('');
  const [downloadExcelFile, setDownloadExcelFile] = useState(false);
  const [uploadedWorkbook, setUploadedWorkbook] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showDownloadButtons, setShowDownloadButtons] = useState(false);
  const [rawFileName, setRawFileName] = useState('');
  const [inboundData, setInboundData] = useState(null);
  const [inboundWorkbook, setInboundWorkbook] = useState(null);
  const [inboundDBMapperFile, setInboundDBMapperFile] = useState('');
  const [rawPreparedData, setRawPreparedData] = useState(null);

  useEffect(() => {
    setUserTemplate(localStorage.getItem('templateMapping'));
    setRawPreparedData(localStorage.getItem('rawData'));
  }, []);

  const handleNext = () => {
    if (activeStep === 0) {
      setUserTemplate(localStorage.getItem('templateMapping'));
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setShowDownloadButtons(false);

    if (activeStep === 1) {
      const data = JSON.parse(localStorage.getItem('rawData'));
      const obj = getDataObject(data);

      if (obj && Object.keys(obj).length > 0) {
        setPreparedData(data);
        GeneratePreparedData(data);
      }
    }
  };

  const handleFinish = () => {
    setShowDownloadButtons(true);
  };

  const handleBack = () => {
    if (activeStep !== 0) {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
      setShowDownloadButtons(false);
      setMappingDetails(null);
      setPreparedData(null);
      setRawPreparedData(null);
      setFileName('');
    } else {
      setSelectedConversion(convertDropdown[0].value);
    }
  };

  const parseFile = useCallback((file) => {
    Papa.parse(file, {
      header: true,
      complete: (res) => setCsvData(res.data),
    });
  }, []);

  const handleProceedWithPrepared = () => {
    setSelectedConversion(convertDropdown[1].value);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      if (selectedConversion !== 'raw') {
        const data = localStorage.getItem('rawData');
        const obj = getDataObject(JSON.parse(data));
        if (obj) {
          setUserTemplate(localStorage.getItem('templateMapping'));
          GeneratePreparedData(JSON.parse(data));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDrop = useCallback(
    (acceptedFiles) => {
      // setDownloadFile(false);
      // setCsvData(null);
      // setPreparedData(null);
      // setPreparedSchema(null);
      // setFileName('');
      // setRawSchema(null);
      // // setMappingDetails(null);
      // setDownloadableCSVData('');
      // setExcelData(null);
      // setRawFileName('');
      // setInboundData(null);
      // setInboundWorkbook(null);
      // setInboundDBMapperFile('');
      acceptedFiles.forEach((file) => {
        const currentFileName = file.name.split('.')[0].toLowerCase();
        if (file.type === 'text/csv' && selectedConversion === 'raw') {
          parseFile(file);
          setDownloadFile(true);
          setFileName(`${currentFileName}-event-raw-v1-0.json`);
        }

        if (
          file.type === 'application/json' &&
          selectedConversion === 'prepared' &&
          activeStep === 2
        ) {
          const reader = new FileReader();

          reader.onload = () => {
            const content = reader.result;
            const data = JSON.parse(content);
            setRawPreparedData(data);
            GeneratePreparedData(data, file, currentFileName);
            localStorage.setItem('rawData', content);
          };

          reader.readAsText(file);
        }
        if (
          file.type === 'application/json' &&
          selectedConversion === 'prepared' &&
          activeStep === 0
        ) {
          const reader = new FileReader();
          reader.onload = () => {
            const content = reader.result;
            const data = JSON.parse(content);
            setUserTemplate(data);
            setTemplateFileName(file.name);
          };
          reader.readAsText(file);
        }
        if (
          file.type ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
          activeStep === 1
        ) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = read(data, { type: 'array' });
            setUploadedWorkbook(workbook);
            setExcelTemplateFileName(file.name);
          };

          reader.readAsArrayBuffer(file);
        } else if (
          file.type ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
          mappingDetails &&
          activeStep === 3
        ) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            const objectData = XLSX.utils.sheet_to_json(sheet);
            const inbound = generateInBoundData(objectData, mappingDetails);
            setInboundData(inbound);
            setInboundWorkbook(workbook);
            setInboundDBMapperFile(file.name);
          };

          reader.readAsArrayBuffer(file);
        }
      });
    },
    // [
    //   activeStep,
    //   excelTemplateFileName,
    //   mappingDetails,
    //   parseFile,
    //   selectedConversion,
    //   uploadedWorkbook,
    //   userTemplate,
    // ]
    [activeStep, mappingDetails, parseFile, selectedConversion, userTemplate]
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
        // finalData = {
        //   magic: 'atMSG',
        //   type: 'DT',
        //   messageSchemaId: null,
        //   messageSchema: null,
        //   message: {
        //     data: csvData && csvData[0],
        //   },
        //   headers: {
        //     operation: 'UPDATE',
        //     chanageSequence: generateGUID().replaceAll('-', ''),
        //     timestamp: `${new Date()}`,
        //     streamPosition: generateGUID().replaceAll('-', ''),
        //     transactionId: generateGUID().replaceAll('-', ''),
        //     transactionEventCounter: 1,
        //     transactionLastEvent: false,
        //   },
        // };
        const localRawData = JSON.parse(localStorage.getItem('rawData'));
        finalData = localRawData ? { ...localRawData } : {};
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

      if (selectedConversion === 'raw' && finalData) {
        const data = GenerateRawExcel(finalData);
        setExcelData(data);
        const csvString = convertToCSV(data);
        setDownloadableCSVData(csvString);
      }

      if (selectedConversion === 'prepared' && finalData) {
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
    setActiveStep(0);
    // setCsvData(null);
    // setPreparedData(null);
    // setPreparedSchema(null);
    // setFileName('');
    // setRawSchema(null);
    // setUserTemplate(null);
    // setTemplateFileName('');
    // setExcelTemplateFileName('');
    // setMappingDetails(null);
    // setDownloadableCSVData('');
    // setExcelData(null);
    // setRawFileName('');
    // setInboundData(null);
    // setInboundWorkbook(null);
    // setInboundDBMapperFile('');
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
    (selectedTemplate === 'yes' || userTemplate)
  ) {
    dragDropText = (
      <p>Drag 'n' drop raw file here, or click to select raw file</p>
    );
    dragDropLabel = <p>Please select raw file</p>;
  }

  const nextDisabled = () => {
    if (activeStep === 0) {
      return !(
        userTemplate !== null ||
        (userTemplate && Object.keys(userTemplate).length > 0)
      );
    }

    if (activeStep === 1) {
      return !(downloadExcelFile ? excelTemplateFileName !== '' : true);
    }

    if (activeStep === 2) {
      return !rawFileName;
    }

    return true;
  };

  const onTemplateDeleteHandler = () => {
    setTemplateFileName('');
    setUserTemplate(null);
  };

  const GeneratePreparedData = (data, file, currentFileName) => {
    const template = userTemplate ?? localStorage.getItem('templateMapping');
    const convertedData = convertToJsonMapper(data, JSON.parse(template));
    // const { mappingDetails, converted } = convertedData;
    setMappingDetails(convertedData?.mappingDetails);
    setPreparedData(convertedData?.converted);
    setDownloadFile(true);
    setRawFileName(
      file?.name ??
        'Raw data content selected from previous step. Please select different raw if needed'
    );
    setShowDownloadButtons(false);
    setFileName(`${currentFileName ?? 'raw'}-event-prepared-v1-0.json`);
  };

  return (
    <>
      <div className="prepared-container ">
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
            <div className="steps-container">
              <div className="stepper">
                <div
                  className="step"
                  style={{
                    backgroundColor: activeStep === 0 ? '#CC0200' : '#E0E0E0',
                  }}
                >
                  1
                </div>
                <div
                  className="step"
                  style={{
                    backgroundColor: activeStep === 1 ? '#CC0200' : '#E0E0E0',
                  }}
                >
                  2
                </div>
                <div
                  className="step"
                  style={{
                    backgroundColor: activeStep === 2 ? '#CC0200' : '#E0E0E0',
                  }}
                >
                  3
                </div>
                <div
                  className="step"
                  style={{
                    backgroundColor: activeStep === 3 ? '#CC0200' : '#E0E0E0',
                  }}
                >
                  4
                </div>
              </div>
              <div className="stepContent">
                {activeStep === 0 && (
                  <div>
                    <div className="conversionDropDown">
                      <p>Do you have template mapping ?</p>
                      <select
                        value={selectedTemplate}
                        onChange={onTemplateHandler}
                      >
                        {templateDropdown.map((template) => (
                          <option key={template.value} value={template.value}>
                            {template.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {templateFileName && (
                      <p>
                        You have selected tempalate mapping: {templateFileName}
                        <span>
                          <button
                            className={`button template-delete-button`}
                            onClick={onTemplateDeleteHandler}
                          >
                            Delete
                          </button>
                        </span>
                      </p>
                    )}
                    {selectedConversion === 'prepared' && (
                      <div>
                        <>
                          <AddMapping userTemplateData={userTemplate} />
                          {(selectedConversion === 'raw' ||
                            (selectedConversion === 'prepared' &&
                              selectedTemplate === 'yes')) &&
                            !userTemplate && (
                              <div
                                {...getRootProps({
                                  className: `dropzone 
          ${isDragAccept && 'dropzoneAccept'} 
          ${isDragReject && 'dropzoneReject'}`,
                                })}
                              >
                                <input
                                  {...getInputProps()}
                                  onClick={() => setDownloadFile(false)}
                                />
                                {isDragActive ? (
                                  <p>Drop the files here ...</p>
                                ) : (
                                  `Drag 'n' drop template file here, or click to select template file`
                                )}
                              </div>
                            )}
                        </>
                      </div>
                    )}
                  </div>
                )}
                {activeStep === 1 && (
                  <>
                    <div>
                      {templateFileName && (
                        <label>
                          <input
                            type="checkbox"
                            checked={downloadExcelFile}
                            onChange={() =>
                              setDownloadExcelFile(!downloadExcelFile)
                            }
                          />
                          <span className="checkBoxLabel">
                            Wanted to download mapping excel file{' '}
                          </span>
                        </label>
                      )}
                      {excelTemplateFileName && downloadExcelFile && (
                        <p>
                          You have selected excel tempalate mapping:{' '}
                          {excelTemplateFileName}
                        </p>
                      )}
                    </div>
                    <div>
                      {(selectedConversion === 'raw' ||
                        (selectedConversion === 'prepared' &&
                          selectedTemplate === 'yes')) &&
                        downloadExcelFile &&
                        userTemplate &&
                        !uploadedWorkbook && (
                          <div
                            {...getRootProps({
                              className: `dropzone 
          ${isDragAccept && 'dropzoneAccept'} 
          ${isDragReject && 'dropzoneReject'}`,
                            })}
                          >
                            <input
                              {...getInputProps()}
                              onClick={() => setDownloadFile(false)}
                            />
                            {isDragActive ? (
                              <p>Drop the files here ...</p>
                            ) : (
                              `Drag 'n' drop excel template file here, or click to select excel template file`
                            )}
                          </div>
                        )}
                    </div>
                  </>
                )}
                {activeStep === 2 && (
                  <div>
                    {(selectedConversion === 'raw' ||
                      (selectedConversion === 'prepared' &&
                        (selectedTemplate === 'yes' || userTemplate))) && (
                      <>
                        <div>
                          <p>Please select raw file</p>
                          <p>
                            {rawFileName &&
                              `You have selected raw template file: ${rawFileName}`}
                          </p>
                        </div>
                        <div className="raw-layout">
                          <div
                            {...getRootProps({
                              className: `dropzone 
          ${isDragAccept && 'dropzoneAccept'} 
          ${isDragReject && 'dropzoneReject'}`,
                            })}
                          >
                            <input
                              {...getInputProps()}
                              onClick={() => setDownloadFile(false)}
                            />
                            {isDragActive ? (
                              <p>Drop the files here ...</p>
                            ) : (
                              dragDropText
                            )}
                          </div>
                          <RawTemplate
                            data={
                              rawPreparedData?.data
                                ? rawPreparedData
                                : JSON.parse(
                                    localStorage.getItem('rawData'),
                                    null,
                                    2
                                  )
                            }
                          />
                        </div>
                      </>
                    )}
                    {selectedConversion === 'prepared' && (
                      <div className="conversionDropDown">
                        <div>
                          {downloadFile && mappingDetails && preparedData && (
                            <DownloadJSON
                              jsonData={finalData}
                              title={'Download JSON'}
                              fileName={fileName}
                            />
                          )}
                        </div>
                        <div>
                          {downloadFile &&
                            mappingDetails &&
                            preparedData &&
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
                            mappingDetails &&
                            preparedData &&
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

                        {downloadFile &&
                          mappingDetails &&
                          preparedData &&
                          rawSchema &&
                          selectedConversion === 'raw' && (
                            <DownloadJSON
                              jsonData={rawSchema}
                              title={'Download Raw Schema'}
                              fileName={`${
                                fileName.split('-')[0]
                              }-event-raw-schema-v1-0`}
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
                          excelData &&
                          activeStep === 1 && (
                            <DownloadXLSX
                              data={excelData}
                              workbook={uploadedWorkbook}
                            />
                          )}

                        {downloadFile &&
                          preparedSchema &&
                          downloadableCSVData &&
                          selectedConversion === 'prepared' &&
                          downloadExcelFile &&
                          uploadedWorkbook &&
                          excelData && (
                            <DownloadXLSX
                              data={excelData}
                              workbook={uploadedWorkbook}
                              insertAfter={'DATA - begin'}
                            />
                          )}
                      </div>
                    )}
                  </div>
                )}
                {activeStep === 3 && (
                  <div>
                    {(selectedConversion === 'raw' ||
                      (selectedConversion === 'prepared' &&
                        (selectedTemplate === 'yes' || userTemplate))) && (
                      <>
                        <div>
                          <p>Please select DB Mapper file</p>
                          <p>
                            {inboundDBMapperFile &&
                              `You have selected DB Mapper file: ${inboundDBMapperFile}`}
                          </p>
                        </div>
                        <div
                          {...getRootProps({
                            className: `dropzone 
          ${isDragAccept && 'dropzoneAccept'} 
          ${isDragReject && 'dropzoneReject'}`,
                          })}
                        >
                          <input
                            {...getInputProps()}
                            onClick={() => setDownloadFile(false)}
                          />
                          {isDragActive ? (
                            <p>Drop the files here ...</p>
                          ) : (
                            `Drag 'n' drop DB Mapper excel file here, or click to select DB Mapper excel file`
                          )}
                        </div>
                      </>
                    )}
                    {selectedConversion === 'prepared' &&
                      showDownloadButtons && (
                        <div className="conversionDropDown">
                          <div>
                            {inboundData && (
                              <DownloadXLSX
                                data={inboundData}
                                workbook={inboundWorkbook}
                              />
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
              <div className="step-button-container">
                <button
                  className="step-button"
                  style={{ marginRight: '8px' }}
                  // disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </button>

                {activeStep !== 3 && (
                  <button
                    className="step-button"
                    style={{ marginLeft: '8px' }}
                    onClick={handleNext}
                    disabled={activeStep === 2 ? nextDisabled() : false}
                  >
                    Next
                  </button>
                )}
                {activeStep === 3 && (
                  <button
                    className="step-button"
                    style={{ marginLeft: '8px' }}
                    onClick={handleFinish}
                  >
                    Finish
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div>
          {selectedConversion === 'raw' && (
            <div className="raw-layout">
              <div
                {...getRootProps({
                  className: `dropzone 
          ${isDragAccept && 'dropzoneAccept'} 
          ${isDragReject && 'dropzoneReject'}`,
                })}
              >
                <input
                  {...getInputProps()}
                  onClick={() => setDownloadFile(false)}
                />
                {isDragActive ? <p>Drop the files here ...</p> : dragDropText}
              </div>
              <RawTemplate data={{ data: csvData ? csvData[0] : {} }} />
            </div>
          )}
        </div>
        {selectedConversion === 'raw' && (
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
              rawSchema &&
              selectedConversion === 'raw' &&
              downloadableCSVData && (
                <div>
                  <button
                    className="step-button"
                    style={{ marginLeft: '8px' }}
                    onClick={handleProceedWithPrepared}
                  >
                    Proceed With Prepared
                  </button>
                </div>
              )}

            {downloadFile &&
              preparedSchema &&
              downloadableCSVData &&
              selectedConversion === 'prepared' &&
              downloadExcelFile &&
              uploadedWorkbook &&
              excelData && (
                <DownloadXLSX
                  data={excelData}
                  workbook={uploadedWorkbook}
                  insertAfter={'DATA - begin'}
                />
              )}
          </div>
        )}
      </div>
    </>
  );
};

export default Upload;
