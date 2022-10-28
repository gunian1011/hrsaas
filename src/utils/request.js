
import axios from 'axios'
import store from '@/store'
import router from '@/router'
import { Message } from 'element-ui'
import { getTimeStamp } from '@/utils/auth'
const TimeOut = 5000 // 定义超时时间

const service = axios.create({
  // 当执行 npm run dev => .evn.development => /api => 跨域代理
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5000  // 设置超时时间
})
// 请求拦截器
service.interceptors.request.use(config => {
  // config 是请求的配置信息
  // 注入token
  if (store.getters.token) {
    // 只要有token就要检查token时效性
    if (IsCheckIsTimeOut()) {
      store.dispatch('user/logout')  // 登出操作
      router.push('/login')  // 跳转到登录页
      return Promise.reject(new Error('您的token已经失效'))
    }
    // 如果存在token
    config.headers['Authorization'] = `Bearer ${store.getters.token}`
  }
  return config   // 必须要返回
}, error => {
  return Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(response => {
  // axios默认加了一层data
  const { success, message, data } = response.data
  // 要根据success的成功于否决定下面的操作
  if (success) {
    return data 
  } else {
    // 业务已经错误了，不能进then 应该进catch
    Message.error(message)  // 提示错误信息
    return Promise.reject(new Error(message))
  }
}, error => {
  if (error.response && error.response.data && error.response.data.code === 10002) {
    // 后端告诉前端token超时了
    store.dispatch('user/logout') // 调用登出action
    router.push('/login') // 跳到登录页
} else {
  // 失败
  Message.error(error.message)  // 提示错误信息
}
  return Promise.reject(error)  // 传入一个错误对象，就认为promise执行了  进入了catch
}) 
// 检查token是否过期
function IsCheckIsTimeOut() {
  // 当前时间  - 存储的时间戳 > 时效性  false   tr
  return (Date.now() - getTimeStamp()) / 1000 > TimeOut
}
export default service