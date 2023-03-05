import styles from './index.less';
import type { SimpleAPIListItem } from "@/types";
import { Input, Spin, Tree } from 'antd'
import { useState, useEffect, memo, ChangeEvent, ChangeEventHandler } from 'react';
import type { DataNode } from 'antd/es/tree';
import { DownOutlined } from '@ant-design/icons';
import { copy } from '@/utils';

const APIItem = ({ info, setApis }: { info: SimpleAPIListItem, setApis: Function }) => {
    const [inputContent, setInputContent] = useState('');
    useEffect(() => {
        const words = info.path.split('/');
        if (words.length) {
            const lastWord = words[words.length - 1]?.[0]?.toUpperCase() + words[words.length - 1].slice(1);
            setInputContent(info.method.toLowerCase() + lastWord);
        }
    }, [])
    const typeMap: any = {
        integer: '数字',
        array: '数组',
        object: '对象',
        string: '字符',
        boolean: '布尔',
    }
    const TreeTitle = (key: string, type: string, desc: string) => {
        return (
            <div className={styles.treeTitle}>
                <div className={styles.typeTag + ' ' + styles[type]}>{typeMap?.[type]}</div>
                {/* <div className={styles.keyName + ' ' + styles[type]}>{key}</div> */}
                {/* <div className={styles.keyName + ' ' + styles[type]}>{type}</div> */}
                <div className={styles.keyName}>{key}</div>
                <div className={styles.desc}>{desc}</div>
            </div>
        )
    }
    const handleInputFnName = (e: any) => {
        setApis((pre: SimpleAPIListItem[]) => pre.map(v => {
            if (v.id === info.id) {
                v.fnName = e.target.value;
                localStorage.setItem(String(v.id), e.target.value);
            }
            return v
        }))
    }
    const resultToTree = (result: unknown, currentKey = '0-') => {
        if (result?.toString() === '[object Object]') {
            const tree: DataNode[] = [];
            Object.entries(result).forEach(([key, value], index) => {
                tree.push({
                    title: TreeTitle(key, value.type, value.description),
                    key: currentKey + index,
                    children: value.properties ? resultToTree(value.properties, currentKey + index + '-') : [],
                })
            })
            return tree;
        } else {
            return []
        }
    }

    return <div className={styles.container}>
        <div className={styles.header}>
            <div className={styles?.[info?.method?.toLowerCase()] + ' ' + styles.tag}>{info?.method?.toUpperCase()}</div>
            <div className={styles.title + ' ' + info?.method}>{info.title}</div>
        </div>
        <div className={styles.path}>{info?.path}</div>
        <div className={styles.name}>
            <span>函数名：</span>
            <Input placeholder='输入请求函数名(驼峰命名)' value={info.fnName} onChange={handleInputFnName} status={/^[a-z]{1,}[A-Z]{1}\w+/.test(inputContent) ? '' : 'error'} />
        </div>
        {info.query !== undefined || info.result !== undefined ? <div className={styles.details}>
            {info.query && <div className={styles.query}>
                <h3>参数</h3>
                <Tree treeData={resultToTree(info.query)} switcherIcon={<DownOutlined />} selectable={false} />

            </div>}
            {resultToTree(info.result).length > 0 && <div className={styles.result}>
                <h3>返回值</h3>
                <Tree treeData={resultToTree(info.result)} switcherIcon={<DownOutlined />} selectable={false} />
            </div>}
        </div> : <Spin className={styles.spin} tip="读取API数据中..." />}
    </div>
}
export default APIItem;