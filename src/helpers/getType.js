export const getType = (jsonObject) => {
  switch (typeof jsonObject) {
    case 'boolean':
      return 'boolean';
    case 'string':
      return 'string';
    case 'bigint':
      return 'integer';
    case 'number':
      if (
        JSON.stringify(jsonObject).indexOf('.') !== -1 ||
        JSON.stringify(jsonObject).indexOf('e') !== -1
      )
        return 'number';
      else {
        return 'integer';
      }
    default:
      if (jsonObject === null) {
        return 'null';
      } else if (Array.isArray(jsonObject)) {
        return 'array';
      }
  }
  return 'object';
};
