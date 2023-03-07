import styles from './index.less'
import { getCookie, getMenu, getAPIs, getAPIInformation } from '@/requests';
import { useEffect, useState, useRef } from 'react';
import type { MenuItem, SimpleAPIListItem } from "@/types";
import { Select, Radio, Button, message, Space } from 'antd';
import type { RadioChangeEvent } from 'antd';
import APIItem from "./APIItem";
import Code from './Code'
export default function HomePage() {
  const [menus, setMenu] = useState<MenuItem[]>([]);
  const [currentMenu, setCurrentMenu] = useState<number>(101);
  const [currentActivity, setCurrentActivity] = useState<number>();
  const [Apis, setApis] = useState<SimpleAPIListItem[]>([]);
  const [formatMode, setFormatterMode] = useState<'R' | 'T' | 'M'>('R');
  const codeRef = useRef(null);

  useEffect(() => {
    getCookie().then(async () => {
      let menus = await getMenu(currentMenu);
      menus.sort((a, b) => b.add_time - a.add_time)
      setMenu(menus);
      setCurrentActivity(menus[0]._id);
    })
  }, [currentMenu])
  useEffect(() => {
    if (currentActivity) {
      getAPIs(currentActivity).then(r => {
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
            path: (currentMenu === 101 ? '/tactivity' : '/activity') + (currentMenu === 101 ? v.path : v.path.replace('/api', '')),
            title: v.title,
            id: v._id,
            fnName
          })
        })

        // 检查函数名
        s.some(v => {
          if (!/^[a-z]{1,}([A-Z]{1}[a-zA-Z0-9]+){1,}$/.test(v.fnName)) {
            message.warning("存在异常请求方法名，请手动输入")
          }
        })
        setApis(s);

        s.forEach(v => {
          getAPIInformation(v.id).then(res => {
            const query = JSON.parse(res?.['req_body_other'] || '{}')?.properties || {};
            const result = JSON.parse(res?.['res_body'] || '{}')?.properties?.data?.properties || (JSON.parse(res?.['res_body'] || '{}')?.properties?.data?.items?.properties ?
              JSON.parse(res?.['res_body'] || '{}')?.properties?.data
              : []) || {};
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
  }, [currentActivity])

  function handleChangeMenu(value: number) {
    setCurrentMenu(value);
  }
  function handleChangeActivity(value: number) {
    setCurrentActivity(value);
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
        <Space size={'large'}>
          <span >选择分类:</span>
          <Select
            style={{ width: 200 }}
            onChange={handleChangeMenu}
            value={currentMenu}
            options={[{
              value: 101,
              label: "临时活动服务"
            }, {
              value: 83,
              label: "活动服务"
            }]}
          />
          <span>选择活动:</span>
          <Select
            style={{ width: 300 }}
            showSearch
            onChange={handleChangeActivity}
            value={currentActivity}
            optionFilterProp="label"
            options={menus.map(v => {
              return {
                value: v._id,
                label: v.name
              }
            })}
          />
          <span style={{ marginLeft: "25px" }}>格式化文件:</span>
          <Radio.Group onChange={onChangeFormatMode} value={formatMode}>
            <Radio.Button value="R">Requests</Radio.Button>
            <Radio.Button value="T">Types</Radio.Button>
            <Radio.Button value="M">Mocks</Radio.Button>
          </Radio.Group>
          <Button type="primary" style={{ marginLeft: "25px" }} onClick={handleCopy}>复制代码</Button>
        </Space>
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
