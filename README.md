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

## 🚀 Features

### Core Modules

#### 👤 User Management
- Complete user CRUD operations
- User profile management with health metrics
- Email verification system
- User statistics and analytics
- Soft delete with restore functionality

#### 🔐 Authentication & Authorization
- **Multiple Login Methods:**
  - Email/Username + Password
  - Phone + Password
  - Phone + SMS Code (with auto-registration)
  - Phone One-Tap Login (mobile SDK integration)
  - Social Login (WeChat, Apple, Google, Facebook)
- **JWT-based Authentication:**
  - Access tokens (1 hour expiry)
  - Refresh tokens (30-60 days based on "remember me")
  - Device-specific token management
- **SMS Verification:**
  - Rate limiting (1 SMS per minute)
  - 6-digit codes with 5-minute expiry
  - Multiple verification types (login, registration, etc.)
- **Security Features:**
  - Password hashing with bcrypt (12 salt rounds)
  - Token revocation and logout from all devices
  - User account status validation

### 🏗️ Technical Features

- **Environment Configuration:** Development, QA, and Production setups
- **Database:** MongoDB with Mongoose ODM
- **API Documentation:** Swagger/OpenAPI integration
- **Testing:** Comprehensive unit tests with Jest
- **Docker Support:** Multi-environment containerization
- **Code Quality:** ESLint, Prettier, and TypeScript strict mode
- **Error Handling:** Global exception filters with standardized responses

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd nutriguide-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration

Create environment files based on your needs:

```bash
# Development
cp .env.example .env.development

# QA
cp .env.example .env.qa

# Production  
cp .env.example .env.production
```

**Required Environment Variables:**
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nutriguide_dev
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=1h
PORT=3000
```

### 4. Database Setup

#### Option A: Using Docker (Recommended)
```bash
# Development environment
docker-compose -f docker-compose.dev.yml up -d

# QA environment
docker-compose -f docker-compose.qa.yml up -d

# Production environment
docker-compose -f docker-compose.prod.yml up -d
```

#### Option B: Local MongoDB
```bash
# Initialize MongoDB with indexes and collections
chmod +x scripts/init-local-mongodb.sh
./scripts/init-local-mongodb.sh development

# Or manually start MongoDB and the application will create collections
mongod --dbpath /path/to/your/db
```

## 🚀 Running the Application

### Development Mode
```bash
# With hot reload
npm run start:dev

# With Docker
docker-compose -f docker-compose.dev.yml up
```

### Production Mode
```bash
# Build and start
npm run build
npm run start:prod

# With Docker
docker-compose -f docker-compose.prod.yml up
```

## 🧪 Testing

```bash
# Unit tests
npm test

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📚 API Documentation

Once the application is running, access the Swagger documentation at:
- Development: http://localhost:3000/api/docs
- QA: http://localhost:3001/api/docs  
- Production: http://localhost:3002/api/docs

### Authentication Endpoints

#### Registration Methods
- `POST /auth/register/phone` - **Register with phone number only (recommended)**
- `POST /auth/register` - Traditional registration (all fields required)

#### Login Methods
- `POST /auth/login/email` - Email/Username + Password
- `POST /auth/login/phone` - Phone + Password
- `POST /auth/login/sms` - Phone + SMS Code
- `POST /auth/login/one-tap` - Phone One-Tap (Mobile SDK)
- `POST /auth/login/social` - Social Login (WeChat, Apple, etc.)

#### SMS Verification
- `POST /auth/sms/send` - Send SMS verification code
- `POST /auth/sms/verify` - Verify SMS code

#### 开发环境特殊功能

**万能验证码**: 在开发环境中，可以使用 `123456` 作为万能验证码，适用于所有SMS验证场景，无需真实发送短信，节省开发成本。

- **万能验证码**: `123456`
- **适用环境**: 仅 `NODE_ENV=development`
- **支持场景**: 登录、注册、密码重置、手机验证
- **详细说明**: 查看 [开发环境特殊功能文档](docs/DEVELOPMENT_FEATURES.md)

使用示例：
```bash
# 发送验证码（开发环境会提示可使用万能验证码）
curl -X POST http://localhost:3000/api/v1/auth/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138888", "type": "login"}'

# 使用万能验证码登录
curl -X POST http://localhost:3000/api/v1/auth/login/sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138888", "smsCode": "123456", "deviceId": "web-browser"}'
```

#### 📱 手机号注册 (推荐方式)

**新的简化注册流程**: 用户只需要提供手机号即可完成注册，其他信息都是可选的。

```bash
# 1. 发送注册验证码
curl -X POST http://localhost:3000/api/v1/auth/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "13900000001", "type": "register"}'

# 2. 手机号注册（最简方式）
curl -X POST http://localhost:3000/api/v1/auth/register/phone \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13900000001",
    "smsCode": "123456"
  }'

# 3. 手机号注册（包含可选信息）
curl -X POST http://localhost:3000/api/v1/auth/register/phone \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13900000001",
    "smsCode": "123456",
    "firstName": "张",
    "lastName": "三",
    "email": "zhangsan@example.com",
    "password": "MySecurePass123!"
  }'
```

**字段说明**:
- ✅ **必须字段**: `phone`, `smsCode`
- 🔧 **可选字段**: `email`, `username`, `password`, `firstName`, `lastName`, `birthDate`, `gender`, `height`, `weight`, `activityLevel`
- 🎯 **自动生成**: 如果未提供，系统会自动生成 `username`、`email` 和随机 `password`

#### 默认测试用户

系统提供了以下默认测试用户，详细信息请查看 [默认用户文档](docs/DEFAULT_USERS.md)：

- **管理员**: `admin@nutriguide.com` / `admin` / `Password123!`
- **测试用户1**: `john.doe@example.com` / `johndoe` / `Password123!`
- **测试用户2**: `jane.smith@example.com` / `janesmith` / `Password123!`
- **测试用户3**: `test.user@example.com` / `testuser` / `Password123!`

#### 改进的错误处理

认证API现在提供更具体的错误信息：

- `AUTH_001`: 用户不存在
- `AUTH_002`: 密码错误
- `AUTH_003`: 账户已停用
- `AUTH_004`: 邮箱未验证
- `AUTH_005`: 验证码无效或已过期
- `AUTH_006`: 短信发送频率限制
- `AUTH_007`: 邮箱已被注册
- `AUTH_008`: 用户名已被占用
- `AUTH_009`: 手机号已被注册
- `AUTH_010`: 刷新令牌无效
- `AUTH_011`: 第三方登录失败
- `AUTH_012`: 一键登录失败

错误响应示例：
```json
{
  "statusCode": 401,
  "message": "Invalid password",
  "error": "INVALID_PASSWORD",
  "details": "The provided password is incorrect",
  "code": "AUTH_002",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Token Management
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (revoke tokens)
- `GET /auth/profile` - Get current user profile

#### User Management
- `GET /users` - List users (paginated)
- `POST /users` - Create user
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Soft delete user
- `POST /users/:id/restore` - Restore deleted user
- `GET /users/statistics` - User statistics

## 🏗️ Project Structure

```
src/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── common/                    # Shared utilities
│   ├── dto/                   # Common DTOs (pagination, etc.)
│   └── filters/               # Exception filters
├── config/                    # Configuration files
│   ├── database.config.ts     # Database configuration
│   └── environment.config.ts  # Environment configuration
└── modules/                   # Feature modules
    ├── auth/                  # Authentication module
    │   ├── dto/               # Auth DTOs
    │   ├── guards/            # JWT guards
    │   ├── interfaces/        # Auth interfaces
    │   ├── schemas/           # MongoDB schemas
    │   └── strategies/        # Passport strategies
    └── user/                  # User management module
        ├── dto/               # User DTOs
        └── schemas/           # User schemas
```

## 🔧 Development Guidelines

### Code Style
- Follow the `.cursorrules` specifications
- Use TypeScript strict mode
- Implement comprehensive error handling
- Write unit tests for all services and controllers
- Use Swagger annotations for API documentation

### Database Design
- Use MongoDB with Mongoose ODM
- Implement proper indexing for performance
- Use soft deletes for user data
- Store sensitive data securely (hashed passwords, etc.)

### Authentication Flow
1. User provides credentials via any supported method
2. System validates credentials and user status
3. JWT access token and refresh token are generated
4. Tokens are returned to client
5. Client uses access token for authenticated requests
6. Refresh token used to obtain new access tokens

## 🐳 Docker Configuration

### Multi-Environment Setup
- **Development:** Port 3000, MongoDB on 27017
- **QA:** Port 3001, MongoDB on 27018  
- **Production:** Port 3002, MongoDB on 27019

### Services
- **Backend API:** NestJS application
- **MongoDB:** Database with initialization scripts
- **Mongo Express:** Database admin UI (development only)

## 📊 Monitoring & Logging

- Structured logging with context information
- Request/response logging
- Error tracking with stack traces
- Performance monitoring capabilities

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting for SMS and API endpoints
- Input validation and sanitization
- CORS configuration
- Environment-based security settings

## 🤝 Contributing

1. Follow the established code style and patterns
2. Write comprehensive tests for new features
3. Update documentation for API changes
4. Use conventional commit messages
5. Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License.

---

**NutriGuide Backend** - Building the future of personalized nutrition tracking! 🥗✨ 