
const userInfoRegExp = new RegExp(/^[-_.!~*'&=+$,;?/%a-zA-Z0-9]+$/);
const macAddressRegExp = new RegExp(/^(?:[0-9A-Fa-f]{2}(?=([-:]|))(?:\1[0-9A-Fa-f]{2}){5})$/);

export function userInfo (value) {
    return userInfoRegExp.test(value);
}

export function userInfoAndEmpty(value) {
    if(value === '') {
        return true;
    }
    return userInfo(value);
}

export function customMacAddress (value) {
    return macAddressRegExp.test(value);
}


export function isPhone(value) {
    return /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{9})$/.test(value);
}
