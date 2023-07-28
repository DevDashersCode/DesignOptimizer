import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const updateDataInExcel = (dataObj, uploadedWorkbook, insertAfter) => {
  const uploadedWorksheet =
    uploadedWorkbook.Sheets[uploadedWorkbook.SheetNames[0]];

  let insertRowIndex = insertAfter ? 0 : 1;
  let rowIndex = 1;

  // Find the row index labeled "DATA-begin"
  while (!insertRowIndex) {
    const cellAddress = `A${rowIndex}`;
    const cellValue = uploadedWorksheet[cellAddress]
      ? uploadedWorksheet[cellAddress].v
      : '';
    if (cellValue === insertAfter) {
      insertRowIndex = rowIndex + 1; // Insert after the "DATA-begin" row
    } else {
      rowIndex++;
    }
  }

  if (insertRowIndex) {
    const updatedWorkbook = XLSX.utils.book_new();
    const updatedWorksheet = insertAfter
      ? XLSX.utils.sheet_to_json(uploadedWorksheet, {
          header: 1,
        })
      : XLSX.utils.sheet_to_json(XLSX.utils.aoa_to_sheet([]), {
          header: 1,
        });
    XLSX.utils.book_append_sheet(
      updatedWorkbook,
      uploadedWorksheet,
      uploadedWorkbook.SheetNames[0]
    );

    if (!insertAfter) {
      const headerRow = Object.keys(dataObj[0]);
      updatedWorksheet.splice(insertRowIndex, 0, headerRow);
    }

    // Insert the new data rows
    dataObj.forEach((data, index) => {
      const row = Object.keys(data).map((key) => data[key]);
      updatedWorksheet.splice(insertRowIndex + index, 0, row);
    });

    // Convert the updated worksheet data back to a worksheet object
    const worksheetData = XLSX.utils.aoa_to_sheet(updatedWorksheet);

    // Assign the updated worksheet data to the cloned worksheet
    updatedWorkbook.Sheets[updatedWorkbook.SheetNames[0]] = worksheetData;

    // Generate a random file name for the updated file
    const timestamp = new Date().getTime();
    const fileName = `updated_file_${timestamp}.xlsx`;

    // Generate a Blob from the workbook data
    const wbout = XLSX.write(updatedWorkbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    // Save the file using FileSaver.js
    saveAs(blob, fileName);
  } else {
    console.log(`Row labeled ${insertAfter} not found.`);
  }
};

const DownloadXLSX = ({ data, workbook, insertAfter }) => {
  return (
    <div>
      <button
        className="button"
        onClick={() => updateDataInExcel(data, workbook, insertAfter)}
      >
        Download mapping excel
      </button>
    </div>
  );
};

export default DownloadXLSX;
