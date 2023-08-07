import { camelCase } from 'lodash';

const getKeyIfKeyExists = (key, source) => {
  return Object.keys(source).find((k) => k === key);
};

export const getDataObject = (data) => {
  for (const key in data) {
    if (typeof data[key] === 'object') {
      if (key === 'data') {
        return data[key];
      } else {
        const obj = getDataObject(data[key]);
        if (obj) {
          return obj;
        }
      }
    }
  }
};

const convertKeys = (obj, source) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj) && obj.length > 0) {
    if (
      obj.every((item) => typeof item === 'number') ||
      obj.every((item) => typeof item !== 'string')
    ) {
      return obj;
    } else {
      // return obj.map((item) => convertKeys(item, source));
      // taking only the 1 obj from array
      return convertKeys(obj[0], source);
    }
  }

  const convertedData = [];
  const converted = {};

  for (const key in obj) {
    let newKey = '';
    const keyValue = key;

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (Array.isArray(obj[key]) && obj[key].length > 0) {
        if (
          obj[key].every((item) => typeof item !== 'number') &&
          obj[key].every((item) => typeof item !== 'string')
        ) {
          // const nestedArrayResult = obj[key].map((nestedObj) =>
          //   convertKeys(nestedObj, source)
          // );
          // taking only the 1st object in array
          converted[camelCase(key)] = obj[key][0];
          convertedData.push({
            from: '',
            to: camelCase(key),
            value: '',
          });
          const nestedArrayResult = convertKeys(obj[key][0], source);
          converted[camelCase(key)] = [nestedArrayResult.converted];
          convertedData.push(...nestedArrayResult.mappingDetails);
        } else {
          let newKey = camelCase(key);
          converted[newKey] = obj[key];
          convertedData.push({
            from: key,
            to: newKey,
            value: obj[key],
          });
        }
        // const nestedArrayResult = obj[key].map((nestedObj) =>
        //   convertKeys(nestedObj, source)
        // );
      } else {
        converted[camelCase(key)] = obj[key];
        convertedData.push({
          from: '',
          to: camelCase(key),
          value: '',
        });
        const nestedResult = convertKeys(obj[key], source);
        converted[camelCase(key)] = nestedResult.converted;
        convertedData.push(...nestedResult.mappingDetails);
      }
    } else if (Array.isArray(source[keyValue])) {
      source[keyValue].forEach((k) => {
        newKey = camelCase(k);
        converted[newKey] = obj[key].trim();
        convertedData.push({
          from: key,
          to: newKey,
          value: obj[key].trim(),
        });
      });
    } else {
      const keys = key.split('_');
      keys.forEach((k) => {
        if (newKey) {
          newKey += '-';
        }
        const keyData = getKeyIfKeyExists(k, source);
        newKey += keyData !== undefined ? source[keyData] : camelCase(k);
      });
      newKey = camelCase(newKey);
      converted[newKey] = obj[key];
      convertedData.push({
        from: key,
        to: newKey,
        value: obj[key],
      });
    }
  }

  return {
    mappingDetails: convertedData,
    converted,
  };
};

export const convertToJsonMapper = (data, userTemplate) => {
  const source = userTemplate ?? localStorage.getItem('templateMapping');
  const dataObj = getDataObject(data);
  const convertedData = convertKeys(dataObj, source);
  return convertedData;
};
