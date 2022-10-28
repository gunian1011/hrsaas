<template>
  <!-- 新增部门的弹层 -->
  <el-dialog :title='showTitle' :visible="showDialog" @close="btnCancel">
    <!-- 表单组件 el-from label-width设置label宽度 -->
    <!-- 匿名插槽 -->
    <el-form ref="deptForm" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="部门名称" prop="name">
            <el-input v-model="formData.name" style="width: 80%" placeholder="1-50个字符" />
        </el-form-item>
        <el-form-item label="部门编码" prop="code">
            <el-input v-model="formData.code" style="width: 80%" placeholder="1-50个字符" />
        </el-form-item>
        <el-form-item label="部门负责人" prop="manager">
            <el-select @focus="getEmployeeSimple" v-model="formData.manager" style="width: 80%" placeholder="请选择">
                <el-option v-for="item in peoples" :key="item.id" :label="item.username" :value="item.username"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="部门介绍" prop="introduce">
            <el-input v-model="formData.introduce" style="width: 80%" placeholder="1-300个字符" type="textarea" :rows="3" />
        </el-form-item>
    </el-form>
    <!-- el-dialog有专门放置底部操作栏的 插槽  具名插槽 -->
    <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
        <el-button size="small" type="primary" @click="btnOK">确定</el-button>
        <el-button size="small" @click="btnCancel">取消</el-button>
    </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { addDepartments, getDepartments, getDepartDetail, updateDepartments } from '@/api/departments'
import { getEmployeeSimple } from '@/api/employees'
export default {
    props: {
        // 用来控制窗体是否显示或者隐藏
        showDialog: {
            type: Boolean,
            default: false,
        },
        // 当前操作的节点
        treeNode: {
            type: Object,
            default: null
        }
    },
    data () {
        // 检查部门名称是否重复
        const checkNameRepeat = async(rule, value, callback) => {
            // value 是部门名称 要去和同部门下的部门去比较 不能有相同的
            const { depts } = await getDepartments()
            // 去找同级部门下 有没有value相同的数据
            // 去找同级部门下的所有子部门
            let isRepeat = false
            if (this.formData.id) {
                // 有id就是编辑模式
                // 编辑的数据 在数据库中有数据  同级部门下我的名字不能和其他的同级部门的名字进行重复
                // 首先要找到我的同级部门 this.dormData.id 就是我当前的id 我的pid是 this.formData.pid
                isRepeat = depts.filter(item => item.pid === this.treeNode.pid && item.id !== this.treeNode.id).some(item => item.name === value)

            } else {
                // 没有id就是新增
                isRepeat = depts.filter(item => item.pid === this.treeNode.id).some(item => item.name === value)
            }
            // 如果isRepeat为TRUE 表示找到了一样的名字
            isRepeat ? callback(new Error(`同级部门下已经存在这个${value}部门了`)) : callback()
        }
        const checkCodeRepeat = async(rule, value, callback) => {
            const { depts } = await getDepartments()
            // 要求编码 和所有的部门编码都不能重复  由于历史数据有了可能 没有code所以说加一个强制条件 就是value 值不能为空
            let isRepeat = false
            if (this.formData.id) {
                // 编辑模式下
                isRepeat = depts.filter(item => item.id !== this.treeNode.id).some(item => item.code === value && value)
            } else {
                // 新增模式下
                isRepeat = depts.some(item => item.code === value && value)
            }
            isRepeat ? callback(new Error(`组织架构下已经存在这个${value}编码了`)) : callback()
        }
        return {
            // 定义表单数据
            formData: {
                name: '', // 部门名称
                code: '', // 部门编码
                manager: '', // 部门管理者
                introduce: '', // 部门介绍
            },
            rules: {
                name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' },
                    { min: 1, max: 50, message: '部门名称长度为1-50个字符', trigger: 'blur' },
                    { trigger: 'blur', validator: checkNameRepeat }], 
                code: [{ required: true, message: '部门编码不能为空', trigger: 'blur' },
                    { min: 1, max: 50, message: '部门编码长度为1-50个字符', trigger: 'blur' },
                    { trigger: 'blur', validator: checkCodeRepeat }], 
                manager: [{ required: true, message: '部门负责人不能为空', trigger: 'blur' }], 
                introduce: [{ required: true, message: '部门介绍不能为空', trigger: 'blur' },
                    { min: 1, max: 300, message: '部门介绍长度为1-300个字符', trigger: 'blur' }], 
            },  // 效验规则 {key: 数组}
            peoples: []
        }
    },
    computed: {
        showTitle() {
        return this.formData.id ? '编辑部门' : '新增子部门'
        }
    },
    methods: {
        async getEmployeeSimple() {
            this.peoples = await getEmployeeSimple()
        },
        // 获取详情
        async getDepartDetail(id) {
            this.formData = await getDepartDetail(id)
            // 因为我们是父组件调用子组件的方法  先设置node 数据 直接调用方法
            // props 传值是异步的
        },
        btnOK() {
            // 手动效验表单
            this.$refs.deptForm.validate(async isOK => {
                if (isOK) {
                    if (this.formData.id) {
                        // 编码
                        await updateDepartments(this.formData)
                    } else {
                        // 这里我们将ID设成pid
                        await addDepartments({ ...this.formData,pid: this.treeNode.id })
                    }
                    // 表单效验通过
                    
                    // 告诉父组件
                    this.$emit('addDepts') // 触发一个自定义事件
                    // 此时应该去修改showDialog的值
                    this.$emit('update:showDialog', false)
                    // 关闭dialog的时候  触发el-dialog的时间 所以不需要再单独的重置数据了
                }
            })
        },
        btnCancel() {
            // 重置数据  因为resetFields 只能重置 表单上的数据 非表单上的 比如 编辑中的ID不能重置
            this.formData = {
                name: '', // 部门名称
                code: '', // 部门编码
                manager: '', // 部门管理者
                introduce: '', // 部门介绍
            }
            // 关闭弹层
            this.$emit('update:showDialog', false)
            // 清除之前的效验 可以重置数据 只能重置定义在data中的数据
            this.$refs.deptForm.resetFields()
        }
    }
}
</script>

<style>

</style>