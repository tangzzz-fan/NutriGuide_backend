好的，这是一份针对您NutriGuide项目第一阶段后端开发的规范文档草案。这份文档旨在提供一个清晰、一致的开发标准，以提高代码质量、团队协作效率和项目的可维护性。

**NutriGuide - 后端开发规范文档 (V1.0 - MVP阶段)**

**1. 引言**

*   **1.1. 目的**
    *   本文档旨在为NutriGuide后端开发团队提供一套统一的开发标准和最佳实践。
    *   目标是提高代码质量、可读性、可维护性，降低沟通成本，确保项目顺利进行。
*   **1.2. 适用范围**
    *   本规范适用于NutriGuide后端所有模块的开发，包括NestJS (TypeScript) 和 Python 部分。
*   **1.3. 读者对象**
    *   NutriGuide后端开发团队全体成员。
*   **1.4. 修订历史**
    *   V1.0 (YYYY-MM-DD): 初稿创建。

**2. 通用编码规范**

*   **2.1. 代码风格与格式化**
    *   **2.1.1. TypeScript/JavaScript (NestJS)**
        *   **格式化工具:** 统一使用 **Prettier**。项目根目录应包含 `.prettierrc.js` 或 `.prettierrc.json` 配置文件，并纳入版本控制。
            *   示例配置 (可根据团队偏好调整):
                ```json
                {
                  "singleQuote": true,
                  "trailingComma": "es5",
                  "printWidth": 100,
                  "tabWidth": 2,
                  "semi": true
                }
                ```
        *   **Linter工具:** 统一使用 **ESLint**，配合 `@typescript-eslint/parser` 和 `@typescript-eslint/eslint-plugin`。
            *   **规则集:** 推荐基于 `eslint:recommended` 和 `plugin:@typescript-eslint/recommended`，并可根据需要自定义规则。
            *   项目根目录应包含 `.eslintrc.js` 配置文件，并纳入版本控制。
        *   **IDE集成:** 强烈建议所有团队成员在IDE中安装并启用Prettier和ESLint插件，实现保存时自动格式化和实时错误提示。
    *   **2.1.2. Python**
        *   **代码风格:** 严格遵循 **PEP 8** 规范。
        *   **格式化工具:** 统一使用 **Black**。项目根目录可包含 `pyproject.toml` 进行Black的配置。
        *   **Linter工具:** 统一使用 **Flake8** (或 Pylint，团队协商一致)，并配置其检查PEP 8以及其他潜在问题。
        *   **IDE集成:** 强烈建议所有团队成员在IDE中安装并启用Black和Flake8插件。
    *   **2.1.3. 命名约定**
        *   **通用:**
            *   使用有意义的、描述性的英文名称。
            *   避免使用无意义的缩写，除非是广泛接受的行业标准缩写。
        *   **TypeScript/JavaScript (NestJS):**
            *   **变量/函数名:** camelCase (如 `userName`, `calculateTotal`)。
            *   **类名/接口名/枚举名/类型别名:** PascalCase (如 `UserService`, `IUserResponse`, `OrderStatus`)。
            *   **常量:** UPPER_CASE_SNAKE_CASE (如 `MAX_USERS`)。
            *   **文件名:** kebab-case (如 `user.service.ts`, `auth.controller.ts`) 或与导出的主要类/接口同名 (PascalCase)。NestJS CLI默认生成kebab-case。
        *   **Python:**
            *   **变量/函数名/方法名/模块名:** snake\_case (如 `user_name`, `calculate_total`, `user_service.py`)。
            *   **类名:** PascalCase (如 `UserService`)。
            *   **常量:** UPPER_CASE_SNAKE_CASE (如 `MAX_USERS`)。
    *   **2.1.4. 注释**
        *   **目的:** 解释代码的设计思路、复杂逻辑、注意事项或待办事项。
        *   **原则:** 代码应尽可能自解释，注释作为补充。避免过多不必要的注释。
        *   **TypeScript/JavaScript:** 使用 JSDoc 风格注释公共API (类、方法、函数)。
            ```typescript
            /**
             * Calculates the sum of two numbers.
             * @param a - The first number.
             * @param b - The second number.
             * @returns The sum of a and b.
             */
            function add(a: number, b: number): number {
              return a + b;
            }
            ```
        *   **Python:** 使用 Docstrings (PEP 257) 为模块、类、函数和方法编写文档字符串。
            ```python
            def add(a: int, b: int) -> int:
                """Calculates the sum of two numbers.

                Args:
                    a: The first number.
                    b: The second number.

                Returns:
                    The sum of a and b.
                """
                return a + b
            ```
        *   **TODO/FIXME:** 使用 `// TODO: (描述)` 或 `# TODO: (描述)` 标记待完成事项，`// FIXME: (描述)` 或 `# FIXME: (描述)` 标记需要修复的问题。

*   **2.2. 版本控制 (Git)**
    *   **2.2.1. 分支策略:**
        *   采用 **GitHub Flow** (或类似的简化模型)：
            *   `main` (或 `master`): 始终保持稳定、可部署的状态。只接受来自特性分支的Pull Request合并。
            *   **特性分支 (Feature Branches):** 从 `main` 分支创建，用于开发新功能或修复Bug。命名规则：`feature/descriptive-name` (如 `feature/user-authentication`) 或 `fix/issue-description`。
            *   **发布分支 (Release Branches - 可选):** 用于准备发布版本，进行最后的测试和Bug修复。
    *   **2.2.2. 提交信息 (Commit Messages):**
        *   严格遵循 **Conventional Commits** 规范。
        *   格式: `<type>(<scope>): <short summary>`
            *   `type`: `feat` (新功能), `fix` (Bug修复), `docs` (文档), `style` (格式), `refactor` (重构), `test` (测试), `chore` (构建/工具等)。
            *   `scope` (可选): 本次提交影响的范围 (如 `auth`, `user-profile`)。
            *   示例: `feat(auth): implement JWT token generation`
        *   提交信息应清晰、简洁地描述本次提交的内容。
    *   **2.2.3. Code Review:**
        *   所有向 `main` 分支合并的Pull Request (PR) **必须** 经过至少一位其他团队成员的Review。
        *   Reviewer应关注代码逻辑、风格规范、测试覆盖、潜在风险等。
        *   鼓励建设性的反馈和讨论。
    *   **2.2.4. .gitignore:**
        *   配置 `.gitignore` 文件，忽略IDE配置文件、构建产物、依赖目录 (`node_modules`, `venv`)、日志文件、`.env` 文件等。

**3. NestJS (TypeScript) 特定规范**

*   **3.1. 模块 (Modules)**
    *   遵循单一职责原则，将相关功能组织在独立的模块中。
    *   模块命名应清晰反映其功能 (如 `AuthModule`, `UsersModule`)。
    *   显式导入和导出所需的Providers, Controllers, Modules。
*   **3.2. 控制器 (Controllers)**
    *   控制器应保持轻量，主要负责请求路由、参数校验和调用Service层。
    *   避免在控制器中包含复杂的业务逻辑。
    *   使用DTO (Data Transfer Objects) 来定义请求体和响应体的数据结构，并使用 `class-validator` 和 `class-transformer` 进行数据校验和转换。
*   **3.3. 服务 (Services)**
    *   核心业务逻辑应封装在Service层。
    *   Service应是可注入的 (`@Injectable()`)。
    *   保持Service方法的职责单一。
*   **3.4. 数据传输对象 (DTOs)**
    *   使用类 (Class) 定义DTO，并使用 `class-validator` 装饰器进行属性校验。
    *   DTO应放在专门的 `dto` 目录下或模块内部的 `dto` 子目录。
    *   命名规范：`CreateUserDto`, `UpdateRecipeDto`, `UserResponseDto`。
*   **3.5. 数据库交互 (Mongoose & MongoDB)**
    *   **Schema定义:** 使用 Mongoose Schema 定义MongoDB集合的结构和类型。Schema文件应与Module相关联。
    *   **模型 (Models):** 通过 Schema 创建模型。
    *   **查询:** 优先使用Mongoose提供的查询构建器和方法。
    *   **索引:** 在Schema中为经常查询的字段定义索引。
    *   **避免在Controller中直接操作数据库模型**，应通过Service层进行。
*   **3.6. 错误处理**
    *   使用 NestJS 内置的HTTP异常类 (如 `HttpException`, `NotFoundException`, `BadRequestException`)。
    *   创建全局异常过滤器 (`ExceptionFilter`) 来统一处理未捕获的异常，并返回标准化的错误响应格式。
    *   错误响应格式应包含 `statusCode`, `message`, `error` (可选, 简短错误描述) 和 `timestamp`。
*   **3.7. 日志**
    *   使用 NestJS 内置的 `LoggerService` 或集成第三方日志库 (如 Winston, pino)。
    *   在关键操作（如用户登录、重要数据修改、外部API调用）和错误发生时记录日志。
    *   日志内容应包含时间戳、日志级别、上下文 (如模块名、请求ID)、消息。
    *   生产环境应配置合理的日志级别和输出目标 (如文件、日志服务)。
*   **3.8. 配置文件管理**
    *   使用 `@nestjs/config` 模块管理环境变量。
    *   在项目根目录创建 `.env` 文件 (不提交到版本库) 存储本地开发配置。
    *   生产环境通过环境变量注入配置。
    *   敏感信息 (数据库密码、API密钥等) **严禁** 硬编码或提交到版本库。
*   **3.9. 异步操作**
    *   广泛使用 `async/await` 处理异步操作，确保代码可读性。
    *   正确处理Promise的reject情况，避免未捕获的Promise拒绝。
*   **3.10. 依赖注入**
    *   充分利用NestJS的依赖注入机制，实现松耦合。
    *   优先使用构造函数注入。

**4. Python 特定规范 (主要用于数据处理、PDF解析、推荐逻辑)**

*   **4.1. 虚拟环境**
    *   每个Python项目（或子项目）**必须** 使用独立的虚拟环境 (如 `venv`, `conda`)。
    *   依赖项应记录在 `requirements.txt` (使用 `pip freeze > requirements.txt`) 或 `pyproject.toml` (如使用Poetry或PDM)。
*   **4.2. 模块化**
    *   将相关的函数和类组织在独立的Python模块 (.py文件) 中。
    *   使用包 (Package, 包含 `__init__.py` 的目录) 来组织更复杂的模块结构。
*   **4.3. 函数与类设计**
    *   函数应短小且职责单一。
    *   类设计遵循面向对象原则 (封装、继承、多态)。
    *   使用类型提示 (Type Hinting, PEP 484) 增强代码可读性和可维护性。
        ```python
        def greet(name: str) -> str:
            return f"Hello, {name}"
        ```
*   **4.4. 错误处理**
    *   使用 `try...except...else...finally` 结构处理可能发生的异常。
    *   捕获具体的异常类型，而不是笼统的 `Exception`。
    *   在适当的时候抛出自定义异常或内置异常。
*   **4.5. 日志**
    *   使用 Python 内置的 `logging` 模块。
    *   配置日志格式、级别和处理器 (Handler)。
    *   在脚本入口或应用初始化时配置日志。
*   **4.6. 脚本设计 (若有独立运行的脚本)**
    *   使用 `if __name__ == "__main__":` 来组织脚本的执行入口。
    *   考虑使用 `argparse` 模块处理命令行参数。
*   **4.7. 与NestJS的交互 (若Python作为独立服务)**
    *   若Python逻辑通过API暴露给NestJS调用 (如使用Flask/FastAPI)，则Python API也应遵循RESTful原则和统一的响应格式。
    *   考虑API间的认证和授权。

**5. 测试规范**

*   **5.1. 单元测试**
    *   **NestJS:** 使用 **Jest** 框架。每个Service的核心方法、Controller的简单逻辑、Pipe/Guard/Interceptor等都应有单元测试。
    *   **Python:** 使用 **unittest** 或 **pytest** 框架。每个核心函数和类方法都应有单元测试。
    *   测试应覆盖正常情况、边界情况和异常情况。
    *   模拟 (Mock/Stub) 外部依赖 (如数据库操作、第三方API调用)。
*   **5.2. 集成测试**
    *   **NestJS:** 测试模块间的交互，例如Controller调用Service，Service与数据库的交互。可以使用 `Test.createTestingModule()` 创建测试模块。
    *   测试API接口的请求和响应是否符合预期。
*   **5.3. 测试覆盖率**
    *   MVP阶段目标：核心模块单元测试覆盖率达到 **60-70%**。
    *   逐步提高测试覆盖率。
    *   可以使用代码覆盖率工具 (如 Jest的 `--coverage` 选项, Python的 `coverage.py`) 来监控。
*   **5.4. 测试文件组织**
    *   **NestJS:** 测试文件通常与被测试文件同名，后缀为 `.spec.ts` (如 `user.service.spec.ts`)，并放在同一目录下。
    *   **Python:** 测试文件通常放在一个名为 `tests` 的目录下，文件名以 `test_` 开头 (如 `test_user_service.py`)。

**6. API 设计规范**

*   **6.1. RESTful 原则**
    *   使用标准的HTTP方法: `GET` (查询), `POST` (创建), `PUT` (更新整个资源), `PATCH` (部分更新资源), `DELETE` (删除)。
    *   资源路径使用名词复数 (如 `/users`, `/recipes`)。
    *   路径参数用于标识特定资源 (如 `/users/{userId}`)。
*   **6.2. 版本管理**
    *   在API路径中包含版本号，如 `/api/v1/users`。
*   **6.3. 请求与响应**
    *   **请求体/响应体格式:** 统一使用 JSON。
    *   **统一响应结构 (成功):**
        ```json
        {
          "statusCode": 200, // 或 201, 204 等
          "message": "Operation successful", // 可选
          "data": { ... } // 或 [...] 或 null
        }
        ```
    *   **统一响应结构 (错误):**
        ```json
        {
          "statusCode": 400, // 或 401, 403, 404, 500 等
          "message": "Validation failed", // 或其他错误描述
          "error": "Bad Request", // HTTP状态文本
          "errors": [ // 可选，更详细的错误列表，如校验错误
            { "field": "email", "message": "Email is invalid" }
          ],
          "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ"
        }
        ```
    *   **HTTP状态码:** 准确使用HTTP状态码 (2xx成功, 4xx客户端错误, 5xx服务端错误)。
*   **6.4. 参数校验**
    *   所有客户端输入 (路径参数、查询参数、请求体) 都必须进行严格校验。NestJS中使用 `ValidationPipe` 和DTO中的 `class-validator`。
*   **6.5. 分页与排序**
    *   对于列表接口，支持分页 (如 `?page=1&limit=20`) 和排序 (如 `?sortBy=createdAt&order=desc`)。
*   **6.6. API文档**
    *   **NestJS:** 使用 `@nestjs/swagger` 模块自动生成OpenAPI (Swagger) 文档。
    *   Controller和DTO中的装饰器应包含必要的描述信息，以生成清晰的文档。
    *   API文档应随代码更新而保持最新。

**7. 安全规范**

*   **7.1. 输入验证:** (已在API设计中强调) 始终验证所有不受信任的输入。
*   **7.2. 输出编码:** (主要针对前端渲染，后端API返回JSON通常问题不大，但需注意) 确保返回给客户端的数据不会引发XSS。
*   **7.3. 认证与授权**
    *   使用JWT进行API认证。JWT应包含必要的声明 (如 `userId`, `exp`)。
    *   敏感操作应进行授权检查 (如通过NestJS Guards)。
    *   JWT密钥应妥善保管，不在代码中硬编码。
*   **7.4. 密码存储**
    *   用户密码**必须**使用强哈希算法 (如 bcrypt, Argon2) 加盐存储。严禁明文存储密码。
*   **7.5. 依赖库安全**
    *   定期检查项目依赖库是否存在已知的安全漏洞 (如使用 `npm audit` for Node.js, `safety` or `pip-audit` for Python)。
    *   及时更新存在漏洞的依赖库。
*   **7.6. HTTPS**
    *   生产环境**必须**使用HTTPS。
*   **7.7. 错误信息**
    *   避免在生产环境向客户端暴露详细的系统错误信息或堆栈跟踪。

**8. 文档规范**

*   **8.1. 项目README.md**
    *   项目根目录的 `README.md` 应包含：
        *   项目简介。
        *   技术栈。
        *   环境搭建步骤。
        *   启动命令 (开发、生产)。
        *   测试命令。
        *   主要贡献者 (可选)。
*   **8.2. API文档:** (见6.6)
*   **8.3. 架构文档 (可选，根据需要)**
    *   描绘系统主要模块、数据流、部署架构等。
*   **8.4. 代码注释:** (见2.1.4)

**9. 协作与沟通**

*   **9.1. 定期会议 (可选)**
    *   如每日站会 (Daily Stand-up)、周会，用于同步进度、暴露问题。
*   **9.2. 即时通讯工具**
    *   使用统一的即时通讯工具 (如Slack, Microsoft Teams, 钉钉) 进行日常沟通。
*   **9.3. 任务管理工具**
    *   使用任务管理工具 (如Jira, Trello, Asana, 飞书项目)跟踪任务状态。
*   **9.4. 知识共享**
    *   鼓励团队成员分享知识和经验，如通过内部Wiki、技术分享会等。

**10. 附则**

*   本规范将根据项目进展和团队反馈进行修订和完善。
*   团队成员应主动学习并遵守本规范。
*   对于规范中未明确或有争议的事项，应由团队讨论决定。

---