<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 组织架构的内容 -->
      <el-card class="tree-card">
        <!-- 放置结构内容 -->
        <tree-tools :tree-node="company" :is-root="true" @addDepts="addDepts" />
        <!-- 放置一个el-tree -->
        <el-tree :data="departs" :props="defaultProps" :default-expand-all="true">
        <!-- 传入内容 插槽内容 会循环多次 有多少节点  就会循环多少次 -->
        <!-- 作用域插槽 slot-scope="obj" 就接收传递给插槽的数据 data 每个节点的数据对象 -->
        <tree-tools slot-scope="{ data }" @editDepts="editDepts" @addDepts="addDepts" :tree-node="data" @delDepts="getDepartments" />      
        </el-tree>
      </el-card>
    </div>
    <!-- 放置新增弹层 -->
    <add-dept ref="addDept" :show-dialog.sync="showDialog" :show-dialog="showDialog" :tree-node="node" @addDepts="getDepartments" />
  </div>
</template>

<script>
import TreeTools from './components/tree-tools'
import AddDept from './components/add-dept.vue'
import { getDepartments } from '@/api/departments'
import { tranListToTreeData } from '@/utils'
export default {
  components: {
    TreeTools,
    AddDept,
  },
  data () {
    return {
      company: { name: '山东顾念科技股份有限公司', manager: '负责人', id: '' },  // 头部数据 
      departs: [],
      defaultProps: {
        label: 'name',   // 表示从这个属性显示内容
      },
      showDialog: false,
      node: null  // 记录当前点击的node节点
    }
  },
  created() {
    this.getDepartments()  // 调用自身的方法
  },
  
  methods: {
    async getDepartments() {
      const result = await getDepartments()
      // this.company = { name: result.companyName, manager: '负责人', id: '' }
      // 这个先不传入，传入的话我的公司就没了, 我要自己开公司
      this.departs = tranListToTreeData(result.depts, '') // 需要转化成树形结构
      // console.log(result)
    },
    // 监听tree-tools中触发的点击添加子组件
    // node 是我们点击的部门
    addDepts(node) {
      this.showDialog = true
      this.node = node
    },
    editDepts(node) {
      this.showDialog = true  // 弹出层
      this.node = node
      // 应该在这调用获取部门详情的方法
      this.$refs.addDept.getDepartDetail(node.id)
    }
  }
}
</script>

<style scoped lang="scss">
  .tree-card {
    padding: 30px -1px;
    font-size: 14px;
  }
</style>
