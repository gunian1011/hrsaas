<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools :show-before="true">
        <!-- 左侧显示总记录数 -->
        <template v-slot:before>
          <span slot="before">共{{ page.total }}条数据</span>
        </template>
        <!-- 右侧显示按钮 excel导入 excel导出 新增员工 -->
        <template v-slot:after>
          <el-button size="small" type="success" @click="$router.push('/import')">excel导入</el-button>
          <el-button size="small" type="danger" @click="exportData">excel导出</el-button>
          <el-button :disabled="!checkPermission('POINT-USER-ADD')" size="small" type="primary" @click="showDialog = true">新增员工</el-button>
        </template>
      </page-tools>
      <!-- 表格组件 -->
      <!-- 这个组件定义序号是 type="index" -->
      <el-table border v-loading="loading" :data="list">
        <el-table-column type="index" label="序号" sortable="" />
          <el-table-column prop="username" label="姓名" sortable="" />
          <el-table-column width="120px" label="头像" align="center">
            <!-- 插槽 -->
            <template v-slot="{ row }">
              <img 
                v-imageerror="require('@/assets/common/bigUserHeader.png')"
                :src="row.staffPhoto"
                style="border-radius: 50%; width: 100px; height: 100px; padding: 10px"
                @click="showQrCode(row.staffPhoto)"
                alt="" />
            </template>
          </el-table-column>
          <el-table-column prop="mobile" label="手机号" sortable="" />
          <el-table-column prop="workNumber" label="工号" sortable="" />
          <el-table-column prop="formOfEmployment" label="聘用形式" :formatter="formatEmployment" sortable="" />
          <el-table-column prop="departmentName" label="部门" sortable="" />
          <!-- 作用域插槽  过滤器 -->
          <el-table-column prop="timeOfEntry" label="入职时间" sortable >
            <template v-slot="{ row }">
              <!-- 将事件格式化 -->
              {{ row.timeOfEntry | formatDate }}
            </template>
          </el-table-column>
          <el-table-column prop="enableState" label="账户状态" sortable="" >
            <template v-slot="{ row }">
              <el-switch :value="row.enableState === 1"  />
            </template> 
          </el-table-column>
          
          <el-table-column label="操作" sortable="" fixed="right" width="280">
            <template slot-scope="{ row }">
              <el-button type="text" size="small" @click="$router.push(`/employees/detail/${ row.id }`)">查看 </el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small" @click="editRole(row.id)">角色</el-button>
              <el-button type="text" size="small" @click="deleteEmployee(row.id)">删除</el-button>
            </template>
          </el-table-column>
      </el-table>
      <!-- 放置分页组件 -->
      <el-row type="flex" justify="center" align="middle" style="height: 60px">
        <el-pagination 
          :current-page="page.page" 
          :page-size="page.size" 
          :total="page.total"
          layout="prev, pager, next" 
          @current-change="changePage"
        />
      </el-row>
    </div>
    <!-- 放置弹出层 -->
    <!-- sync修饰符 自组件 去改变父组件的数的一个语法糖 -->
    <add-employee :show-dialog.sync="showDialog" />
    <el-dialog title="二维码" :visible.sync="showCodeDialog">
      <el-row type="flex" justify="center">
        <canvas ref="myCanvas" />
      </el-row>
    </el-dialog>
    <!-- 放置分配组件 -->
    <assign-role ref="assignRole" :show-role-dialog.sync='showRoleDialog' :user-id="userId" />
  </div>
</template>

<script>
import { getEmployeeList, delEmployee } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees'  // 员工的枚举对象
import AddEmployee from './components/add-employee'
import { formatDate } from '@/filters'
import AssignRole from './components/assign-role'
import QrCode from 'qrcode'

export default {
  components: {
    AddEmployee,
    AssignRole
  },
  data() {
    return {
      // loading: false,
      list: [],  // 接收数据
      page: {
        page: 1,  
        size: 10,
        total: 0,  // 总数
      },
      loading: false,  // 显示遮罩层
      showDialog: false,  // 默认是关闭的弹层
      showCodeDialog: false,  // 显示二维码弹层
      showRoleDialog: false,  // 显示角色的弹层
      userId : null, 
    }
  },
  created() {
    this.getEmployeeList()
  },
  methods: {
    async getEmployeeList() {
      this.loading = true
      const { total, rows } = await getEmployeeList(this.page)
      this.page.total = total
      this.list = rows
      this.loading = false
    },
    changePage(newPage) {
      this.page.page = newPage // 赋值最新页码
      this.getEmployeeList()  // 重新拉取数据
    },
    formatEmployment(row, column, cellValue, index) {
      // 要去找1对应的值
      const obj = EmployeeEnum.hireType.find(item => item.id === cellValue)
      return obj ? obj.value : '未知'
    },
    async deleteEmployee(id) {
      try {
        await this.$confirm('确认删除该员工吗')
        // 点击了解确定
        await delEmployee(id)
        this.getEmployeeList()  // 重新拉取数据
        this.$message.success('删除员工成功')
        
      } catch (error) {
        console.log(error)
      }
    },
    exportData() {
      const headers = {
        '姓名': 'username',
        '手机号': 'mobile',
        '入职日期': 'timeOfEntry',
        '聘用形式': 'formOfEmployment',
        '转正日期': 'correctionTime',
        '工号': 'workNumber',
        '部门': 'departmentName'
      }
      // 导出excel
      import('@/vendor/Export2Excel').then(async excel => {
        // excel是引入文件的导出对象
        // 导出 header从哪里来  data数据从哪里来
        const { rows } = await getEmployeeList({ page: 1, size: this.page.total })
        const data = this.formatJson(headers, rows)  // 返回的data 就是要导出的结构
        const multiHeader = [['姓名', '主要信息', '', '', '', '', '部门']]
        const merges = ['A1:A2', 'B1:F1', 'G1:G2']
        excel.export_json_to_excel({
          header: Object.keys(headers),
          data,
          filename: '员工资料表',
          multiHeader,   // 复杂表头
          merges,  // 合并对象
          
        })
        // excel.export_json_to_excel({
        //   header: ['姓名',],
        //   data: [],
        //   filename: '员工信息表'
        // })
      })
    },
    // 将表头数据和数据进行对应
    formatJson(headers, rows) {
      return rows.map(item => {
        // item 是一个对象
        return Object.keys(headers).map(key => {
          // 需要判断字段
          if (headers[key] === 'timeOfEntry' || headers[key] === 'correctionTime') {
            // 格式化日期
            return formatDate(item[headers[key]])
          } else if (headers[key] === 'formOfEmployment') {
            const obj = EmployeeEnum.hireType.find(obj => obj.id === item[headers[key]])
            return obj ? obj.value : '未知'
          }
          return item[headers[key]]
        })
      })
      // return rows.map(item => Object.keys(headers).map(key => item[headers[key]]))
      // 需要处理时间格式的问题 所以一行这个不可以使用
    },
    showQrCode(url) {
      if (url) {
        this.showCodeDialog = true  // 数据更新了 页面渲染是异步的 所以不会直接出来
        this.$nextTick(() => {
          // 此时可以确认已经有ref对象了
          QrCode.toCanvas(this.$refs.myCanvas, url)  // 将地址转化为二维码
        })
        
      } else {
        this.$message.warning('该用户还未上传头像')
      }
      
    },
    async editRole(id) {
      this.userId = id
      await this.$refs.assignRole.getUserDetailById(id) // 调用子组件的方式
      this.showRoleDialog = true
    }

  }
}
</script>

<style>

</style>
