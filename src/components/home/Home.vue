<template>
  <div>
    首页
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>
<script>
export default {
  data() {
    return {}
  },
  methods: {
    logout() {
      window.sessionStorage.removeItem('token')
      this.$router.push('/login')
      this.$message('成功退出！')
    }
  }
}
</script>
<style scoped>
</style>
