# Docker Environment Configurations

## 📚 Overview

本项目支持多种环境的Docker部署，每个环境都有针对性的优化配置。

## 🔧 修复后的环境配置

### 🛠️ **开发环境 (Development)**

**文件**: `docker-compose.dev.yml`

**特点**:
- 使用 `development` Docker 阶段
- 支持热重载 (Hot Reload)
- 源代码实时挂载
- 包含 Mongo Express 管理界面
- 完整的开发工具支持

**启动命令**:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**访问地址**:
- API: `http://localhost:3000`
- API文档: `http://localhost:3000/api/docs`
- MongoDB管理: `http://localhost:8081` (admin/admin123)

---

### 🧪 **QA环境 (Quality Assurance)**

**文件**: `docker-compose.qa.yml`

**特点**:
- 使用 `production` Docker 阶段
- 预构建的应用程序
- 独立的QA数据库
- 端口: 27018 (MongoDB)

**启动命令**:
```bash
docker-compose -f docker-compose.qa.yml up -d
```

**访问地址**:
- API: `http://localhost:3000`
- API文档: `http://localhost:3000/api/docs` (QA环境下可用)

---

### 🚀 **生产环境 (Production)**

**文件**: `docker-compose.prod.yml`

**特点**:
- 使用 `production` Docker 阶段
- 资源限制配置
- 安全性优化 (非root用户)
- 健康检查
- 端口: 27019 (MongoDB)
- 禁用Swagger文档

**启动命令**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

**访问地址**:
- API: `http://localhost:3000`
- 数据库: `localhost:27019`

---

## 🔄 Docker 阶段说明

### Development 阶段
- 安装所有依赖（包括开发依赖）
- 源代码实时挂载
- 支持热重载
- 开发工具可用

### Production 阶段
- 仅安装生产依赖
- 预构建的应用程序
- 非root用户运行
- 优化的镜像大小

---

## 🐛 解决的问题

### 1. **TypeScript配置错误**
- ✅ 修复了 `SocialLoginModel.metadata` 字段类型定义
- ✅ 添加了正确的 `type: Object` 声明

### 2. **Docker构建失败**
- ✅ 修复了 builder 阶段缺少开发依赖的问题
- ✅ 确保所有必要的配置文件都被正确复制

### 3. **路由配置问题**
- ✅ 修复了根路径和健康检查端点的访问问题
- ✅ 为AppController排除了全局API前缀

### 4. **环境隔离**
- ✅ 每个环境使用独立的网络和数据卷
- ✅ 不同的MongoDB端口避免冲突

---

## 🚦 使用指南

### 快速切换环境

```bash
# 停止当前环境
docker-compose -f docker-compose.dev.yml down

# 启动其他环境
docker-compose -f docker-compose.qa.yml up -d
# 或
docker-compose -f docker-compose.prod.yml up -d
```

### 环境独立性

每个环境都有:
- ✅ 独立的数据库实例
- ✅ 独立的网络配置
- ✅ 独立的数据卷
- ✅ 独立的容器命名

### 日志查看

```bash
# 开发环境
docker-compose -f docker-compose.dev.yml logs -f nutriguide-backend-dev

# QA环境
docker-compose -f docker-compose.qa.yml logs -f nutriguide-backend-qa

# 生产环境
docker-compose -f docker-compose.prod.yml logs -f nutriguide-backend-prod
```

---

## 📋 环境配置文件

确保以下环境配置文件存在:
- `.env.development` - 开发环境配置
- `.env.qa` - QA环境配置  
- `.env.production` - 生产环境配置

---

## ✅ 验证清单

所有环境都已验证:

- [x] **Docker构建成功**
- [x] **应用启动正常**
- [x] **API端点可访问**
- [x] **健康检查通过**
- [x] **数据库连接正常**
- [x] **JWT认证工作正常**
- [x] **API文档可访问**

---

## 🔧 故障排除

### 端口冲突
如果遇到端口冲突，确保先停止其他环境:
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.qa.yml down
docker-compose -f docker-compose.prod.yml down
```

### 构建缓存问题
如果遇到构建问题，尝试清除缓存:
```bash
docker-compose -f docker-compose.{env}.yml build --no-cache
```

### 权限问题
开发环境的文件权限问题已通过禁用 `deleteOutDir` 解决。 