<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部的警告区域 -->
      <el-alert title="注意：只允许对第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children'}"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs区域 -->
      <el-tabs v-model="activeName" @tab-click="tabHandleClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtndisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template scope="scope">
                <el-button
                  @click="showEditDialog(scope.row.attr_id)"
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                >编辑</el-button>
                <el-button
                  @click="removeParams(scope.row.attr_id)"
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtndisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template scope="scope">
                <el-button
                  @click="showEditDialog(scope.row.attr_id)"
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                >编辑</el-button>
                <el-button
                  @click="removeParams(scope.row.attr_id)"
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="addFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取到的分类
      cateList: [],
      // 级联选择框双向绑定选择项
      selectedCateKeys: [],
      // 被选中的页签
      activeName: 'many',
      // 动态表格数据
      manyTableData: [],
      // 静态表格数据
      onlyTableData: [],
      // 添加对话框
      addDialogVisible: false,
      // 添加对话框表单信息
      addForm: {},
      // 添加对话框表单验证规则
      addFormRules: {
        attr_name: { required: true, message: '请输入数据！', trigger: 'blur' }
      },
      // 修改对话框显示隐藏
      editDialogVisible: false,
      // 修改表单的信息
      editForm: {}
    }
  },
  computed: {
    // 按钮可点击
    isBtndisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 三级分类id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // title名字
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  },
  methods: {
    // 获取分类
    getCateList() {
      this.$http.get('categories').then(res => {
        const data = res.data
        if (data.meta.status !== 200) {
          return this.$message.error('获取分类失败！请刷新')
        }
        this.cateList = data.data
      })
    },
    // 选择框变化触发的函数
    handleChange() {
      this.getParamsData()
    },
    // 获取参数函数
    getParamsData() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return null
      }
      this.$http
        .get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: this.activeName
          }
        })
        .then(res => {
          const data = res.data
          if (data.meta.status !== 200) {
            return this.$message.error('获取参数失败！')
          }
          data.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            // 控制输入框显示
            item.inputVisible = false
            // 输入框内容
            item.inputValue = ''
          })
          if (this.activeName === 'many') {
            this.manyTableData = data.data
          } else {
            this.onlyTableData = data.data
          }
        })
    },
    // 选项卡切换时触发
    tabHandleClick() {
      this.getParamsData()
    },
    // 添加对话框关闭时触发的函数
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确认添加参数
    addParams() {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) {
          return null
        }
        this.$http
          .post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          .then(res => {
            const data = res.data
            if (data.meta.status !== 201) {
              return this.$message.error('添加失败！')
            }
            this.$message.success('添加成功！')
            this.getParamsData()
            this.addDialogVisible = false
          })
      })
    },
    // 修改对话框关闭时触发的函数
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 打开修改对话框
    showEditDialog(Rid) {
      this.$http
        .get(`categories/${this.cateId}/attributes/${Rid}`, {
          params: { attr_sel: this.activeName }
        })
        .then(res => {
          const data = res.data
          if (data.meta.status !== 200) {
            return this.$message.error('获取信息失败！')
          }
          this.editForm = data.data
        })
      this.editDialogVisible = true
    },
    // 修改信息
    editParams() {
      this.$refs.editFormRef.validate(valid => {
        // console.log(valid)
        if (!valid) {
          return null
        }
        this.$http
          .put(
            `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName
            }
          )
          .then(res => {
            const data = res.data
            if (data.meta.status !== 200) {
              return this.$message.error('修改失败！')
            }
            this.$message.success('修改成功！')
            this.getParamsData()
            this.editDialogVisible = false
          })
      })
    },
    // 删除信息
    removeParams(Rid) {
      this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http
            .delete(`categories/${this.cateId}/attributes/${Rid}`)
            .then(res => {
              const data = res.data
              if (data.meta.status !== 200) {
                return this.$message.error('删除失败！')
              }
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.getParamsData()
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 文本框触发
    handleInputConfirm(row) {
      // console.log(1)
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return null
      }
      // 添加到数组中
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      // 保存修改
      this.saveAttrVals(row)
    },
    // 将修改发送到服务器
    saveAttrVals(row) {
      this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      }).then(res => {
        const data = res.data
        if (data.meta.status !== 200) {
          return this.$message.error('添加到服务器失败！')
        }
        this.$message.success('修改参数成功！')
      })
    },
    // 展示输入框
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获取焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除标签
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  created() {
    this.getCateList()
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 10px 0;
  span {
    font-size: 19px;
  }
}
.el-tag {
  margin: 5px 10px;
}
.input-new-tag{
  width: 120px
}
</style>
