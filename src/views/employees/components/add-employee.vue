<template>
  <el-dialog title="新增员工" :visible="showDialog" @close="btnCancle">
    <!-- 表单 -->
    <el-form ref="addEmployee" :model="formData" :rules="rules" label-width="120px">
        <el-form-item prop="username" label="姓名">
            <el-input v-model="formData.username" style="width: 50%" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item prop="mobile" label="手机">
            <el-input v-model="formData.mobile" style="width:50%" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item prop="timeOfEntry" label="入职时间">
            <el-date-picker v-model="formData.timeOfEntry" style="width: 50%" placeholder="请选择入职时间" />
        </el-form-item>
        <el-form-item prop="formOfEmployment" label="聘用形式">
            <el-select v-model="formData.formOfEmployment" style="width: 50%" placeholder="请选择" >
                <el-option v-for="item in EmployeeEnum.hireType" :key="item.id" :label="item.value" :value="item.id"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item prop="workNumber" label="工号">
            <el-input v-model="formData.workNumber" style="width: 50%" placeholder="请输入工号" />
        </el-form-item>
        <el-form-item prop="departmentName" label="部门">
            <el-input 
                v-model="formData.departmentName" 
                @focus="getDepartments" 
                style="width: 50%" 
                placeholder="请选择部门" 
            />
            <!-- 绑定一个树形组件 -->
            <el-tree 
                v-loading="loading" 
                v-if="showTree" :data="treeData" 
                :props="{ label: 'name' }" 
                :default-expand-all="true" 
                @node-click="selectNode"
            />
        </el-form-item>
        <el-form-item prop="correctionTime" label="转正时间">
            <el-date-picker v-model="formData.correctionTime" style="width: 50%" placeholder="请选择转正时间"  />
        </el-form-item>
    </el-form>
    <!-- footer插槽 -->
    <template v-slot:footer>
        <el-row type="flex" justify="center">
            <el-col :span="6">
                <el-button size="small" @click="btnCancle">取消</el-button>
                <el-button size="small" type="primary" @click="btnOK">确定</el-button>
            </el-col>
        </el-row>
    </template>
  </el-dialog>
</template>

<script>
import { getDepartments } from '@/api/departments'
import { tranListToTreeData } from "@/utils"
import EmployeeEnum from '@/api/constant/employees'
import { addEmployee } from '@/api/employees'

export default {
    props: {
        showDialog: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            // 定义表单数据
            EmployeeEnum,  // 这个是把数据引入成data数据 页面才可以访问,不然页面不可以直接使用 ES6 写法
            formData: {
                username:'',
                mobile: '',
                formOfEmployment: '',
                workNumber: '',
                departmentName: '',
                timeOfEntry: '',
                correctionTime: '',
            },
            rules: {
                username:[{ required: true, message: '用户姓名不能为空', trigger: 'blur' }, {
                    min: 1, max: 4, message: '用户姓名为1-4位'
                }],
                mobile: [{ required: true, message: '手机号不能为空', trigger: 'blur' }, {
                    pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur'
                }],
                formOfEmployment: [{ required: true, message: '聘用形式不能为空', trigger: 'blur' }],
                workNumber: [{ required: true, message: '工号不能为空', trigger: 'blur' }],
                departmentName: [{ required: true, message: '部门不能为空', trigger: 'change' }],
                timeOfEntry: [{ required: true, message: '入职时间', trigger: 'blur' }]
            },
            treeData: [],  // 定义一个数组来接收树形结构
            showTree: false,  // 默认不显示树形结构
            lading: false  // 加载进度条
        }
    },
    methods: {
        async getDepartments() {
            this.showTree = true 
            this.loading = true
            const { depts } = await getDepartments()
            // depts 是一个数组 他需要转化为树形结构 才可以 被 el-tree 显示
            this.treeData = tranListToTreeData(depts, '')
            this.loading = false
        },
        selectNode(node) {
            this.formData.departmentName = node.name
            this.showTree = false
        },
        async btnOK() {
            // 效验表单
            try {
                await this.$refs.addEmployee.validate()
                // 效验成功
                await addEmployee(this.formData)  // 调用新增接口
                // 通知父组件 更新数据
                // this.$parent   // 父组件的实例
                this.$parent.getEmployeeList && this.$parent.getEmployeeList()   // 直接调用父组件的更新方法
                this.$parent.showDialog = false
                // 这里不用重置数据 因为 关闭了弹层 触发了close事件 close事件绑定了btnCancel方法
            } catch (error) {
                console.log(error)
            }
            
        },
        btnCancle() {
            this.formData =  {
                username:'',
                mobile: '',
                formOfEmployment: '',
                workNumber: '',
                departmentName: '',
                timeOfEntry: '',
                correctionTime: '',
            },
            this.$refs.addEmployee.resetFields()   // 移除效验
            this.$emit('update:showDialog', false)
            // update:prop名称 这么写的话 可以在父组件直接用sync修饰符处理
        }
    }
}
</script>

<style>

</style>