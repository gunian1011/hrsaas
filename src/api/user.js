import request from '@/utils/request'

// 登录接口的封装
export function login(data) {
  // 返回一个promise对象
 return request({
  url: '/sys/login',
  method: 'POST',
  data
 })
}

// 获取用户资料的接口
export function getUserInfo() {
  return request({
    url: '/sys/profile',
    method: 'POST',
    
  })
}


// 根据用户ID来获取用户的详情
export function getUserDetailById(id) {
  return request({
    url: `/sys/user/${id}`,
    method: 'GET',
    
  })
}

export function logout() {

}
