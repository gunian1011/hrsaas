import request from '@/utils/request'

// 获取组织架构数据
export function getDepartments() {
    return request ({
        url: '/company/department'
    })
}

// 删除组织架构的部门
export function delDepartments(id) {
    return request({
        url: `/company/department/${id}`,
        method: 'delete'
    })
}


// 新增接口
export function addDepartments(data) {
    return request({
        url: '/company/department',  // restaful接口规范
        method: 'post',
        data // axios的body参数 data
    })   
}

// 编辑部门
export function getDepartDetail(id) {
    return request({
        url: `/company/department/${id}`
    })
}

// 保存编辑的数据

export function updateDepartments(data) {
    return request({
        url: `/company/department/${data.id}`,
        method: 'put',
        data
    })
}