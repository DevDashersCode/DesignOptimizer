import { getType } from './getType';

export const GenerateSchema = (
  level,
  name,
  jsonObject,
  consolidateName,
  options,
  version
) => {
  const jsonString = JSON.stringify(jsonObject);
  const tab = '	'.repeat(level + 1);
  const tabClose = '	'.repeat(level);

  let jsonSchema = '{\n';
  if (level === 0) {
    jsonSchema += tab + '"definitions": {},\n';
    jsonSchema += tab + `"$schema": "${version}", \n`;
  } else {
    // jsonSchema += tab + '"$id": "#' + consolidateName + name + '", \n';
  }
  jsonSchema +=
    tab +
    '"title": "' +
    (name.length
      ? name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase()
      : '') +
    '", \n';
  const type = getType(jsonObject);
  switch (type) {
    case 'boolean':
      jsonSchema += tab + '"type": "boolean",\n';
      if (options?.example)
        jsonSchema +=
          tab + '"examples": [\n' + tab + '	' + jsonString + '\n' + tab + '],\n';
      jsonSchema += tab + '"default": true\n' + tabClose + '}';
      break;
    case 'string':
      jsonSchema += tab + '"type": "string",\n';
      jsonSchema += tab + '"default": ""\n';
      if (options?.example)
        jsonSchema +=
          tab + ',"examples": [\n' + tab + '	' + jsonString + '\n' + tab + ']\n';
      jsonSchema += tab + '' + tabClose + '}';
      break;
    case 'integer':
      jsonSchema += tab + '"type": "integer",\n';
      if (options?.example)
        jsonSchema +=
          tab + '"examples": [\n' + tab + '	' + jsonString + '\n' + tab + '],\n';
      jsonSchema += tab + '"default": 0\n' + tabClose + '}';
      break;
    case 'number':
      jsonSchema += tab + '"type": "number",\n';
      if (options?.example)
        jsonSchema +=
          tab + '"examples": [\n' + tab + '	' + jsonString + '\n' + tab + '],\n';
      jsonSchema += tab + '"default": 0.0\n' + tabClose + '}';
      break;
    case 'null':
      jsonSchema += tab + '"type": "null",\n';
      jsonSchema += tab + '"default": null\n' + tabClose + '}';
      break;
    case 'array':
      jsonSchema += tab + '"type": "array",\n';
      jsonSchema += tab + '"default": []';

      const typeArray = [];
      jsonObject.forEach(function (key) {
        if (typeArray.indexOf(getType(key)) === -1) {
          typeArray.push(getType(key));
        }
      });
      if (typeArray.length === 0) {
        jsonSchema += '\n';
      } else if (typeArray.length === 1) {
        jsonSchema += ',\n';
        jsonSchema += tab + '"items":';
        jsonSchema +=
          GenerateSchema(
            level + 1,
            'items',
            jsonObject.shift(),
            consolidateName + name + '/',
            options
          ) + '\n';
      } else if (
        typeArray.length === 2 &&
        typeArray.indexOf('number') !== -1 &&
        typeArray.indexOf('integer') !== -1
      ) {
        jsonSchema += ',\n';
        jsonSchema += tab + '"items":';
        let nbFirst = null;
        jsonObject.forEach(function (nb) {
          if (getType(nb) === 'number' && nbFirst === null) {
            nbFirst = nb;
          }
        });
        jsonSchema +=
          GenerateSchema(
            level + 1,
            'items',
            nbFirst,
            consolidateName + name + '/',
            options
          ) + '\n';
      } else {
        jsonSchema += '\n';
      }
      jsonSchema += '' + tabClose + '}';
      break;
    case 'object':
    default:
      jsonSchema += tab + '"type": "object",\n';
      let required = '';
      let properties = '';
      for (var key in jsonObject) {
        if (jsonObject.hasOwnProperty(key)) {
          required += (required !== '' ? ',\n' : '') + tab + '	"' + key + '"';
          properties +=
            (properties !== '' ? ',\n' : '') +
            tab +
            '	"' +
            key +
            '": ' +
            GenerateSchema(
              level + 2,
              key,
              jsonObject[key],
              consolidateName + name + '/',
              options
            );
        }
      }
      if (properties !== '') {
        properties += '\n';
      }

      if (options?.required) {
        jsonSchema += tab + '"required": [\n';
        jsonSchema += required + (required !== '' ? '\n' : '');
        jsonSchema += tab + '],\n';
      }

      jsonSchema += tab + '"properties": {\n';
      jsonSchema += properties;
      jsonSchema += tab + '}\n';

      jsonSchema += '' + tabClose + '}\n';
      break;
  }
  return jsonSchema;
};
