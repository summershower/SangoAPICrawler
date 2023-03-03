export interface MenuItem {
    add_time: number;
    desc: string;
    index: number;
    list: unknown[];
    name: string;
    project_id: number;
    uid: number;
    up_time: number;
    ___v: number;
    _id: number;
}

export interface ListRequest {
    count: number; list: APIListItem[]; total: number;
}
export interface APIListItem {
    add_time: number;
    api_opened: boolean;
    catid: number;
    edit_uid: number;
    method: string;
    path: string;
    project_id: number;
    status: string;
    tag: unknown[];
    title: string;
    uid: number;
    _id: number;
}
export interface SimpleAPIListItem {
    id: number;
    method: string;
    path: string;
    title: string;
    query?: Object;
    result?: Object;
}
export interface APIInformationItem {
    add_time: number;
    api_opened: boolean;
    catid: number;
    desc?: string;
    edit_uid: number;
    index: number;
    path: string;
    project_id: number;
    query_path: unknown[];
    req_body_form: unknown[];
    req_body_is_json_schema: boolean;
    req_headers: unknown[];
    req_params: unknown[];
    req_query: unknown[];
    res_body_is_json_schema: boolean;
    res_body_type: string;
    status: string;
    tag: unknown[];
    type: string;
    uid: number;
    up_time: number;
    username: string;
    markdown?: string;
    method: string;
    req_body_other?: string;
    res_body?: string;
    title: string;
    __v: number;
    _id: number;
}
interface t {
    clubList: {
    clubId: string;
    clubName: string;
    clubUrl: string;
    score: number;
    rank: number;
    topUsers: {
    userId: string;
    locationId: string;
    displayUserId: string;
    headImgFileUrl: string;
    nickname: string;
    systemLanguage: string;
    gender: number;
    grade: number;
    createDate: string;
    deviceNo: string;
    }[];
    countryUrl: string;
    area: string;
    }[];
    totalNum: number;
    myRank: {
    clubId: string;
    clubName: string;
    clubUrl: string;
    score: number;
    rank: number;
    topUsers: {
    userId: string;
    locationId: string;
    displayUserId: string;
    headImgFileUrl: string;
    nickname: string;
    systemLanguage: string;
    gender: number;
    grade: number;
    createDate: string;
    deviceNo: string;
    }[];
    countryUrl: string;
    area: string;
    };
    }