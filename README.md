# NutriGuide Backend API

NutriGuide 后端 API 服务 - MVP 阶段

## 项目简介

NutriGuide 是一个智能营养指导平台的后端服务，基于 NestJS 框架开发，提供用户管理、食物数据库、营养分析等核心功能。

## 技术栈

- **框架**: NestJS (Node.js)
- **语言**: TypeScript
- **数据库**: MongoDB (Mongoose ODM)
- **认证**: JWT
- **文档**: Swagger/OpenAPI
- **测试**: Jest
- **代码规范**: ESLint + Prettier
- **容器化**: Docker & Docker Compose

## 项目结构

```
src/
├── common/           # 通用模块
│   ├── dto/         # 数据传输对象
│   ├── filters/     # 异常过滤器
│   ├── guards/      # 守卫
│   ├── decorators/  # 装饰器
│   └── interfaces/  # 接口定义
├── config/          # 配置文件
│   ├── environment.config.ts  # 环境配置
│   └── database.config.ts     # 数据库配置
├── modules/         # 业务模块
├── shared/          # 共享模块
├── app.module.ts    # 主应用模块
├── app.controller.ts # 主控制器
├── app.service.ts   # 主服务
└── main.ts          # 应用入口
```

## 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB >= 5.0.0
- Docker >= 20.0.0 (可选)
- Docker Compose >= 2.0.0 (可选)

## 多环境配置

项目支持三种环境：`development`、`qa`、`production`

### 环境配置文件

- `.env.development` - 开发环境配置
- `.env.qa` - QA测试环境配置
- `.env.production` - 生产环境配置
- `.env.example` - 配置模板文件

### 快速环境切换

使用提供的脚本快速切换环境：

```bash
# 切换到开发环境
./scripts/setup-env.sh development

# 切换到QA环境
./scripts/setup-env.sh qa

# 切换到生产环境
./scripts/setup-env.sh production
```

## 安装与运行

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

选择并设置目标环境：

```bash
# 设置开发环境
./scripts/setup-env.sh development

# 或者手动复制配置文件
cp .env.development .env
```

### 3. 启动服务

#### 本地开发

```bash
# 开发模式（自动重启）
npm run start:dev

# QA环境
npm run start:qa

# 生产模式
npm run build
npm run start:prod

# 调试模式
npm run start:debug
```

#### Docker方式

```bash
# 开发环境
npm run docker:up:dev

# QA环境
npm run docker:up:qa

# 生产环境
npm run docker:up:prod

# 停止服务
npm run docker:down
```

### 4. 访问服务

#### 开发环境
- API 服务: http://localhost:3000/api/v1
- API 文档: http://localhost:3000/api/docs
- 健康检查: http://localhost:3000/api/v1/health
- MongoDB Admin: http://localhost:8081 (Docker方式)

#### QA环境
- API 服务: http://localhost:3000/api/v1
- MongoDB: localhost:27018

#### 生产环境
- API 服务: http://localhost:3000/api/v1
- MongoDB: localhost:27019
- Swagger文档在生产环境中被禁用

## 开发命令

```bash
# 开发模式启动
npm run start:dev

# 构建项目
npm run build

# 代码格式化
npm run format

# 代码检查
npm run lint

# 运行测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:cov

# 运行 E2E 测试
npm run test:e2e

# 监听模式测试
npm run test:watch
```

## Docker命令

```bash
# 构建镜像
npm run docker:build

# 构建特定环境镜像
npm run docker:build:dev
npm run docker:build:qa
npm run docker:build:prod

# 启动服务（不同环境）
npm run docker:up:dev
npm run docker:up:qa
npm run docker:up:prod

# 停止所有服务
npm run docker:down
```

## 数据库配置

### 环境对应的数据库

- **开发环境**: `nutriguide_dev` (端口: 27017)
- **QA环境**: `nutriguide_qa` (端口: 27018)
- **生产环境**: `nutriguide_prod` (端口: 27019)

### 数据库初始化

项目包含MongoDB初始化脚本(`scripts/mongo-init.js`)，会自动：
- 创建必要的集合和索引
- 在开发环境中插入示例数据

## API 文档

项目集成了 Swagger，在非生产环境中访问 `/api/docs` 查看完整的 API 文档。

## 开发规范

项目遵循以下开发规范：

- **代码风格**: 使用 Prettier 进行代码格式化
- **代码质量**: 使用 ESLint 进行代码检查
- **命名规范**: 
  - 变量、函数: camelCase
  - 类、接口: PascalCase
  - 常量: UPPER_CASE_SNAKE_CASE
  - 文件: kebab-case
- **提交规范**: 遵循 Conventional Commits 格式
- **环境隔离**: 严格区分开发、QA、生产环境

## 测试

```bash
# 单元测试
npm run test

# 测试覆盖率
npm run test:cov

# E2E 测试
npm run test:e2e

# 监听模式测试
npm run test:watch
```

## 部署

### 环境变量

各环境需要配置的关键环境变量：

#### 开发环境
- `NODE_ENV=development`
- `MONGODB_URI=mongodb://localhost:27017/nutriguide_dev`
- `JWT_SECRET=dev-secret-key`
- `LOG_LEVEL=debug`

#### QA环境
- `NODE_ENV=qa`
- `MONGODB_URI=mongodb://mongodb-qa:27017/nutriguide_qa`
- `JWT_SECRET=qa-secret-key`
- `LOG_LEVEL=info`

#### 生产环境
- `NODE_ENV=production`
- `MONGODB_URI`: 生产环境MongoDB连接字符串
- `JWT_SECRET`: 强安全性的JWT密钥
- `LOG_LEVEL=warn`

### Docker部署

```bash
# 生产环境部署
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看服务日志
docker-compose -f docker-compose.prod.yml logs -f
```

## 监控和日志

- **日志级别**: 根据环境自动调整（development: debug, qa: info, production: warn）
- **健康检查**: `/api/v1/health` 端点提供服务健康状态
- **Docker健康检查**: 容器内置健康检查机制

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 遵循代码规范和环境配置
4. 提交更改 (`git commit -m 'feat: add amazing feature'`)
5. 推送到分支 (`git push origin feature/amazing-feature`)
6. 创建 Pull Request

## 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查MongoDB是否运行
   docker-compose -f docker-compose.dev.yml ps
   
   # 查看数据库日志
   docker-compose -f docker-compose.dev.yml logs mongodb-dev
   ```

2. **环境变量未生效**
   ```bash
   # 重新设置环境
   ./scripts/setup-env.sh development
   
   # 检查当前环境配置
   cat .env
   ```

3. **端口冲突**
   - 开发环境: 3000 (API), 27017 (MongoDB), 8081 (Mongo Express)
   - QA环境: 3000 (API), 27018 (MongoDB)
   - 生产环境: 3000 (API), 27019 (MongoDB)

## 许可证

本项目采用私有许可证，仅供 NutriGuide 团队内部使用。

## 联系方式

如有问题，请联系开发团队。 