# NutriGuide Backend API - cURL Examples

# 快速开始指南
# 1. 登录获取Token
curl -X POST http://localhost:3000/api/v1/auth/login/email \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@nutriguide.com",
    "password": "Password123!",
    "deviceId": "cli-tool"
  }'

# 2. 使用Token调用API（替换 YOUR_ACCESS_TOKEN）
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# 3. 手机号快速注册（开发环境万能验证码：123456）
curl -X POST http://localhost:3000/api/v1/auth/register/phone \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138888",
    "smsCode": "123456"
  }'

# 4. 创建食物记录
curl -X POST http://localhost:3000/api/v1/food-logs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "foodId": "FOOD_ID",
    "quantity": 100,
    "unit": "g",
    "mealType": "breakfast"
  }'

# 更多API请参考: http://localhost:3000/api/docs

