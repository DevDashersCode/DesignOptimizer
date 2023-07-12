// import { source } from './mappingSource';
import { camelCase } from 'lodash';

const getKeyIfKeyExists = (key, source) => {
  return Object.keys(source).find((k) => k === key);
};

const getDataObject = (data) => {
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
  // console.log(obj);
  if (Array.isArray(obj)) {
    console.log(obj);
    if (
      obj.every((item) => typeof item === 'number') ||
      obj.every((item) => typeof item !== 'string')
    ) {
      return obj;
    } else {
      return obj.map((item) => convertKeys(item, source));
    }
  }

  const convertedData = [];
  const converted = {};

  for (const key in obj) {
    let newKey = '';
    const keyValue = key;

    if (typeof obj[key] === 'object') {
      if (Array.isArray(obj[key])) {
        console.log(obj[key]);
        if (
          obj[key].every((item) => typeof item !== 'number') &&
          obj[key].every((item) => typeof item !== 'string')
        ) {
          const nestedArrayResult = obj[key].map((nestedObj) =>
            convertKeys(nestedObj, source)
          );
          converted[camelCase(key)] = nestedArrayResult.map(
            (nestedResult) => nestedResult.converted
          );
          convertedData.push(
            ...nestedArrayResult.flatMap(
              (nestedResult) => nestedResult.mappingDetails
            )
          );
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
        const nestedResult = convertKeys(obj[key], source);
        converted[camelCase(key)] = nestedResult.converted;
        convertedData.push(...nestedResult.mappingDetails);
      }
    } else if (Array.isArray(source[keyValue])) {
      let values = '';
      source[keyValue].forEach((k) => {
        newKey = camelCase(k);
        converted[newKey] = obj[key].trim();
        values = values + ',' + k;
      });
      convertedData.push({
        from: key,
        to: values.replace(/(^,)|(,$)/g, ''),
        value: obj[key].trim(),
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
  const source = userTemplate;
  const dataObj = getDataObject(data);
  const convertedData = convertKeys(dataObj, source);
  return convertedData;
};

// const convertKeys = (obj) => {
//   if (typeof obj !== 'object' || obj === null) {
//     return obj;
//   }

//   if (Array.isArray(obj)) {
//     return obj.map(convertKeys);
//   }
//   const convertedData = [];
//   const converted = {};
//   for (const key in obj) {
//     let newKey = '';
//     const keyValue = key.toUpperCase();

//     if (Array.isArray(source[keyValue])) {
//       let values = '';
//       source[keyValue].forEach((k) => {
//         newKey = camelCase(k);
//         converted[newKey] = obj[key].trim();
//         values = values + ',' + k;
//       });
//       convertedData.push({
//         from: key,
//         to: values.replace(/(^,)|(,$)/g, ''),
//         value: obj[key].trim(),
//       });
//     } else {
//       const keys = key.split('_');
//       // eslint-disable-next-line no-loop-func
//       keys.forEach((k) => {
//         if (newKey) {
//           newKey += '-';
//         }
//         const keyData = getKeyIfKeyExists(k);
//         newKey += keyData !== undefined ? source[keyData] : camelCase(k);
//       });
//       newKey = camelCase(newKey);
//       converted[newKey] = obj[key].trim();
//       convertedData.push({
//         from: key,
//         to: newKey,
//         value: obj[key].trim(),
//       });
//     }
//   }
//   console.log('final converted', converted);
//   return {
//     mappingDetails: convertedData,
//     converted,
//   };
// };
