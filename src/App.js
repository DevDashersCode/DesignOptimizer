import React, { useState } from 'react';
import Ajv from 'ajv';
import draft6MetaSchema from 'ajv/lib/refs/json-schema-draft-06.json';
import draft7MetaSchema from 'ajv/lib/refs/json-schema-draft-07.json';
import Ajv2020 from 'ajv/dist/2020';

import ajvFormats from 'ajv-formats';
import './App.css';
import { GenerateSchema } from './helpers/generateSchema';
import { GenerateJSON } from './helpers/generateJson';

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
  const [result, setResult] = useState(null);
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
        setResult('Success: Both JSON and JSON Schema are valid');
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

        setResult('Validation failed: ' + errorMessages.join(', '));
      }
    } catch (error) {
      console.error('Error parsing JSON or schema:', error);
      setResult('Error parsing JSON or schema');
    }
  };

  const handleGenerateSchema = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const options = {
        required: true,
        exemple: true,
      };
      const schema = GenerateSchema(0, 'root', parsedJson, '', options);
      setSchemaInput(schema);
      setJsonInput(JSON.stringify(parsedJson, null, 2));
      setSelectedVersion('draft7');
      setResult('Success: JSON Schema generated successfully');
    } catch (error) {
      console.error('Error generating schema:', error);
      setSchemaInput(null);
      setResult(`Failed to generate JSON Schema ${error}`);
    }
  };

  const handleGenerateJson = () => {
    try {
      const parsedSchema = JSON.parse(schemaInput);
      const options = {
        required: true,
      };
      const jsonData = GenerateJSON(1, parsedSchema, options);
      setJsonInput(jsonData);
      setSchemaInput(JSON.stringify(parsedSchema, null, 2));
      setResult('Success: JSON generated successfully');
    } catch (error) {
      console.error('Error generating schema:', error);
      setJsonInput(null);
      setResult(`Failed to generate JSON Schema ${error}`);
    }
  };

  return (
    <>
      <h2>JSON Schema Validator and Generator</h2>
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
          <div className="generatContainer">
            <h3 className="headerBackground ">JSON Input</h3>
            <button className="button" onClick={handleGenerateSchema}>
              Generate Schema
            </button>
          </div>
          <textarea
            value={jsonInput}
            onChange={handleJsonInputChange}
            placeholder="Enter JSON here"
            className="jsonInput"
          />
        </div>
        <div className="inputContainer">
          <div className="generatContainer">
            <h3 className="headerBackground ">Schema Input</h3>
            <button className="button" onClick={handleGenerateJson}>
              Generate JSON
            </button>
          </div>
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
        <button onClick={handleTestClick} className="button">
          Validate
        </button>
      </div>
      <div className="container">
        {result !== null && (
          <div>
            <p
              className={`validationResult ${
                result.startsWith('Success:') ? 'success' : 'error'
              }`}
            >
              {result}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
