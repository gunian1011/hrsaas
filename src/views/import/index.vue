<template>
  <upload-excel :on-success="success" />
</template>

<script>

import { importEmployee } from '@/api/employees'
export default {
    methods: {
        success({ header, results }) {
            // debugger
            // hander中的数据是中文 results也是中文
            // 新增员工的属性是一致的
            const userRelations = {
                '入职日期': 'timeOfEntry',
                '手机号': 'mobile',
                '姓名': 'username',
                '转正日期': 'correctionTime',
                '工号': 'workNumber'
            }
            // var arr = []
            // results.forEach(item => {
            //     var userInfo = {}
            //     Object.keys(item).forEach(key => {
            //         // 现在的key是中文
            //         userInfo[userRelations[key]] = item[key]
            //     })
            //     arr.push(userInfo)
            // })
            var newArr = results.map(item => {
                var userInfo = {}
                Object.keys(item).forEach(key => {
                    if (userRelations[key] === 'timeOfEntry' || userRelations[key] === 'correctionTime') {
                        userInfo[userRelations[key]] = new Date(this.formatDate(item[key], '/'))  // 只有这样才能入数据库
                    } else {
                        userInfo[userRelations[key]] = item[key]  // 将原来的中文对应的值 赋值原来的英文对应的值
                    }
                })
                return userInfo
            })
            importEmployee(newArr)  // 接收一个数组
            this.$message.success('导入excel成功')
            this.$router.back()  // 返回上一个页面
        },
        // 转化日期格式
        formatDate(numb, format) {
            const time = new Date((numb - 1) * 24 * 3600000 + 1)
            time.setYear(time.getFullYear() - 70)
            const year = time.getFullYear() + ''
            const month = time.getMonth() + 1 + ''
            const date = time.getDate() - 1 + ''
            if (format && format.length === 1) {
                return year + format + month + format + date
        }
            return year + (month < 10 ? '0' + month : month) + (date < 10 ? '0' + date : date)
        }
    }
}
</script>

<style>

</style>