
import { javascript } from '@codemirror/lang-javascript';
import { EditorView, basicSetup } from 'codemirror';
import type { SimpleAPIListItem } from '@/types';
import styles from './index.less'
import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { createType, createRequests, createMock } from '@/utils';
import { copy } from '@/utils';
let view: EditorView;
let content = '';
const Code = forwardRef<{ handleCopy: Function }, { apis: SimpleAPIListItem[], formatMode: 'R' | 'T' | 'M' }>(({ apis, formatMode }, refName) => {
    // 初始化编辑器
    function initEditor(content: string) {
        if (view) {
            view.destroy();
        }
        // 编辑器拓展插件
        const extendsArr = [
            basicSetup,
            javascript(),
            EditorView.lineWrapping,

        ];
        view = new EditorView({
            doc: content,
            extensions: extendsArr,
            parent: document.querySelector('#code') as HTMLElement,
        });
    }

    useEffect(() => {
        let nextContent = ''
        if (formatMode === 'R') {
            nextContent = createRequests(apis);
        } else if (formatMode === 'T') {
            nextContent = createType(apis);
        } else if (formatMode === 'M') {
            nextContent = createMock(apis);
        }

        if (nextContent !== content) {
            initEditor(nextContent);
        }
    });
    //  复制编辑器文本内容
    function handleCopy() {
        copy(view.state.toJSON().doc);
    }
    useImperativeHandle(refName, () => {
        return { handleCopy }
    }, []);
    return <div id='code'></div>;
})
export default Code;