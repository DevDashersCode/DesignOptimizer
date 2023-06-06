import React, { useState } from 'react';
import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import './App.css';

const ajv = new Ajv({ allErrors: true });
ajvFormats(ajv);
ajv.addKeyword('example');

function App() {
  const [jsonInput, setJsonInput] = useState('');
  const [schemaInput, setSchemaInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  const handleJsonInputChange = (event) => {
    setJsonInput(event.target.value);
  };

  const handleSchemaInputChange = (event) => {
    setSchemaInput(event.target.value);
  };

  const handleTestClick = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const parsedSchema = JSON.parse(schemaInput);
      const validate = ajv.compile(parsedSchema);
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
