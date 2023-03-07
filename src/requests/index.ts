import axios from 'axios';
import type { Method } from 'axios'
import type { ListRequest, MenuItem, APIInformationItem } from '@/types';
const request = async <T>(url: string, method: Method, data = {}): Promise<T> => {
    return new Promise((resolve, reject) => {
        axios({
            url,
            method,
            params: data,
            data
        }).then(res => {
            resolve(res?.data?.data || res?.data || res)
        }).catch(err => {
            reject(err);
        })
    })
}

export const getCookie = async () => {
    await request("/yapiProxy/user/login", 'post', {
        email: "luohaokai@meiqijiacheng.com",
        password: "123456"
    })

}

export const getMenu = (id: number) => {
    return request<MenuItem[]>("/yapiProxy/interface/list_menu?project_id=" + id, 'get');
}

export const getAPIs = (catid: number) => {
    return request<ListRequest>('/yapiProxy/interface/list_cat', 'get', {
        page: 1,
        limit: 100,
        catid
    })
}
export const getAPIInformation = (id: number) => {
    return request<APIInformationItem>('/yapiProxy/interface/get', 'get', {
        id
    })
}