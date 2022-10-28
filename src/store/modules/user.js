
import { getToken, setToken, removeToken } from '@/utils/auth'
import { login, getUserInfo, getUserDetailById } from '@/api/user'
import { resetRouter } from '@/router'

// 状态
const state = {
  token: getToken(),  // 设置token初始状态  token持久化 => 放到缓存中
  userInfo: {}   // 这里定义一个空对象
} 
// 修改状态
const mutations = {
  // 设置token
  setToken(state, token) {
    state.token = token  // 设置token 只是修改state的数据 123 => 1234
    // Vuex变化 => 缓存数据
    setToken(token)  // vuex和 缓存数据的同步
  },
  // 删除缓存
  removeToken(state) {
    state.token = null  // 删除vuex的token
    removeToken() // 先清除 vuex 在清除缓存 vuex和缓存数据同步
  },
  setUserInfo(state, result) {
    // 更新一个对象
    state.userInfo = result  // 这样是响应式的

  },
  removeUserInfo(state) {
    state.userInfo = {}
  }
}

// 执行异步
const actions = {
  async login(context, data) {
    // 调用api接口
    const result = await login(data)  // 拿到token
    context.commit('setToken', result)  // 设置token
    
  },
  async getUserInfo(context) {
    const result = await getUserInfo()
    // 获取用户的详情
    const baseInfo = await getUserDetailById(result.userId)
    context.commit('setUserInfo', {...result, ...baseInfo})  // 提交到mutations
    return result  // 这里为什么要return 呢  这里是给我们后期做权限使用的
  },
  // 退出操作
  logout(context) {
    // 删除token
    context.commit('removeToken')  // 不仅删除了vuex中的  还会删除缓存中的
    // 删除用户资料
    context.commit('removeUserInfo')  // 删除用户信息
    // 重置路由
    resetRouter() 
    // 去设置权限状态下的初始状态
    // Vuex子模块调用子模块  不加锁可以随意调用
    // 要清空permission模块下的state数据
    // vuex中 user子模块  permission子模块
    // 子模块调用子模块的action  默认情况下 子模块的context是子模块的
    // 父模块 调用 子模块的action
    context.commit('permission/setRoutes', [], { root: true })
    // 子模块调用子模块的action 可以 将 commit的第三个参数 设置成  { root: true } 就表示当前的context不是子模块了 而是父模块
  }
}


export default {
  namespaced: true,
  state,
  mutations,
  actions,
}