<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 靠右的按钮 -->
      <page-tools>
        <template v-slot:after>
          <el-button type="primary" size="small" @click="addPermission(1,'0')">添加权限</el-button>
        </template>
      </page-tools>
      <!-- 表格 -->
      <!-- 指定id为唯一属性的标识 -->
      <el-table border :data="list" row-key="id">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="code" align="center" label="标识" />
        <el-table-column prop="description" align="center" label="描述" />
        <el-table-column align="center" label="操作">
          <template slot-scope="{ row }">
            <el-button v-if="row.type === 1" type="text" @click="addPermission(2,row.id)">添加</el-button>
            <el-button type="text" @click="editPermission(row.id)">编辑</el-button>
            <el-button type="text" @click="delPermission(row.id)">删除</el-button>
          </template>
        </el-table-column>

      </el-table>
    </div>
    <!-- 新增编辑弹层 -->
    <el-dialog :visible="showDialog" :title=showText @close="btnCancel">
      <el-form ref="permForm" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" style="width: 90%" />
        </el-form-item>
        <el-form-item label="权限标识" prop="code">
          <el-input v-model="formData.code" style="width: 90%" />
        </el-form-item>
        <el-form-item label="权限描述">
          <el-input v-model="formData.description" style="width: 90%" />
        </el-form-item>
        <el-form-item label="开启">
          <el-switch
            v-model="formData.enVisible"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button size="small" type="primaty" @click="btnOK">确定</el-button>
          <el-button size="small" @click="btnCancel">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getPermissionList, delPermission, addPermission, updatePermission, getPermissionDetail  } from '@/api/permisson'
import { tranListToTreeData } from '@/utils'
export default {
 data() {
  return {
    list: [],
    formData: {
        name: '', // 名称
        code: '', // 标识
        description: '', // 描述
        type: '', // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: '', // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: '0' // 开启
      },
      rules: {
        name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
        code: [{ required: true, message: '权限标识不能为空', trigger: 'blur' }]
      },
    showDialog: false,
  }
 },
 computed: {
  showText () {
    return this.formData.id ? "编辑权限" : "添加权限"
  }
 },
 created() {
  this.getPermissionList()
 },
 methods: {
  async getPermissionList() {
    this.list = tranListToTreeData(await getPermissionList(), '0') 
  },
  delPermission(id) {
    this.$confirm('确认删除该权限点吗').then(() => {
      return delPermission(id)
    }).then(() => {
      this.$message.success('删除成功')
      // 重新拉取数据
      this.getPermissionList()
    })
  },
  addPermission(type,pid) {
    // 访问权的type=1 按钮操作全type=2
    // pid标识当前数据父节点的标识
    this.formData.type = type
    this.formData.pid = pid
    this.showDialog = true
  },
  btnOK() {
    this.$refs.permForm.validate().then(() => {
      // 效验成功
      if (this.formData.id) {
        // 认为是编辑
        return updatePermission(this.formData)
      }
      return addPermission(this.formData)  // 新增的接口
    }).then(() => {
      // 添加成功 
      this.$message.success("操作成功")
      this.getPermissionList()
      this.showDialog = false
    })
  },
  btnCancel() {
    this.formData = {
        name: '', // 名称
        code: '', // 标识
        description: '', // 描述
        type: '', // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: '', // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: '0' // 开启
      }
      // 移除效验
      this.$refs.permForm.resetFields()  // 移除效验
      // 关闭弹层
      this.showDialog = false
  },
  async editPermission(id) {
    this.formData = await getPermissionDetail(id)
    this.showDialog = true
  }
 }
}
</script>

<style>

</style>
