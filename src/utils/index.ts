

export const createRequestFunction = (method: string, fnName: string, url: string, query: Object): [string, string] => {
    const apiKey = fnName.replace(/[A-Z]/g, "_$&").toUpperCase();
    const apiStr = `${apiKey}: '${url}',`
    const typeName = fnName.replace(/^[a-z]{1,}[^A-Z]+/, '');
    const fnStr = `/**
    *
    ${Object.entries(query).reduce((pre, [key, value]) => pre + `* @param {${value.type === 'integer' ? 'number' : value.type}} ${key} ${value.description}
    `, '')}*/
   export const ${fnName} = ${query ? '(' + Object.entries(query).reduce((pre, [key, value], index) => {
        return `${pre}${key}: ${value.type === 'integer' ? 'number' : value.type}${index < Object.entries(query).length - 1 ? ',' : ''}`
    }, '') + ') =>' : ''}request<${typeName}>(API.${apiKey}, '${method.toLowerCase()}'${query ? ', { ' + Object.keys(query).join(',') + ' }' : ''})${query ? '()' : ''}
    `
    return [apiStr, fnStr];
}

export function objectToInterface(obj: Object, isFinal = false): string {
    if (obj.toString() !== '[object Object]') return ''
    const str = Object.entries(obj).reduce((pre, [key, value]) => pre + `${key}: ${value.type === 'integer' ? 'number' : value.type === 'object' ? objectToInterface(value.properties) : value.type === 'array' ? objectToInterface(value.items.properties) + '[]' : value.type};\r\n`, '{\r\n') + '}';
    if (isFinal) {
        console.log(str?.match(/{[\w\W]+}/g));
    }
    return ''
}


export const createType = (fnName: string, response: Object) => {
    const typeName = fnName.replace(/^[a-z]{1,}[^A-Z]+/, '');
    return `export interface {
      
    }`

}