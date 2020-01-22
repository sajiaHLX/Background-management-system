<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header class>
      <div>
        <img src="~assets/logo.png" alt />
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面内容 -->
    <el-container class="home-main-container">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse='isCollapse'
          :collapse-transition='false'
          router
          :default-active='activePath'
        >
        <!-- 一级菜单 -->
          <el-submenu v-for="item in menuList" :key="item.id" :index="item.id + ''">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 一级菜单的图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 一级菜单的标题 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item v-for="subItem in item.children" :key="subItem.id" :index="'/' + subItem.path">
              <template slot="title">
                <!-- 二级菜单的图标 -->
                <i class="el-icon-menu"></i>
                <!-- 二级菜单的标题 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      menuList: [],
      iconObj: {
        '125': 'iconfont icon-yonghuguanli',
        '103': 'iconfont icon-shangpinguanli',
        '101': 'iconfont icon-shangpinguanli1',
        '102': 'iconfont icon-dingdanguanli',
        '145': 'iconfont icon-shujutongjixinhao'
      },
      // 是否折叠
      isCollapse: false
    }
  },
  computed: {
    activePath() {
      return this.$route.path
    }
  },
  methods: {
    logout() {
      window.sessionStorage.removeItem('token')
      this.$router.push('/login')
      this.$message('成功退出！')
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    // 点击展开折叠按钮
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    }
  },
  created () {
    this.getMenuList()
  }
}
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 20px;
  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
    img {
      width: 55px;
      height: 55px;
    }
  }
}
.el-aside {
  background-color: #333744;
  height: 100%;
  .el-menu{
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont{
  margin-right: 10px;
}
.toggle-button{
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
  user-select: none;
}
.home-main-container{
  overflow: hidden;
}
// .el-main{
//   overflow: hidden;
// }
</style>
