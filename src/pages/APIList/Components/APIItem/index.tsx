import styles from './index.less';
import type { SimpleAPIListItem } from "@/types";
import { Input } from 'antd'
import { useState, useEffect } from 'react';
export default function APIItem({ info }: { info: SimpleAPIListItem }) {
    const [inputContent, setInputContent] = useState('');
    useEffect(() => {
        const words = info.path.split('/');
        if (words.length) {
            const lastWord = words[words.length - 1]?.[0]?.toUpperCase() + words[words.length - 1].slice(1);
            setInputContent(info.method.toLowerCase() + lastWord);
        }
    }, [])
    return <div className={styles.container}>
        <div className={styles.header}>
            <div className={styles?.[info?.method?.toLowerCase()] + ' ' + styles.tag}>{info?.method?.toUpperCase()}</div>
            <div className={styles.title}>{info.title}</div>
        </div>
        <div className={styles.path}>{info?.path}</div>
        <div className={styles.name}>
            <span>函数名：</span>
            <Input placeholder='输入请求函数名(驼峰命名)' value={inputContent} onChange={(e) => setInputContent(e.target.value)} status={/^[a-z]{1,}[A-Z]{1}\w+/.test(inputContent) ? '' : 'error'}/>
        </div>
    </div>
}
