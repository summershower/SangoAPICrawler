

export const createRequestFunction = (method: string, fnName: string, url: string, query: Object): [string, string] => {
    const apiKey = fnName.replace(/A-Z/g, "_$&").toUpperCase();
    const apiStr = `${apiKey}: '${url}',`
    const typeName = fnName.replace(/^[a-z]{1,}[^A-Z]+/, '');
    const fnStr = `/**
    *
    * @param {string} name 姓名
    */
   export const ${fnName} = ${query ? '(' + Object.entries(query).reduce((pre, [key, value]) => {
        return `${pre}${key}: ${value.type === 'integer' ? 'number' : value.type},`
    }, '') + ') =>' : ''}request<${typeName}>API.${apiKey}, '${method.toLowerCase()}'${query ? ', { ' + Object.keys(query).join(',') + ' }' : ''})${query ? '()' : ''}
    `
    return [apiStr, fnStr];
}


