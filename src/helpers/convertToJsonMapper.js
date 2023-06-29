import { source } from './mappingSource';
import { camelCase } from 'lodash';

export const convertToJsonMapper = (data) => {
  // Function to recursively convert keys
  function convertKeys(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(convertKeys);
    }

    const converted = {};
    for (const key in obj) {
      // const newKey = key.replace(
      //   /(^trn_)(\w+)/g,
      //   (match, group1, group2) =>
      //     'train' + group2.charAt(0).toUpperCase() + group2.slice(1)
      // );
      const keyData = getKeyIfKeyExists(key);
      let newKey = '';
      if (Array.isArray(source[keyData])) {
        source[keyData].forEach((k) => {
          newKey = camelCase(k);
          converted[newKey] = convertKeys(obj[key]);
        });
      } else {
        newKey = keyData !== undefined ? source[keyData] : camelCase(key);
        converted[newKey] = convertKeys(obj[key].trim());
      }
    }
    return converted;
  }
  // Convert the keys
  const convertedData = convertKeys(data);

  return JSON.stringify(convertedData, null, 2);
};

const getKeyIfKeyExists = (key) => {
  return Object.keys(source).find((k) => k.toLowerCase() === key.toLowerCase());
};

const convertToCamelCase = (input) => {
  var camelCaseString = input
    .replace(/_([a-zA-Z])/g, function (match, letter) {
      return letter.toUpperCase();
    })
    .replace(/_/g, '');

  return camelCaseString.charAt(0).toLowerCase() + camelCaseString.slice(1);
};
