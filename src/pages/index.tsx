import styles from './index.less'
import { getCookie, getMenu, getAPIs, getAPIInformation } from '@/requests';
import { useEffect, useState, useRef } from 'react';
import type { MenuItem, SimpleAPIListItem } from "@/types";
import { Select, Radio, Button, message } from 'antd';
import type { RadioChangeEvent } from 'antd';
import APIItem from "./APIItem";
import Code from './Code'
export default function HomePage() {
  const [menus, setMenu] = useState<MenuItem[]>([]);
  const [currentMenu, setCurrentMenu] = useState<number>();
  const [Apis, setApis] = useState<SimpleAPIListItem[]>([]);
  const [formatMode, setFormatterMode] = useState<'R' | 'T' | 'M'>('R');
  const codeRef = useRef(null);

  useEffect(() => {
    getCookie().then(async () => {
      let menus = await getMenu();
      menus.sort((a, b) => b.add_time - a.add_time)
      setMenu(menus);
      setCurrentMenu(menus[0]._id);
    })
  }, [])
  useEffect(() => {
    if (currentMenu) {
      getAPIs(currentMenu).then(r => {
        const s: SimpleAPIListItem[] = [];
        r.list?.forEach(v => {
          const words = v.path.split('/');
          let fnName: string
          if (localStorage.getItem(String(v._id))) {
            fnName = localStorage.getItem(String(v._id)) || '';
          } else {
            if (words.length) {
              const lastWord = words[words.length - 1]?.[0]?.toUpperCase() + words[words.length - 1].slice(1);
              fnName = (v.method.toLowerCase() + lastWord);
            } else {
              fnName = ''
            }
          }

          s.push({
            method: v.method,
            path: v.path,
            title: v.title,
            id: v._id,
            fnName
          })
        })

        // 检查函数名
        s.some(v => {
          if (!/^[a-z]{1,}[A-Z]{1}\w+/.test(v.fnName)) {
            message.warning("存在异常请求方法名，请手动输入")
          }
        })
        setApis(s);

        s.forEach(v => {
          getAPIInformation(v.id).then(res => {
            const query = JSON.parse(res?.['req_body_other'] || '{}')?.properties || {};
            const result = JSON.parse(res?.['res_body'] || '{}')?.properties?.data?.properties || JSON.parse(res?.['res_body'] || '{}')?.properties?.data?.items?.properties || {};
            const queryRequired = JSON.parse(res?.['req_body_other'] || '{}')?.required || [];
            const resultRequired = JSON.parse(res?.['res_body'] || '{}')?.required || [];

            setApis(pre => pre.map(item => {
              if (item.id === v.id) {
                Object.keys(query).length ? (item.query = query) : (item.query = null)
                Object.keys(result).length ? (item.result = result) : (item.result = null)
                item.queryRequired = queryRequired;
              }
              return item;
            })
            )
          })
        })
      })
    }
  }, [currentMenu])

  function handleChange(value: number) {
    setCurrentMenu(value);
  }
  function onChangeFormatMode(e: RadioChangeEvent) {
    setFormatterMode(e.target.value);
  }
  function handleCopy() {
    (codeRef.current as any)?.handleCopy?.();
  }
  return (
    <>
      <div className={styles.header}>
        <span className={styles.mr}>选择活动:</span>
        <Select
          style={{ width: 400 }}
          showSearch
          onChange={handleChange}
          value={currentMenu}
          optionFilterProp="label"
          options={menus.map(v => {
            return {
              value: v._id,
              label: v.name
            }
          })}
        />
        <span className={styles.mr} style={{ marginLeft: "25px" }}>格式化文件:</span>
        <Radio.Group onChange={onChangeFormatMode} value={formatMode}>
          <Radio.Button value="R">Requests</Radio.Button>
          <Radio.Button value="T">Types</Radio.Button>
          <Radio.Button value="M">Mocks</Radio.Button>
        </Radio.Group>
        <Button type="primary" style={{ marginLeft: "25px" }} onClick={handleCopy}>复制代码</Button>

      </div>
      <div className={styles.content}>
        <div className={styles.apis}>
          {Apis.map(v => <APIItem info={v} key={v.id} setApis={setApis} />)}
        </div>
        <div className={styles.code}>
          <Code apis={Apis} formatMode={formatMode} ref={codeRef} />
        </div>
      </div>
    </>
  );
}
