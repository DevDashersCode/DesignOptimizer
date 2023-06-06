import React, { useState } from 'react';
import Ajv from 'ajv';
import draft6MetaSchema from 'ajv/lib/refs/json-schema-draft-06.json';
import draft7MetaSchema from 'ajv/lib/refs/json-schema-draft-07.json';
import Ajv2020 from 'ajv/dist/2020';

import ajvFormats from 'ajv-formats';
import './App.css';

const ajv = new Ajv({ allErrors: true, strict: false });
const ajv2020 = new Ajv2020({ allErrors: true, strict: false });

if (!ajv.getSchema('http://json-schema.org/draft-07/schema')) {
  ajv.addMetaSchema(draft7MetaSchema);
}

if (!ajv.getSchema('http://json-schema.org/draft-06/schema')) {
  ajv.addMetaSchema(draft6MetaSchema);
}

ajvFormats(ajv);
ajv.addKeyword('example');

const schemaVersions = [
  { value: 'draft6', label: 'Draft 6' },
  { value: 'draft7', label: 'Draft 7' },
  { value: 'draft2020', label: 'Draft 2020' },
];

function App() {
  const [jsonInput, setJsonInput] = useState('');
  const [schemaInput, setSchemaInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [additionalProperties, setAdditionalProperties] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(
    schemaVersions[2].value
  );

  const handleJsonInputChange = (event) => {
    setJsonInput(event.target.value);
  };

  const handleSchemaInputChange = (event) => {
    setSchemaInput(event.target.value);
  };

  const handleAdditionalPropertiesChange = (event) => {
    setAdditionalProperties(event.target.checked);
  };

  const handleVersionChange = (event) => {
    setSelectedVersion(event.target.value);
  };

  const handleTestClick = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const parsedSchema = JSON.parse(schemaInput);

      if (!additionalProperties) {
        parsedSchema.additionalProperties = false;
      }

      let validate;

      switch (selectedVersion) {
        case 'draft6':
          validate = ajv.compile(parsedSchema);
          break;
        case 'draft7':
          validate = ajv.compile(parsedSchema);
          break;
        case 'draft2020':
          validate = ajv2020.compile(parsedSchema);
          break;
        default:
          validate = ajv2020.compile(parsedSchema);
          break;
      }

      const isValid = validate(parsedJson);

      if (isValid) {
        setValidationResult('Validation successful!');
      } else {
        const errorMessages = validate.errors.map((error) => {
          if (error.keyword === 'additionalProperties') {
            return `Additional property "${error.params.additionalProperty}" is not allowed`;
          } else if (error.keyword === 'required') {
            return `Required property "${error.params.missingProperty}" is missing`;
          } else {
            return error.message;
          }
        });

        setValidationResult('Validation failed: ' + errorMessages.join(', '));
      }
    } catch (error) {
      console.error('Error parsing JSON or schema:', error);
      setValidationResult('Error parsing JSON or schema');
    }
  };

  return (
    <>
      <div className="container">
        <div className="inputContainer">
          <h3>Schema Version</h3>
          <select value={selectedVersion} onChange={handleVersionChange}>
            {schemaVersions.map((version) => (
              <option key={version.value} value={version.value}>
                {version.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="container">
        <div className="inputContainer">
          <h3>JSON Input</h3>
          <textarea
            value={jsonInput}
            onChange={handleJsonInputChange}
            placeholder="Enter JSON here"
            className="jsonInput"
          />
        </div>
        <div className="inputContainer">
          <h3>Schema Input</h3>
          <textarea
            value={schemaInput}
            onChange={handleSchemaInputChange}
            placeholder="Enter schema here"
            className="schemaInput"
          />
        </div>
      </div>
      <div className="container">
        <label>
          <input
            type="checkbox"
            checked={additionalProperties}
            onChange={handleAdditionalPropertiesChange}
          />
          Allow Additional Properties
        </label>
      </div>
      <div className="container">
        <button onClick={handleTestClick} className="testButton">
          Validate
        </button>
      </div>
      <div className="container">
        {validationResult !== null && (
          <div>
            <p
              className={`validationResult ${
                validationResult.startsWith('Validation successful!')
                  ? 'success'
                  : 'error'
              }`}
            >
              {validationResult}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
