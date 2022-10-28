// 权限拦截在路由跳转  导航守卫

import router from '@/router' // 引入路由实例
import store from '@/store' // 引入vuex store实例
import NProgress from 'nprogress' // 引入一份进度条插件
import 'nprogress/nprogress.css' // 引入进度条样式

// 不需要导出， 因为只需要让代码执行就可
// 前置守卫
// next 是前置守卫必须必须执行的钩子  next 必须执行  如果不执行 页面就死了
// next() 放过
// next(false) 跳转终止
// next (地址) 跳转到某个地址
const whiteList = ['/login', '/404'] // 定义白名单  所有不受权限控制的页面
// 路由的前置守卫
router.beforeEach(async (to, from, next) => {
  NProgress.start() // 开启进度条
  //  首先判断有无token
  if (store.getters.token) {
    //   如果有token 继续判断是不是去登录页
    if (to.path === '/login') {
      //  表示去的是登录页
      next('/') // 跳到主页
    } else {
      // 如果当前vuex中有用户的资料的ID表示已经有资料了，不用再获取了
      if (!store.getters.userId) {
        // 如果没有id才表示当前用户资料没有获取过

        // async 函数所return的内容 使用 await 就可以接收到
        const { roles } = await store.dispatch('user/getUserInfo')
        // 如果说后续 需要根据用户资料获取数据  这里必须改成同步

        // 筛选用户的可用路由
        const routes = await store.dispatch('permission/filterRoutes', roles.menus)  // 筛选得到当前用户可用的路由模块
        // routes就是筛选得到的动态路由
        console.log(routes)
        // 动态路由 添加到 路由列表中 默认路由表 只有静态 没有动态
        router.addRoutes([...routes, { path: '*', redirect: '/404', hidden: true }])  // 添加动态路由到路由表
        
        // 添加完动态路由之后
        next(to.path)  // 相当于跳转到对应的地址 相当于多做一次跳转
      } else {
        next()
      }
      
    }
  } else {
    // 如果没有token
    if (whiteList.indexOf(to.path) > -1) {
      // 如果找到了 表示在在名单里面
      next()
    } else {
      next('/login') // 跳到登录页
    }
  }
  NProgress.done() // 手动强制关闭一次  为了解决 手动切换地址时  进度条的不关闭的问题
})
// 后置守卫
router.afterEach(() => {
  NProgress.done() // 关闭进度条
})
