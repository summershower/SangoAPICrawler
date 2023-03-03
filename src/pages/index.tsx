import APIList from "./APIList";
import styles from './index.less'
import { getCookie, getMenu } from '@/requests';
import { useEffect, useState } from 'react';
import type { MenuItem } from "@/types";
import { Select } from 'antd';
export default function HomePage() {
  const [menus, setMenu] = useState<MenuItem[]>([]);
  const [currentMenu, setCurrentMenu] = useState<number>();
  useEffect(() => {
    getCookie().then(async () => {
      let menus = await getMenu();
      menus.sort((a, b) => b.add_time - a.add_time)
      setMenu(menus);
      setCurrentMenu(menus[0]._id);
    })
  }, [])
  function handleChange(value: number) {
    setCurrentMenu(value);
  }
  return (
    <>
      <div className={styles.header}>
        <span>选择活动:</span>
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
      </div>
      <div className={styles.content}>
        <div className={styles.apis}>
          <APIList catId={currentMenu} />
        </div>
        <div className={styles.code}>
          Code格式
        </div>
      </div>
    </>
  );
}
