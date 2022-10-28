// 导出员工的路由规则
import Layout from '@/layout'
export default {
    // 路由规则
    path: '/employees', // 路由地址
    name: 'employees', // 给模块的一级路由加一个name属性 这个属性 后面会用到的
    component: Layout,
    children: [{
        // 二级路由什么都不写  此时表示二级路由的默认路由
        path: '',  // 这里不用写，表示/employees 不但有layout => 员工主页
        component: () => import('@/views/employees'),
        name: 'employees',
        // 路由的元信息  其实就是一个存储数据的地方  可以方任何内容
        meta: {
            title: '员工管理',  // 这里写title  因为左侧导航读取了这里的title属性
            icon: 'people'
        }, 
        
    },
    {
        path: 'detail/:id',  // 动态路由参数
        component: () => import('@/views/employees/detail'),
        hidden: true,  // 不在左侧菜单显示
        meta: {
            title: '员工详情'  
        }
    }, {
        path: 'print/:id',
        component: () => import('@/views/employees/print'),
        hidden: true,
        meta: {
            title: '员工打印'
        }
    }]
}