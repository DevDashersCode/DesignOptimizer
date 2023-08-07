import { getDataObject } from './convertToJsonMapper';

export function updateObjectWithGivenData(originalObject, givenData) {
  // Recursive function to update 'data' key at any nesting level
  function updateDataKey(obj, data) {
    let isUpdated = false;
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        // If the current property is an object, check for the 'data' key
        if (key === 'data') {
          // Merge the 'data' key with the given data
          obj[key] = Object.assign(obj[key], getDataObject(data));
          isUpdated = true;
        } else {
          // Recursively search for the 'data' key in nested objects
          updateDataKey(obj[key], data);
        }
      }
    }
    if (!isUpdated) {
      obj = { ...obj, ...data };
    }

    return obj;
  }

  // Check if the givenData object has any properties
  if (Object.keys(givenData).length === 0) {
    console.log('Given data is empty. No updates will be made.');
    return originalObject;
  }

  // Check if the 'data' key exists at any level in the originalObject
  const obj = updateDataKey(originalObject, givenData);
  return obj;
}
