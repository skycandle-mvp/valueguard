# ValueGuard 后端接口设计文档

## 项目功能梳理

### 1. 用户认证模块
- 邮箱注册/登录
- 手机号注册/登录（需要短信验证码）
- 用户信息管理

### 2. 事件报告模块
- 创建事件报告（包含公司名称、标题、描述、分类）
- 查看事件列表（支持搜索、分页）
- 查看事件详情
- 提交审核请求（修改或更正）

### 3. 评论模块
- 对事件发表评论
- 查看评论列表（按时间倒序）

### 4. 公司模块
- 查看公司详情
- 查看公司相关事件列表

## 接口列表

### 用户认证接口

#### 1. 邮箱注册
- **POST** `/api/auth/signup/email`
- 请求体：
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "displayName": "用户名"
  }
  ```
- 响应：
  ```json
  {
    "success": true,
    "message": "注册成功",
    "data": {
      "uid": "user-id",
      "email": "user@example.com",
      "displayName": "用户名"
    }
  }
  ```

#### 2. 手机号注册
- **POST** `/api/auth/signup/phone`
- 请求体：
  ```json
  {
    "phoneNumber": "+8613812345678",
    "password": "password123",
    "email": "user@example.com",  // 可选
    "displayName": "用户名",  // 可选
    "idToken": "firebase-id-token"  // Firebase 验证后的 token
  }
  ```
- 响应：同邮箱注册

#### 3. 登录
- **POST** `/api/auth/login`
- 请求体：
  ```json
  {
    "account": "user@example.com" 或 "+8613812345678",
    "password": "password123"
  }
  ```
- 响应：
  ```json
  {
    "success": true,
    "message": "登录成功",
    "data": {
      "token": "jwt-token",
      "user": {
        "uid": "user-id",
        "email": "user@example.com",
        "displayName": "用户名",
        "photoURL": "avatar-url"
      }
    }
  }
  ```

#### 4. 解析登录账号（邮箱/手机号）
- **POST** `/api/auth/resolve-email`
- 请求体：
  ```json
  {
    "account": "user@example.com" 或 "+8613812345678"
  }
  ```
- 响应：
  ```json
  {
    "email": "user@example.com",
    "error": null
  }
  ```

#### 5. 获取当前用户信息
- **GET** `/api/auth/me`
- 需要认证
- 响应：
  ```json
  {
    "success": true,
    "data": {
      "uid": "user-id",
      "email": "user@example.com",
      "displayName": "用户名",
      "photoURL": "avatar-url"
    }
  }
  ```

### 事件报告接口

#### 1. 创建事件报告
- **POST** `/api/incidents`
- 需要认证
- 请求体：
  ```json
  {
    "companyName": "公司名称",
    "title": "事件标题",
    "description": "事件描述",
    "categories": ["分类1", "分类2"]
  }
  ```
- 响应：
  ```json
  {
    "success": true,
    "message": "事件提交成功",
    "data": {
      "id": "incident-id",
      "companyName": "公司名称",
      "title": "事件标题",
      "description": "事件描述",
      "categories": ["分类1", "分类2"],
      "date": "2024-01-01T00:00:00Z",
      "userId": "user-id",
      "user": {
        "uid": "user-id",
        "displayName": "用户名",
        "photoURL": "avatar-url"
      }
    }
  }
  ```

#### 2. 获取事件列表
- **GET** `/api/incidents`
- 查询参数：
  - `page`: 页码（默认 1）
  - `size`: 每页数量（默认 20）
  - `search`: 搜索关键词（可选，搜索标题、公司名称、分类）
  - `sort`: 排序方式（默认 `date,desc`）
- 响应：
  ```json
  {
    "success": true,
    "data": {
      "content": [
        {
          "id": "incident-id",
          "companyName": "公司名称",
          "title": "事件标题",
          "description": "事件描述（截断）",
          "categories": ["分类1"],
          "date": "2024-01-01T00:00:00Z",
          "user": {
            "uid": "user-id",
            "displayName": "用户名",
            "photoURL": "avatar-url"
          }
        }
      ],
      "totalElements": 100,
      "totalPages": 5,
      "currentPage": 1,
      "pageSize": 20
    }
  }
  ```

#### 3. 获取事件详情
- **GET** `/api/incidents/{id}`
- 响应：
  ```json
  {
    "success": true,
    "data": {
      "id": "incident-id",
      "companyName": "公司名称",
      "title": "事件标题",
      "description": "完整的事件描述",
      "categories": ["分类1", "分类2"],
      "date": "2024-01-01T00:00:00Z",
      "userId": "user-id",
      "user": {
        "uid": "user-id",
        "displayName": "用户名",
        "photoURL": "avatar-url"
      }
    }
  }
  ```

#### 4. 提交审核请求
- **POST** `/api/incidents/{id}/review`
- 请求体：
  ```json
  {
    "review": "补充信息或更正内容"
  }
  ```
- 响应：
  ```json
  {
    "success": true,
    "message": "已提交审核"
  }
  ```

### 评论接口

#### 1. 发表评论
- **POST** `/api/incidents/{incidentId}/comments`
- 需要认证
- 请求体：
  ```json
  {
    "comment": "评论内容"
  }
  ```
- 响应：
  ```json
  {
    "success": true,
    "message": "评论已发布",
    "data": {
      "id": "comment-id",
      "text": "评论内容",
      "userId": "user-id",
      "incidentId": "incident-id",
      "createdAt": "2024-01-01T00:00:00Z",
      "user": {
        "uid": "user-id",
        "displayName": "用户名",
        "photoURL": "avatar-url"
      }
    }
  }
  ```

#### 2. 获取评论列表
- **GET** `/api/incidents/{incidentId}/comments`
- 查询参数：
  - `page`: 页码（默认 1）
  - `size`: 每页数量（默认 20）
  - `sort`: 排序方式（默认 `createdAt,desc`）
- 响应：
  ```json
  {
    "success": true,
    "data": {
      "content": [
        {
          "id": "comment-id",
          "text": "评论内容",
          "userId": "user-id",
          "incidentId": "incident-id",
          "createdAt": "2024-01-01T00:00:00Z",
          "user": {
            "uid": "user-id",
            "displayName": "用户名",
            "photoURL": "avatar-url"
          }
        }
      ],
      "totalElements": 50,
      "totalPages": 3,
      "currentPage": 1,
      "pageSize": 20
    }
  }
  ```

### 公司接口

#### 1. 获取公司详情
- **GET** `/api/companies/{name}`
- 响应：
  ```json
  {
    "success": true,
    "data": {
      "id": "company-id",
      "name": "公司名称",
      "logoUrl": "logo-url",
      "incidentCount": 10
    }
  }
  ```

#### 2. 获取公司相关事件
- **GET** `/api/companies/{name}/incidents`
- 查询参数：
  - `page`: 页码（默认 1）
  - `size`: 每页数量（默认 20）
- 响应：同事件列表接口

## 技术栈

- Spring Boot 3.x
- Spring Data JPA
- Spring Security (JWT 认证)
- MySQL/PostgreSQL
- Maven/Gradle

