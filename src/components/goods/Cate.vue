<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效 -->
        <template slot="isok" scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightGreen;"
          ></i>
          <i v-else class="el-icon-error" style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" size="mini" type="success">二级</el-tag>
          <el-tag v-else size="mini" type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClose">
      <el-form
        ref="addCateFormRef"
        :model="addCateForm"
        :rules="addCateFormRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children', checkStrictly: true}"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClose">
      <el-form
        ref="editCateFormRef"
        :model="editCateForm"
        :rules="addCateFormRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品列表
      cateList: [],
      // 商品列表查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示隐藏
      addCateDialogVisible: false,
      // 添加分类对话框表单信息
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类对话框验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 选中的父级分类的数组
      selectedKeys: [],
      // 控制编辑对话框的显示隐藏
      editCateDialogVisible: false,
      // 修改对话框表单信息
      editCateForm: {
        cat_name: ''
      },
      cat_id: 0
    }
  },
  methods: {
    // 获取商品数据
    getCateList() {
      this.$http.get('categories', { params: this.queryInfo }).then(res => {
        const data = res.data
        if (data.meta.status !== 200) {
          return this.$message.error('获取商品分类失败')
        }
        this.cateList = data.data.result
        this.total = data.data.total
      })
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getCateList()
    },
    // 展示添加分类对话框
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类
    getParentCateList() {
      this.$http
        .get('categories', { params: { type: 2 } })
        .then(res => {
          const data = res.data
          if (data.meta.status !== 200) {
            this.$message.error('获取父级分类失败')
          }
          this.parentCateList = data.data
        })
        .catch(e => {
          this.$message.error('发送请求失败！')
        })
    },
    // 选择项变化触发函数
    parentCateChange() {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(valid => {
        if (!valid) return null
        this.$http.post('categories', this.addCateForm).then(res => {
          const data = res.data
          if (data.meta.status !== 201) {
            this.$message.error('添加分类失败！')
          }
          this.$message.success('添加分类成功！')
          this.getCateList()
          this.addCateDialogVisible = false
        })
      })
    },
    // 监听关闭添加分类对话框
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 展示修改对话框
    showEditDialog(Rid) {
      this.editCateDialogVisible = true
      this.cat_id = Rid
    },
    // 关闭修改对话框
    editCateDialogClose() {
      this.$refs.editCateFormRef.resetFields()
      this.editCateForm.cat_name = ''
    },
    // 发送修改请求
    editCate() {
      this.$http.put('categories/' + this.cat_id, {
        'cat_name': this.editCateForm.cat_name
      }).then(res => {
        const data = res.data
        if (data.meta.status !== 200) {
          this.$message.error('更新失败！')
        }
        this.$message.success('更新成功！')
        this.editCateDialogVisible = false
        this.getCateList()
      }).catch(e => {
        this.$message.error('发送请求失败！')
      })
    },
    // 删除分类
    removeCate(Rid) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(res => {
        this.$http.delete('categories/' + Rid).then(res2 => {
          const data = res2.data
          if (data.meta.status !== 200) {
            return this.$message.error('删除失败！')
          }
          this.$message.success('删除成功！')
          this.getCateList()
        })
      })
    }
  },
  created() {
    this.getCateList()
  }
}
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
</style>
