<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table border stripe :data="userlist">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch @change="userStateChange(scope.row)" v-model="scope.row.mg_state"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template>
            <el-tooltip
              class="item"
              effect="dark"
              content="编辑角色"
              :enterable="false"
              placement="top"
            >
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="删除角色"
              :enterable="false"
              placement="top"
            >
              <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              :enterable="false"
              placement="top"
            >
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%">
      <!-- 内容主体 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRules" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 邮箱校验规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }
    // 手机号校验
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[123567890]|17[678]|18[0-9]|14[57]|199)[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前页显示多少数据
        pagesize: 2
      },
      userlist: [],
      total: 0,
      // 控制添加用户对话框的显示隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 天机用户表单的验证规则对象
      addFormRules: {
        username: [
          {
            required: true, message: '请输入用户名', trigger: 'blur'
          },
          {
            min: 3, max: 10, message: '用户名的长度在3~10之间', trigger: 'blur'
          }
        ],
        password: [
          {
            required: true, message: '请输入密码', trigger: 'blur'
          },
          {
            min: 6, max: 15, message: '密码的长度在6~15之间', trigger: 'blur'
          }
        ],
        email: [
          {
            required: true, message: '请输入邮箱', trigger: 'blur'
          },
          {
            validator: checkEmail, trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true, message: '请输入手机号', trigger: 'blur'
          },
          {
            validator: checkMobile, trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败！')
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async userStateChange(userinfo) {
      // console.log(userinfo)
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新状态成功！')
    }
  },
  created() {
    this.getUserList()
  }
}
</script>
<style lang="less" scoped>
.el-pagination {
  margin-top: 15px;
}
</style>
