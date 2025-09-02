# 🥗 NutriGuide Backend API

**NutriGuide 智能营养指导平台后端服务 - MVP 阶段**

[![NestJS](https://img.shields.io/badge/NestJS-10.0+-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1+-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Private-lightgrey.svg)]()

## 🌟 项目简介

**NutriGuide** 是一个现代化的智能营养指导平台后端 API 服务，基于 NestJS 框架开发。项目提供完整的用户管理、食物数据库、营养分析、智能推荐等核心功能，帮助用户实现个性化的营养管理和健康目标。

### ✨ 核心特色
- 🔐 **多样化认证**：支持邮箱、手机、短信、社交等多种登录方式
- 🍎 **智能食物库**：丰富的食物数据库和营养分析功能
- 📊 **数据驱动**：基于科学数据的营养分析和健康建议
- 🎯 **个性化推荐**：AI 驱动的智能营养计划推荐
- 🏗️ **模块化架构**：清晰的代码结构和高度可扩展性
- 🐳 **容器化部署**：完整的 Docker 多环境支持

## 🛠️ 技术栈

- 🏗️ **框架**: NestJS 10.0+ (Node.js)
- 🗺️ **语言**: TypeScript 5.1+
- 🗺️ **数据库**: MongoDB 5.0+ (Mongoose ODM)
- 🔐 **认证**: JWT + Passport
- 📝 **文档**: Swagger/OpenAPI 3.0
- 🧪 **测试**: Jest + Supertest
- 📎 **代码规范**: ESLint + Prettier
- 🐳 **容器化**: Docker + Docker Compose

### 🎆 架构特点
- ⚙️ **微服务就绪**：模块化设计，支持水平扩展
- 🔄 **依赖注入**：NestJS IoC 容器管理依赖
- 🛡️ **全局异常处理**：统一的错误处理和响应格式
- 🔍 **请求验证**：基于 class-validator 的数据验证
- 🎯 **智能缓存**：多层级缓存策略优化性能

## 🏗️ 项目架构

### 📋 目录结构
```
src/
├── common/           # 🚀 通用模块（DTO、过滤器、守卫等）
│   ├── dto/         # 数据传输对象
│   └── filters/     # 全局异常过滤器
├── config/          # ⚙️ 配置文件（环境、数据库）
│   ├── environment.config.ts  # 环境配置
│   └── database.config.ts     # 数据库配置
└── modules/         # 🧾 业务功能模块
    ├── auth/        # 🔐 认证授权模块
    │   ├── dto/         # 认证相关 DTO
    │   ├── guards/      # JWT 守卫
    │   ├── strategies/  # Passport 策略
    │   └── schemas/     # 认证相关数据模型
    ├── user/        # 👤 用户管理模块
    ├── food/        # 🍎 食物数据库模块
    ├── food-logs/   # 📝 食物日志模块
    ├── nutrition/   # 📊 营养分析模块
    ├── meal-plans/  # 🍽️ 膀食计划模块
    ├── recipes/     # 👨‍🍳 食谱管理模块
    └── recommendations/ # 🎯 智能推荐模块
```

### 🎆 功能模块详解

#### 🔐 **认证授权系统** (`auth/`)
- **多样化登录**：邮箱/用户名 + 密码、手机 + 密码、短信验证码、一键登录、社交登录
- **JWT 认证**：访问令牌（1小时）+ 刷新令牌（30-60天）
- **短信服务**：6位验证码，5分钟过期，1分钟限频
- **安全特性**：设备级令牌管理、密码 bcrypt 加密（12 salt rounds）

#### 👤 **用户管理系统** (`user/`)
- **基础信息**：完整的用户 CRUD 操作、账户状态管理
- **个人资料**：身高、体重、活动水平等健康指标
- **用户偏好**：饮食偏好、营养目标、过敏信息
- **数据统计**：用户统计分析、软删除机制

#### 🍎 **食物数据库** (`food/`)
- **食物信息**：丰富的食物数据库和营养成分信息
- **智能搜索**：多维度食物搜索和筛选功能
- **分类管理**：食物分类统计和管理
- **条形码识别**：支持条形码快速查找食物

#### 📝 **食物日志系统** (`food-logs/`)
- **饮食记录**：用户日常饮食摄入记录
- **营养计算**：自动计算每日营养摄入量
- **日期查询**：按日期、周、月查看记录
- **趋势分析**：营养摄入趋势监控

#### 📊 **营养分析系统** (`nutrition/`)
- **综合分析**：日/周/月营养摄入分析
- **目标对比**：实际摄入与目标值对比
- **健康评估**：BMR/TDEE 计算、宏量营养素分析
- **个性化建议**：基于数据的营养建议

#### 🍽️ **膳食计划管理** (`meal-plans/`)
- **计划创建**：个性化膳食计划创建和管理
- **目标导向**：基于用户目标的计划制定
- **灵活调整**：计划的修改和优化
- **营养均衡**：确保营养均衡和目标达成

#### 👨‍🍳 **食谱管理系统** (`recipes/`)
- **食谱创建**：详细的食谱信息和烹饪步骤
- **营养计算**：食谱营养价值自动计算
- **个人收藏**：用户食谱收藏和管理
- **分享功能**：食谱分享和交流社区

#### 🎯 **智能推荐系统** (`recommendations/`)
- **食物推荐**：基于用户偏好和历史数据的食物推荐
- **膳食推荐**：个性化膳食计划推荐
- **反馈机制**：推荐质量反馈和优化
- **机器学习**：基于用户行为的智能优化

## 📎 环境要求

### 必须工具
- 🚀 **Node.js** >= 18.0.0
- 📦 **npm** >= 8.0.0 或 **yarn** >= 1.22.0
- 🍃 **MongoDB** >= 5.0.0
- 🐳 **Docker** >= 20.0.0 (可选，推荐)
- 💙 **Docker Compose** >= 2.0.0 (可选，推荐)

### 🗺️ 开发环境推荐
- **操作系统**: macOS / Linux / Windows (WSL2)
- **IDE**: VS Code + NestJS 插件
- **版本管理**: Git 2.30+
- **网络**: 稳定的互联网连接（用于依赖安装）

## 🌍 多环境配置

项目支持三种环境：`development`、`qa`、`production`，确保开发、测试和生产数据的完全隔离。

### 📝 环境配置文件

| 环境 | 配置文件 | 数据库 | 端口 | Swagger | 特点 |
|------|-------------|----------|------|---------|--------|
| 🗺️ **开发环境** | `.env.development` | `nutriguide_dev` | 3000 | ✅ 启用 | 热重载、详细日志、测试数据 |
| 🧪 **QA 环境** | `.env.qa` | `nutriguide_qa` | 3000 | ✅ 启用 | 模拟生产、性能测试 |
| 🎆 **生产环境** | `.env.production` | `nutriguide_prod` | 3000 | ❌ 禁用 | 安全优化、性能优化 |

### ⚡ 快速环境切换

使用提供的脚本快速切换环境：

```bash
# 🚀 切换到开发环境
./scripts/setup-env.sh development

# 🧪 切换到QA环境
./scripts/setup-env.sh qa

# 🎆 切换到生产环境
./scripts/setup-env.sh production
```

> 💡 **小贴士**：脚本会自动复制对应的环境配置文件到 `.env` 并设置 `NODE_ENV` 环境变量。

## 🚀 安装与运行

### 📋 1. 安装依赖

```bash
# 克隆项目（如果还未克隆）
git clone <repository-url>
cd nutriguide-backend

# 安装 Node.js 依赖
npm install

# 或者使用 Yarn
yarn install
```

### ⚙️ 2. 环境配置

选择并设置目标环境：

```bash
# 🚀 设置开发环境（推荐）
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh development

# 📋 手动复制配置文件（可选）
cp .env.development .env
```

> 📝 **配置说明**：自动设置会复制环境配置文件到 `.env` 并设置 `NODE_ENV` 环境变量。

### 🔥 3. 启动服务

#### 💻 本地开发方式（推荐）

```bash
# 🚀 开发模式（自动重启 + 热重载）
npm run start:dev

# 🧪 QA环境模式
npm run start:qa

# 🎆 生产模式
npm run build
npm run start:prod

# 🔍 调试模式
npm run start:debug
```

> ⚠️ **注意**：本地开发需要本地 MongoDB 服务。如果没有安装，请使用 Docker 方式。

#### 🐳 Docker 方式（一键部署）

```bash
# 🚀 开发环境（包含 MongoDB + Mongo Express）
npm run docker:up:dev

# 🧪 QA环境
npm run docker:up:qa

# 🎆 生产环境
npm run docker:up:prod

# ⮝️ 停止所有服务
npm run docker:down
```

> 💡 **Docker 优势**：自动配置 MongoDB、初始化数据库、并提供 Web 管理界面。

### 🌍 4. 访问服务

启动成功后，你可以访问以下地址：

#### 🚀 开发环境
- 🎯 **API 服务**: http://localhost:3000/api/v1
- 📚 **API 文档**: http://localhost:3000/api/docs
- ❤️ **健康检查**: http://localhost:3000/health
- 🖳️ **MongoDB Admin**: http://localhost:8081 (Docker方式)
  - 用户名: `admin`
  - 密码: `admin123`

#### 🧪 QA环境
- 🎯 **API 服务**: http://localhost:3000/api/v1
- 📚 **API 文档**: http://localhost:3000/api/docs
- 🖳️ **MongoDB**: localhost:27018 (Docker方式)

#### 🎆 生产环境
- 🎯 **API 服务**: http://localhost:3000/api/v1
- 🖳️ **MongoDB**: localhost:27019 (Docker方式)
- ❌ **Swagger文档**: 在生产环境中被禁用

> 🐍 **快速测试**：使用 `curl http://localhost:3000/health` 检查服务状态

## 🛠️ 开发命令

### 💻 基本命令

```bash
# 🚀 开发模式启动（热重载）
npm run start:dev

# 🔨 构建项目
npm run build

# ✨ 代码格式化
npm run format

# 🔍 代码检查
npm run lint
```

### 🧪 测试命令

```bash
# 🎯 运行单元测试
npm run test

# 📊 运行测试并生成覆盖率报告
npm run test:cov

# 🚀 运行 E2E 测试
npm run test:e2e

# 👀 监听模式测试（自动重新运行）
npm run test:watch

# 🔍 调试模式测试
npm run test:debug
```

### 📋 数据库管理命令

```bash
# 🌱 播种测试数据（开发环境）
npm run db:seed

# 🗑️ 清空并重新播种
npm run db:seed:clear

# 🧪 QA环境播种
npm run db:seed:qa

# 🔄 数据库恢复（从备份恢复数据）
npm run db:restore          # 开发环境
npm run db:restore:qa       # QA环境
npm run db:restore:prod     # 生产环境

# 📊 集合名称标准化
npm run db:normalize development
```

## 🐳 Docker 命令

### 🔨 构建命令

```bash
# 🛠️ 构建基本镜像
npm run docker:build

# 🚀 构建开发环境镜像
npm run docker:build:dev

# 🧪 构建 QA环境镜像
npm run docker:build:qa

# 🎆 构建生产环境镜像
npm run docker:build:prod
```

### 🚀 服务管理

```bash
# 🟢 启动服务（不同环境）
npm run docker:up:dev      # 开发环境 + MongoDB + Mongo Express
npm run docker:up:qa       # QA环境 + MongoDB
npm run docker:up:prod     # 生产环境 + MongoDB

# ⮝️ 停止所有服务
npm run docker:down

# 🔄 查看服务状态
docker-compose -f docker-compose.dev.yml ps

# 📝 查看服务日志
docker-compose -f docker-compose.dev.yml logs -f
```

### 🌱 数据播种（Docker）

```bash
# 🌱 Docker 环境下播种数据
npm run docker:seed

# 🗑️ Docker 环境下清空并播种
npm run docker:seed:clear
```

> 💡 **Docker Compose 优势**：
> - 自动网络配置
> - 数据持久化存储
> - 环境隔离和一致性
> - 一键启动全套服务

## 数据库配置

### 环境对应的数据库

项目支持三个独立的数据库环境，确保开发、测试和生产数据的隔离：

- **开发环境**: `nutriguide` (端口: 27017)
- **QA环境**: `nutriguide_qa` (端口: 27017)
- **生产环境**: `nutriguide_prod` (端口: 27017)

### 数据库集合命名规范

所有集合名称统一使用 `snake_case` 格式，主要集合包括：

#### 核心业务集合
- `users` - 用户信息
- `authtokens` - 认证令牌
- `foods` - 食物数据库

#### 营养计划集合
- `meal_plans` - 营养计划
- `structured_meal_plans` - 结构化营养计划
- `seasonal_meal_plans` - 季节性营养计划
- `sample_meal_plans` - 示例营养计划

#### 食物相关集合
- `food_exchange_items` - 食物交换项目
- `food_exchange_table_complete` - 完整食物交换表
- `food_category_advice` - 食物类别建议
- `food_category_advice_detailed` - 详细食物类别建议
- `food_choices_guide` - 食物选择指南
- `food_selection_guide_complete` - 完整食物选择指南
- `food_medicine_substances` - 食物药物成分

#### 中医相关集合
- `tcm_dietary_recipes` - 中医饮食食谱
- `tcm_obesity_syndromes` - 中医肥胖综合征
- `tcm_food_medicine_recommendations` - 中医食药建议

#### 参考数据集合
- `dietary_principles` - 饮食原则
- `dietary_recommendations` - 饮食建议
- `obesity_standards` - 肥胖标准
- `intensity_levels` - 强度等级
- `physical_activities` - 体力活动
- `energy_calculation_formulas` - 能量计算公式
- `reference_tables` - 参考表
- `regional_food_availability` - 地区食物可用性
- `guide_introduction` - 指南介绍

### 数据库管理命令

```bash
# 数据库恢复 (从备份恢复数据)
npm run db:restore          # 开发环境
npm run db:restore:qa       # QA环境
npm run db:restore:prod     # 生产环境

# 环境数据恢复 (使用简化脚本)
npm run db:restore:env development
npm run db:restore:env qa
npm run db:restore:env prod

# 集合名称标准化
npm run db:normalize development
npm run db:normalize qa
npm run db:normalize prod

# 数据库种子数据
npm run db:seed             # 开发环境种子数据
npm run db:seed:clear       # 清空并重新种子
npm run db:seed:qa          # QA环境种子数据
```
- **生产环境**: `nutriguide_prod` (端口: 27019)

### 数据库初始化

#### Docker环境 (推荐)

项目包含MongoDB初始化脚本(`scripts/mongo-init.js`)，Docker启动时会自动：
- 创建必要的集合和索引
- 在开发环境中插入示例数据

#### 非Docker环境 (本地MongoDB)

如果您在本地运行MongoDB而不使用Docker，请使用提供的初始化脚本：

##### 前置要求

1. **安装MongoDB**: 确保本地已安装MongoDB 5.0+
   ```bash
   # macOS (使用Homebrew)
   brew install mongodb-community
   
   # Ubuntu/Debian
   sudo apt-get install mongodb-org
   
   # Windows: 从官网下载安装包
   ```

2. **启动MongoDB服务**
   ```bash
   # macOS/Linux
   sudo systemctl start mongod
   # 或者
   brew services start mongodb-community
   
   # Windows
   net start MongoDB
   ```

3. **安装MongoDB Shell (mongosh)**
   ```bash
   # 如果没有安装mongosh
   npm install -g mongosh
   ```

##### 使用初始化脚本

```bash
# 权限设置（首次运行）
chmod +x scripts/init-local-mongodb.sh

# 初始化开发环境 (默认)
./scripts/init-local-mongodb.sh

# 初始化QA环境
./scripts/init-local-mongodb.sh -e qa

# 初始化生产环境
./scripts/init-local-mongodb.sh -e production

# 自定义MongoDB连接
./scripts/init-local-mongodb.sh -e development -h localhost -p 27017

# 查看完整选项
./scripts/init-local-mongodb.sh --help
```

##### 脚本功能

该脚本会自动：
- ✅ 检查MongoDB连接
- ✅ 创建环境对应的数据库 (`nutriguide_dev`, `nutriguide_qa`, `nutriguide_prod`)
- ✅ 创建必要的集合：`users`, `authtokens`, `smsverifications`, `sociallogins`, `foods`, `nutritionplans`, `userprofiles`, `mealrecords`
- ✅ 创建所有必要的索引（email、username、phone等）
- ✅ 在开发环境中插入示例数据
- ✅ 显示后续配置步骤

##### 验证数据库初始化

```bash
# 连接到数据库验证
mongosh mongodb://localhost:27017/nutriguide_dev

# 查看集合
show collections

# 查看索引
db.users.getIndexes()

# 退出
exit
```

##### 手动初始化 (可选)

如果脚本无法使用，也可以手动执行：

```bash
# 连接MongoDB
mongosh mongodb://localhost:27017

# 切换到目标数据库
use nutriguide_dev

# 执行初始化脚本
load('scripts/mongo-init.js')
```

##### 环境配置更新

初始化完成后，确保更新环境配置文件：

```bash
# .env.development
MONGODB_URI=mongodb://localhost:27017/nutriguide_dev

# .env.qa  
MONGODB_URI=mongodb://localhost:27017/nutriguide_qa

# .env.production
MONGODB_URI=mongodb://localhost:27017/nutriguide_prod
```

## API 文档

项目集成了 Swagger，在非生产环境中访问 `/api/docs` 查看完整的 API 文档。

### 命令行友好的API信息

除了Swagger UI，还提供了命令行友好的API信息端点：

```bash
# 获取完整API信息 (JSON格式)
curl http://localhost:3000/api-info

# 获取Markdown格式的API文档
curl "http://localhost:3000/api-info?format=markdown"

# 获取cURL示例
curl "http://localhost:3000/api-info?format=curl"

# 只获取认证相关信息
curl "http://localhost:3000/api-info?section=auth"

# 只获取端点列表
curl "http://localhost:3000/api-info?section=endpoints"
```

支持的格式：
- `json` (默认): JSON格式的结构化数据
- `markdown`: Markdown格式的文档
- `yaml`: YAML格式的配置
- `curl`: cURL命令示例

支持的部分：
- `all` (默认): 完整信息
- `auth`: 认证相关信息
- `endpoints`: API端点列表
- `examples`: 使用示例

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

## 📎 项目状态验证

### ✅ 开发环境验证通过

🎉 **恭喜！项目已成功运行** 🎉

- ✅ **服务状态**: 正常运行
- ✅ **数据库连接**: MongoDB 成功连接
- ✅ **API 文档**: Swagger 可访问
- ✅ **环境配置**: 开发环境已配置
- ✅ **Docker 服务**: 容器化部署成功

### 🔗 快速访问链接

| 服务 | 地址 | 状态 |
|------|-----|------|
| 🎯 API 服务 | http://localhost:3000/api/v1 | ✅ 正常 |
| 📚 API 文档 | http://localhost:3000/api/docs | ✅ 可用 |
| ❤️ 健康检查 | http://localhost:3000/health | ✅ 正常 |
| 🖳️ 数据库管理 | http://localhost:8081 | ✅ 可用 |

### 🔍 快速测试

```bash
# 检查服务状态
curl http://localhost:3000/health

# 获取API信息
curl http://localhost:3000/api-info

# 查看Swagger文档
open http://localhost:3000/api/docs
```

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