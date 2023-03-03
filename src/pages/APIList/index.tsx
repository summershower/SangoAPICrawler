
import { useEffect, useState } from 'react';
import { getCookie, getAPIs, getAPIInformation } from '@/requests';
import type { APIListItem, SimpleAPIListItem } from '@/types'
import styles from './index.less'
import APIItem from './Components/APIItem';
import { objectToInterface } from '@/utils'

export default function APIList({ catId }: { catId: number | undefined }) {
    const [Apis, setApis] = useState<SimpleAPIListItem[]>([]);
    const [ApiInformation, setApiInformation] = useState([]);
    useEffect(() => {
        if (!catId) return
        getAPIs(catId).then(r => {
            const s: SimpleAPIListItem[] = [];
            r.list?.forEach(v => {
                s.push({
                    method: v.method,
                    path: v.path,
                    title: v.title,
                    id: v._id
                })
            })
            setApis(s);

            s.forEach(v => {
                getAPIInformation(v.id).then(res => {
                    const query = JSON.parse(res?.['req_body_other'] || '{}');
                    const result = JSON.parse(res?.['res_body'] || '{}')?.properties?.data?.properties || {};
                    console.log(query, result);
                    console.log(objectToInterface(result,true));
                })
            })
        })
    }, [catId])
    return (
        <>
            {Apis.map(v => <APIItem info={v} key={v.id} />)}
        </>
    );
}
