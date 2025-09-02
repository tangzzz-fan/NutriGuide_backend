#!/bin/bash

# NutriGuide API 信息导出工具
# 用于快速生成各种格式的API文档，便于其他端团队开发使用

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API基础URL
API_BASE_URL="http://localhost:3000"

# 函数：打印带颜色的信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查API服务是否运行
check_api_service() {
    print_info "检查API服务状态..."
    
    if curl -s "${API_BASE_URL}/health" > /dev/null 2>&1; then
        print_success "API服务运行正常"
        return 0
    else
        print_error "API服务未运行，请先启动服务："
        echo "  npm run start:dev"
        echo "  或者"
        echo "  npm run docker:up:dev"
        exit 1
    fi
}

# 生成各种格式的API文档
generate_docs() {
    local output_dir="./api-docs"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    
    print_info "创建输出目录: ${output_dir}"
    mkdir -p "${output_dir}"
    
    print_info "生成API文档..."
    
    # 1. 生成完整的JSON格式文档
    print_info "生成JSON格式文档..."
    curl -s "${API_BASE_URL}/api-info" | jq '.' > "${output_dir}/api-full.json"
    
    # 2. 生成认证信息
    print_info "生成认证信息文档..."
    curl -s "${API_BASE_URL}/api-info?section=auth" | jq '.data' > "${output_dir}/auth-info.json"
    
    # 3. 生成API端点列表
    print_info "生成API端点列表..."
    curl -s "${API_BASE_URL}/api-info?section=endpoints" | jq '.data.endpoints' > "${output_dir}/endpoints.json"
    
    # 4. 生成Markdown格式文档
    print_info "生成Markdown格式文档..."
    curl -s "${API_BASE_URL}/api-info?format=markdown" | jq -r '.data' > "${output_dir}/api-guide.md"
    
    # 5. 生成cURL示例
    print_info "生成cURL命令示例..."
    curl -s "${API_BASE_URL}/api-info?format=curl" | jq -r '.data' > "${output_dir}/curl-examples.sh"
    chmod +x "${output_dir}/curl-examples.sh"
    
    # 6. 生成Postman集合
    print_info "生成Postman集合..."
    curl -s "${API_BASE_URL}/api-info?format=postman" | jq '.data' > "${output_dir}/NutriGuide-API.postman_collection.json"
    
    # 7. 生成环境配置信息
    print_info "生成环境配置信息..."
    curl -s "${API_BASE_URL}/api-info?section=env" | jq '.data.environment' > "${output_dir}/environment-info.json"
    
    # 8. 生成前端团队快速开始指南
    print_info "生成前端快速开始指南..."
    cat > "${output_dir}/frontend-quickstart.md" << 'EOF'
# NutriGuide API - 前端快速开始指南

## 🚀 快速开始

### 1. 基础配置

```javascript
const API_BASE_URL = 'http://localhost:3000/api/v1';

// 请求配置
const apiConfig = {
  headers: {
    'Content-Type': 'application/json',
  }
};
```

### 2. 认证流程

```javascript
// 登录获取Token
async function login(identifier, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login/email`, {
    method: 'POST',
    ...apiConfig,
    body: JSON.stringify({
      identifier,
      password,
      deviceId: 'web-app',
      rememberMe: false
    })
  });
  
  const result = await response.json();
  if (result.statusCode === 200) {
    localStorage.setItem('accessToken', result.data.accessToken);
    localStorage.setItem('refreshToken', result.data.refreshToken);
    return result.data;
  }
  throw new Error(result.message);
}

// 携带Token的请求
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...apiConfig,
    ...options,
    headers: {
      ...apiConfig.headers,
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
}
```

### 3. 常用API调用

```javascript
// 获取用户资料
async function getUserProfile() {
  const response = await apiRequest('/users/profile');
  return response.json();
}

// 搜索食物
async function searchFoods(query, limit = 10) {
  const response = await apiRequest(`/foods/search?query=${encodeURIComponent(query)}&limit=${limit}`);
  return response.json();
}

// 创建食物记录
async function createFoodLog(foodLog) {
  const response = await apiRequest('/food-logs', {
    method: 'POST',
    body: JSON.stringify(foodLog)
  });
  return response.json();
}
```

### 4. 默认测试账户

- **管理员账户**: admin@nutriguide.com / Password123!
- **测试用户**: john.doe@example.com / Password123!

### 5. 开发环境特性

- **万能短信验证码**: 123456 (仅开发环境)
- **API文档**: http://localhost:3000/api/docs
- **数据库管理**: http://localhost:8081

EOF
    
    print_success "所有文档已生成到目录: ${output_dir}"
    print_info "文档列表："
    ls -la "${output_dir}/"
}

# 显示使用帮助
show_help() {
    echo "NutriGuide API 信息导出工具"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -c, --check    仅检查API服务状态"
    echo "  -q, --quick    快速导出（仅生成常用格式）"
    echo ""
    echo "示例:"
    echo "  $0              # 生成所有格式的文档"
    echo "  $0 --check      # 检查API服务状态"
    echo "  $0 --quick      # 快速生成常用文档"
    echo ""
}

# 快速导出
quick_export() {
    local output_dir="./quick-api-docs"
    
    print_info "快速导出模式"
    mkdir -p "${output_dir}"
    
    # 认证信息
    curl -s "${API_BASE_URL}/api-info?section=auth&format=markdown" | jq -r '.data' > "${output_dir}/auth.md"
    
    # cURL示例
    curl -s "${API_BASE_URL}/api-info?format=curl" | jq -r '.data' > "${output_dir}/curl-examples.sh"
    chmod +x "${output_dir}/curl-examples.sh"
    
    # 端点列表
    curl -s "${API_BASE_URL}/api-info?section=endpoints" | jq '.data.endpoints' > "${output_dir}/endpoints.json"
    
    print_success "快速文档已生成到: ${output_dir}"
}

# 主函数
main() {
    case "${1:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--check)
            check_api_service
            exit 0
            ;;
        -q|--quick)
            check_api_service
            quick_export
            exit 0
            ;;
        "")
            check_api_service
            generate_docs
            ;;
        *)
            print_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"