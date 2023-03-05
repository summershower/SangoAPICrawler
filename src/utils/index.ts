import JSBeautify from 'js-beautify';
import { message } from 'antd';
import { SimpleAPIListItem } from '@/types';

const beautifyOptions = { indent_size: 2, space_in_empty_paren: true };

export const createRequestFunction = (method: string, fnName: string, url: string, query: Object, title: string, required: string[]): [string, string] => {
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
    ${Object.entries(query).reduce((pre, [key, value]) => pre + `* @param {${value.type === 'integer' ? 'number' : value.type}} ${key} ${value.description.replaceAll('\r', ' ').replaceAll('\n', ' ')}
    `, '')}*/
   export const ${fnName} = ${Object.keys(query).length ? '(' + Object.entries(query).sort(requireSortFn).reduce((pre, [key, value], index) => {
        return `${pre}${key}${required.includes(key) ? '' : '?'}: ${value.type === 'integer' ? 'number' : value.type}${index < Object.entries(query).length - 1 ? ',' : ''}`
    }, '') + ') =>' : ''}request<${typeName}>(API.${apiKey}, '${method.toLowerCase()}'${Object.keys(query).length ? ', { ' + Object.keys(query).join(',') + ' }' : ''})${Object.keys(query).length ? '();' : ';'}
    `
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
        const [apiStr, fnStr] = createRequestFunction(api.method, api.fnName, api.path, api.query || {}, api.title, api?.queryRequired || []);
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
    const str = Object.entries(obj).reduce((pre, [key, value]) => pre + `${key}?: ${value.type === 'integer' ? 'number' : value.type === 'object' ? objectToInterface(value.properties) : value.type === 'array' ? objectToInterface(value.items.properties) + '[]' : value.type};${value.description ? ' // ' + value.description.replaceAll('\r', ' ').replaceAll('\n', ' ') : ''}\r\n`, '{\r\n') + '}';
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
            raw = `interface 请命名${count++}` + key + '\r\n' + raw;
        }
    })
    const repeat2 = getRepeatInterface(raw);
    if (repeat2.some(([key, value]) => value.length > 1)) {
        raw = replaceRepeatInterface(raw, count + 1)
    }
    return raw
}
export const createRawType = (fnName: string, response: Object) => {
    const typeName = fnName.replace(/^[a-z]{1,}[^A-Z]+/, '');
    return `export interface ${typeName} ${objectToInterface(response)}`;
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

    resultText = JSBeautify(resultText, beautifyOptions);
    return resultText;
}

export const createMock = (apis: SimpleAPIListItem[]) => {
    let template = `import { useMock } from '@/utils/hooks';
    import * as requests from './requests';
    
    const mockData: Partial<Record<keyof typeof requests, Function | Object>> = {
    };
    
    export default useMock(requests, mockData);`
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