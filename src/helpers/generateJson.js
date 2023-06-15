import { randexp as RandExp } from 'randexp';

export const GenerateJSON = (level, jsonObject, options) => {
  let json = null;
  const tab = '	'.repeat(level);
  const tabClose = '	'.repeat(level - 1);
  if (!jsonObject) {
    return '';
  }
  if (
    jsonObject.enum &&
    Array.isArray(jsonObject.enum) &&
    jsonObject.enum.length
  ) {
    return tab + jsonObject.enum.pop();
  }
  if (jsonObject.const) {
    return tab + jsonObject.const;
  }
  switch (jsonObject.type) {
    case 'boolean':
      if (
        jsonObject.examples &&
        Array.isArray(jsonObject.examples) &&
        jsonObject.examples.length
      ) {
        return jsonObject.examples.pop();
      }
      return 'true';
    case 'string':
      if (
        jsonObject.examples &&
        Array.isArray(jsonObject.examples) &&
        jsonObject.examples.length
      ) {
        return (
          '"' +
          jsonObject.examples
            .pop()
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"') +
          '"'
        );
      }
      if (jsonObject.pattern) {
        try {
          return (
            '"' +
            new RandExp(new RegExp(jsonObject.pattern))
              .gen()
              .replace(/\\/g, '\\\\')
              .replace(/"/g, '\\"') +
            '"'
          );
        } catch (e) {}
      }
      return '""';
    case 'integer':
      if (
        jsonObject.examples &&
        Array.isArray(jsonObject.examples) &&
        jsonObject.examples.length
      ) {
        return jsonObject.examples.pop();
      }
      return '0';
    case 'number':
      if (
        jsonObject.examples &&
        Array.isArray(jsonObject.examples) &&
        jsonObject.examples.length
      ) {
        return jsonObject.examples.pop();
      }
      return '0.0';
    case 'null':
      return 'null';
    case 'array':
      json = '[\n';
      if (jsonObject.items) {
        if (Array.isArray(jsonObject.items)) {
          jsonObject.items.forEach(function (item, index) {
            json +=
              tab +
              GenerateJSON(level + 1, item, options) +
              (index !== jsonObject.items.length - 1 ? ',' : '') +
              '\n';
          });
        } else if (jsonObject.items.type) {
          const iter =
            jsonObject.minItems && jsonObject.minItems > 0
              ? jsonObject.minItems
              : 1;
          for (let it = 1; it <= iter; it++) {
            json +=
              tab +
              GenerateJSON(level + 1, jsonObject.items, options) +
              (it < iter ? ',\n' : '\n');
          }
        }
      } else if (jsonObject.contains) {
        json +=
          tab + GenerateJSON(level + 1, jsonObject.contains, options) + '\n';
      }
      json += tabClose + ']';
      return json;
    case 'object':
      json = '{\n';
      if (jsonObject.properties) {
        let properties = [];
        if (options?.required) {
          if (jsonObject.required) {
            properties = jsonObject.required;
          }
        } else {
          properties = Object.keys(jsonObject.properties);
        }
        properties.forEach(function (property, index) {
          json +=
            tab +
            '"' +
            property +
            '":' +
            GenerateJSON(level + 1, jsonObject.properties[property], options) +
            (index !== properties.length - 1 ? ',\n' : '\n');
        });
      }
      json += tabClose + '}';
      return json;
    default:
      return '';
  }
};
