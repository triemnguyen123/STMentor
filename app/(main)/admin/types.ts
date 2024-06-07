export interface User {
    id: string;
    firstName: string;
    lastName: string;
}

export interface Program {
    _id: string;
    'Mã học phần': string;
    TenHocPhan: string;
    TC: number | undefined;
}

export interface CheckedItems {
    [key: string]: boolean;
}
