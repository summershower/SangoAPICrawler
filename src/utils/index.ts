import JSBeautify from 'js-beautify';
import { message } from 'antd';
import { SimpleAPIListItem } from '@/types';

const beautifyOptions = { indent_size: 2, space_in_empty_paren: true, keep_array_indentation: true };

function resultToNote(obj: Object): string {
    if (obj?.toString() !== '[object Object]') return ''
    if ((obj as any).type === 'array') {
        return ` * @return {object[]} 返回对象数组 \n${resultToNote((obj as any).items.properties)}`
    }
    const str = Object.entries(obj).reduce((pre, [key, value]) => pre + ` * @return {${value.type === 'integer' ? 'number' : value.type}} ${key} ${ value?.description?.replaceAll('\n', ' ')?.replaceAll('\n', ' ') }\r\n`, '') ;
    return str
}

export const createRequestFunction = (method: string, fnName: string, url: string, query: Object, title: string, required: string[], result: Object): [string, string] => {
    const apiKey = fnName.replace(/[A-Z]/g, "_$&").toUpperCase();
    const apiStr = `${apiKey}: '${url}', // ${title}\r\n`
    const typeName = fnName.replace(/^[a-z]{1,}[^A-Z]+/, '');
    const requireSortFn = ([key1]: any[], [key2]: any[]) => {
        if (required.includes(key1) && !required.includes(key2)) {
            return -1;
        } else if (required.includes(key2) && !required.includes(key1)) {
            return 1;
        } else {
            return 0;
        }
    }
    const fnStr = `/**
    * ${title}
    ${Object.entries(query).sort(requireSortFn).reduce((pre, [key, value]) => pre + `* @param {${value.type === 'integer' ? 'number' : value.type}} ${key} ${value?.description?.replaceAll('\r', ' ')?.replaceAll('\n', ' ')}
    `, '')}${resultToNote(result)}*/
   export const ${fnName} = ${Object.keys(query).length ? '(' + Object.entries(query).sort(requireSortFn).reduce((pre, [key, value], index) => {
        return `${pre}${key}${required.includes(key) ? '' : '?'}: ${value.type === 'integer' ? 'number' : value.type}${index < Object.entries(query).length - 1 ? ',' : ''}`
    }, '') + ') =>' : ''}request${Object.keys(result).length ? '<' + typeName + '>' : ''}(API.${apiKey}, '${method.toLowerCase()}'${Object.keys(query).length ? ', { ' + Object.keys(query).sort((a, b) => required.indexOf(b) - required.indexOf(a)).join(',') + ' }' : ''})${Object.keys(query).length ? '();' : ';'}
    `;
    return [apiStr, fnStr];
}
export const createRequests = (apis: SimpleAPIListItem[]) => {
    let template = `import request from '@/api';
    import type { %T% } from './types';
    
    const API = {
        %A%
    };

    %F%
    `;
    let apiText = '';
    let fnText = '';
    let type: string[] = [];
    apis.forEach(api => {
        const [apiStr, fnStr] = createRequestFunction(api.method, api.fnName, api.path, api.query || {}, api.title, api?.queryRequired || [], api.result || {});
        apiText += apiStr;
        fnText += fnStr + '\r\n';
        const typeName = api.fnName.replace(/^[a-z]{1,}[^A-Z]+/, '');
        type.push(typeName);
    });
    template = template.replace('%T%', type.join(', ')).replace('%A%', apiText).replace('%F%', fnText);
    return JSBeautify(template, beautifyOptions)
}

export function objectToInterface(obj: Object): string {
    if (obj?.toString() !== '[object Object]') return ''
    if ((obj as any).type === 'array') {
        return `${objectToInterface((obj as any).items.properties)}[]`
    }
    const str = Object.entries(obj).reduce((pre, [key, value]) => pre + `${key}?: ${value.type === 'integer' ? 'number' : value.type === 'object' ? objectToInterface(value.properties) : value.type === 'array' ? objectToInterface(value.items.properties) + '[]' : value.type};${value.description ? ' // ' + value?.description?.replaceAll('\r', ' ')?.replaceAll('\n', ' ') : ''}\r\n`, '{\r\n') + '}';
    return str
}

const getRepeatInterface = (raw: string) => {
    const reg = /{[^{}]+}/g;
    const array = raw.match(reg);
    let record: Record<string, number[]> = {};
    array?.forEach((value, index) => {
        if (record[value]) {
            record[value].push(index)
        } else {
            record[value] = [index];
        }
    })
    return Object.entries(record);
}
export const replaceRepeatInterface = (raw: string, count = 1) => {
    const repeat = getRepeatInterface(raw);
    repeat.forEach(([key, value]) => {
        if (value.length > 1) {
            raw = raw.replaceAll(key, `请命名${count}`)
            const headIndex = raw.indexOf('😅') >= 0 ? raw.indexOf('😅') : raw.indexOf('export');
            raw = raw.slice(0, headIndex) + `export interface 请命名${count++}` + key + '\r\n😅' + raw.slice(headIndex);
        }
    })
    const repeat2 = getRepeatInterface(raw);
    if (repeat2.some(([key, value]) => value.length > 1)) {
        raw = replaceRepeatInterface(raw, count)
    }
    raw = raw.replaceAll('😅', '')
    return raw
}
export const createRawType = (fnName: string, response: Object) => {
    const typeName = fnName.replace(/^[a-z]{1,}[^A-Z]+/, '');
    return `export interface ${typeName} ${objectToInterface(response)}`;
}
const getOuterArray = (raw: string): string[] => {
    const reg = /export interface[^{]+{[^}]+}[^\[(export)]*\[](?!;)/g;
    const array = raw.match(reg) || [];
    return array;
}
const extractOuterArrayInterface = (raw: string): string => {
    const matches = getOuterArray(raw);
    let types = '';
    matches.forEach(v => {
        const key = v.match(/(?<=(export interface ))\w+(?!{)/)?.[0] || '';
        const content = v.match(/{[^}]+}/)?.[0] || '';
        raw = raw.replace(v, `export type ${key} = ${key}Item[]`)
        types += `export type ${key + 'Item'} = ${content}\n`
    })

    raw = types + raw;
    return raw
}

const getInsideArray = (raw: string): string[] => {
    const reg = /[\w]+\?[ ]*:[ ]*{[^[\]{}]+}\[]/g;
    const array = raw.match(reg) || [];
    return array;
}
const extractInsideArrayInterface = (raw: string): string => {
    const matches = getInsideArray(raw);
    let types = '';
    matches.forEach(v => {
        const key = v.match(/\w+(?=( )*\?( )*:( )*{)/)?.[0] || '';
        const content = v.match(/{[^}]+}/)?.[0] || '';
        raw = raw.replace(v, `${key}?:${key}Item[]`)
        types += `export interface ${key + 'Item'} ${content}\n`
    })
    raw = types + raw;
    if (getInsideArray(raw).length) {
        return extractInsideArrayInterface(raw)
    }
    return raw
}
export const createType = (apis: SimpleAPIListItem[]): string => {
    let resultText = '';
    apis.forEach(api => {
        if (api?.fnName && api?.result) {
            resultText += createRawType(api.fnName, api.result || {}) + '\r\n';
        }
    })
    resultText = replaceRepeatInterface(resultText);
    const interfaceToType = resultText.match(/export interface [\w]+ 请命名[\d]+/g);
    interfaceToType?.forEach(v => {
        resultText = resultText.replace(v, '😃');
        v = v.replace('interface ', 'type ').replaceAll('请命名', '= 请命名')
        resultText = resultText.replace('😃', v);
    })

    resultText = extractOuterArrayInterface(resultText);
    console.log(resultText);
    
    resultText = extractInsideArrayInterface(resultText);

    resultText = JSBeautify(resultText, beautifyOptions);
    return resultText;
}

export const replaceRepeatMock = (raw: string, count = 1) => {
    const repeat = getRepeatInterface(raw);
    repeat.forEach(([key, value]) => {
        if (value.length > 1) {
            raw = raw.replaceAll(key, `请命名${count}`)
            const headIndex = raw.indexOf('export');
            raw = raw.slice(0, headIndex) + `interface 请命名${count++}` + key + '\r\n' + raw.slice(headIndex);
        }
    })
    const repeat2 = getRepeatInterface(raw);
    if (repeat2.some(([key, value]) => value.length > 1)) {
        raw = replaceRepeatInterface(raw, count)
    }
    return raw
}


const createMockObject = (obj: Object): string => {
    if (obj?.toString() !== '[object Object]') return ''
    if ((obj as any).type === 'array') {
        return `mock({'array|20':[${createMockObject((obj as any).items.properties)}]}).array`
    }
    const str = Object.entries(obj).reduce((pre, [key, value]) => pre + `${value.type === 'array' ? '"' + key + '|20"' : key}: ${value.type === 'array' ? '[' : ''}${value.type === 'object' ? createMockObject(value.properties) : value.type === 'array' ? createMockObject(value.items.properties) : '"@' + value.type + '"'}${value.type === 'array' ? '] ' : ''},${value.description ? ' // ' + value?.description?.replaceAll('\r', ' ')?.replaceAll('\n', ' ') : ''}\r\n`, '{\r\n') + '}';
    return str
}
const createMockFn = (query: Object, required: string[], result: Object) => {
    const requireSortFn = ([key1]: any[], [key2]: any[]) => {
        if (required.includes(key1) && !required.includes(key2)) {
            return -1;
        } else if (required.includes(key2) && !required.includes(key1)) {
            return 1;
        } else {
            return 0;
        }
    }
    const fnText = '(' + Object.entries(query).sort(requireSortFn).reduce((pre, [key, value], index) => {
        return `${pre}${key}${required.includes(key) ? '' : '?'}: ${value.type === 'integer' ? 'number' : value.type === 'array' ? 'unknown[]' : value.type}${index < Object.keys(query).length - 1 ? ',' : ''}`
    }, '') + ') =>' + `{return  ${createMockObject(result)} },`;
    return fnText
}
export const createMock = (apis: SimpleAPIListItem[]) => {
    let template = `import { useMock } from '@/utils/hooks';
    import { Random, mock } from 'mockjs';
    import * as requests from './requests';
    
    const mockData: Partial<Record<keyof typeof requests, Function | Object>> = {
        %R%
    };
    
    export default useMock(requests, mockData);`
    let mockText = '';

    apis.forEach(api => {
        const keyNames = api.fnName;
        if (Object.keys(api?.query || {}).length) {
            mockText += keyNames + ':' + createMockFn(api?.query || {}, api?.queryRequired || [], api?.result || {});
        } else {
            mockText += keyNames + ':' + createMockObject(api?.result || {}) + ',';
        }
    })
    const output = template.replace('%R%', mockText);
    return JSBeautify(output, beautifyOptions)
}

export function copy(text: string): void {
    try {
        const textarea = document.createElement('textarea'); // js创建一个input输入框
        textarea.value = text; // 将需要复制的文本赋值到创建的input输入框中
        document.body.appendChild(textarea); // 将输入框暂时创建到实例里面
        textarea.setAttribute('readonly', 'readonly'); // 防止移动端弹起键盘
        textarea.setSelectionRange(0, textarea.value.length); // ios保证选区正确
        textarea.select(); // 选中输入框中的内容
        document.execCommand('Copy'); // 执行复制操作
        document.body.removeChild(textarea); // 最后删除实例中临时创建的input输入框，完成复制操作
        message.success(`复制成功`);
    } catch (e) {
        message.error('复制失败');
    }
}