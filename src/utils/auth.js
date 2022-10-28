import Cookies from 'js-cookie'

const TokenKey = 'hr-sass-token'  // 设定一个独一无二的key

const timeKey = 'hr-sass-time-key'  // 用来作为时间戳存储的key

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function setTimeStamp() {
  // 设置当前最新的时间戳
  // Date.now()  new Date.getTime()
  Cookies.set(timeKey, Date.now())
}

export function getTimeStamp() {
  return Cookies.get(timeKey)
}
