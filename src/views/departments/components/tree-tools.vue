<template>
  <el-row type="flex" justify="space-between" align="middle" style="height: 40px; width: 100%">
            <el-col>
              <!-- 左侧内容 -->
              <span>{{ treeNode.name }}</span>
            </el-col>
            <el-col :span="4">
              <!-- 右侧内容 -->
              <el-row type="flex" justify="end">
                <el-col>{{ treeNode.manager }}</el-col>
                <el-col>
                  <!-- 放置下拉菜单 -->
                  <el-dropdown @command="operateDepts">
                    <!-- 内容 -->
                    <span>操作<i class="el-icon-arrow-down"/></span> 
                      <!-- 具名插槽 -->
                    <el-dropdown-menu slot="dropdown">
                      <!-- 下拉选项 -->
                      <el-dropdown-item command="add" :disabled="!checkPermission('add-dept')">添加子部门</el-dropdown-item>
                      <el-dropdown-item v-if="!isRoot" command="edit">编辑部门</el-dropdown-item>
                      <el-dropdown-item v-if="!isRoot" command="del">删除部门</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </el-col>
              </el-row>
              <!-- 右侧内容 -->
            </el-col>
          </el-row>
</template>

<script>
import { delDepartments } from '@/api/departments'
export default {
    // props可以用数组来接收数据  也可以用对象来接收
    props: {
        // 定义一个传入的属性
        treeNode: {
            required: true,  // 要求对方使用您的组件的时候 必须传treeNode属性  如果不传 就会报错
            type: Object,  // 对象类型
        },
        isRoot: {
          type: Boolean,
          default: false,
        }
    },
    methods: {
      // 点击 编辑 删除新增时触发
      operateDepts(type) {
        if (type === 'add') {
          // 添加子部门
          // 在当前点击的部门下 添加子部门 => this.treeNode就是当前点击的部门
          this.$emit('addDepts', this.treeNode)
        } else if (type === 'edit') {
          // 编辑部门
          this.$emit('editDepts', this.treeNode)
        } else {
          // 删除部门
          this.$confirm('您确定要删除该部门吗').then(() => {
            return delDepartments(this.treeNode.id)
          }).then(() => {
            // 只需要等到成功的时候 调用接口删除了 后端数据变化了 但前端没变 重新获取
            this.$emit('delDepts')  // 触发一个自定义事件
            this.$message.success('删除部门成功')
          })
        }
      }
    }
}
</script>

<style>

</style>