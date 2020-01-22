<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row :class="['bdbottom',i1===0 ? 'bdtop' : '', 'vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag @close="removeRightById(scope.row, item1.id)" closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag @close="removeRightById(scope.row, item2.id)" closable type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>

        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%">
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="rightTreeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 要添加角色的id
      roleId: '',
      // 所有角色列表数据
      roleList: [],
      // 控制分配权限对话框的显示隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树型控件
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      defKeys: []
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取数据失败！')
      this.roleList = res.data
    },
    // 根据id删除权限
    removeRightById(row, rightId) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then((res) => {
        this.$http.delete(`roles/${row.id}/rights/${rightId}`).then((res) => {
          // console.log(res)
          if (res.data.meta.status !== 200) {
            this.$message.error('取消权限失败')
          }
          this.$message.success(res.data.meta.msg)
          row.children = res.data.data
        })
      }).catch((e) => {
        this.$message.info('取消了删除!')
      })
    },
    // 权限分配
    showSetRightDialog(role) {
      this.defKeys = []
      this.roleId = role.id
      this.$http.get('rights/tree').then((res) => {
        const data = res.data
        if (data.meta.status !== 200) {
          return this.$message.error('获取权限数据失败')
        }
        this.rightsList = data.data
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
      }).catch((e) => {
        return this.$message.error('获取权限数据失败')
      })
    },
    // 获取所有的三级权限的id
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 点击为角色分配权限
    allotRights() {
      const keys = [
        ...this.$refs.rightTreeRef.getCheckedKeys(),
        ...this.$refs.rightTreeRef.getHalfCheckedKeys()
      ]
      const idT = keys.join(',')
      this.$http.post(`roles/${this.roleId}/rights`, { rids: idT }).then(res => {
        const data = res.data
        if (data.meta.status !== 200) {
          return this.$message.error('添加权限失败！')
        }
        this.setRightDialogVisible = false
        this.$message.success('添加权限成功！')
        this.getRolesList()
      })
    }
  }
}

</script>
<style lang="less" scoped>
  .el-col{
    margin: 7px 0px;
    .el-tag{
      margin: 7px;
    }
  }
  .bdtop{
    border-top: 1px solid #eee;
  }
  .bdbottom{
    border-bottom: 1px solid #eee;
  }
  .vcenter{
    display: flex;
    align-items: center;
  }
</style>
