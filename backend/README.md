# ValueGuard Backend

ValueGuard 后端服务，基于 Spring Boot 3.x 开发。

## 技术栈

- Spring Boot 3.2.0
- MyBatis 3.0.3
- Spring Security (JWT 认证)
- MySQL
- Maven
- Lombok

## 功能模块

1. **用户认证模块**
   - 邮箱注册/登录
   - 手机号注册/登录
   - JWT Token 认证

2. **事件报告模块**
   - 创建事件报告
   - 查询事件列表（支持搜索、分页）
   - 查看事件详情
   - 提交审核请求

3. **评论模块**
   - 发表评论
   - 查看评论列表

4. **公司模块**
   - 查看公司详情
   - 查看公司相关事件

## 快速开始

### 1. 环境要求

- JDK 17+
- Maven 3.6+
- MySQL 8.0+ 或 PostgreSQL 12+

### 2. 数据库配置

创建数据库：

```sql
CREATE DATABASE valueguard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

执行数据库初始化脚本（可选，如果表已存在可跳过）：

```bash
mysql -u your_username -p valueguard < src/main/resources/schema.sql
```

或者手动执行 `src/main/resources/schema.sql` 中的 SQL 语句。

修改 `application.yml` 中的数据库连接信息：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/valueguard?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: your_username
    password: your_password
```

### 3. JWT 配置

修改 `application.yml` 中的 JWT 密钥（生产环境请使用更安全的密钥）：

```yaml
jwt:
  secret: your-secret-key-change-in-production
  expiration: 86400000 # 24 hours
```

### 4. 运行项目

```bash
# 编译项目
mvn clean install

# 运行项目
mvn spring-boot:run
```

或者使用 IDE 直接运行 `ValueGuardApplication` 类。

### 5. 访问接口

服务启动后，访问地址：`http://localhost:8080/api`

## API 文档

详细的 API 接口文档请参考 [API_DESIGN.md](../API_DESIGN.md)

## 主要接口

### 认证接口

- `POST /api/auth/signup/email` - 邮箱注册
- `POST /api/auth/signup/phone` - 手机号注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/resolve-email` - 解析登录账号
- `GET /api/auth/me` - 获取当前用户信息

### 事件接口

- `POST /api/incidents` - 创建事件（需要认证）
- `GET /api/incidents` - 获取事件列表
- `GET /api/incidents/{id}` - 获取事件详情
- `POST /api/incidents/{id}/review` - 提交审核请求

### 评论接口

- `POST /api/incidents/{incidentId}/comments` - 发表评论（需要认证）
- `GET /api/incidents/{incidentId}/comments` - 获取评论列表

### 公司接口

- `GET /api/companies/{name}` - 获取公司详情
- `GET /api/companies/{name}/incidents` - 获取公司相关事件

## 认证方式

使用 JWT Token 进行认证。在需要认证的接口中，需要在请求头中添加：

```
Authorization: Bearer <your-jwt-token>
```

## 注意事项

1. **Lombok 配置**：如果编译时出现找不到 getter/setter 方法的错误，请确保：
   - IDE 中安装了 Lombok 插件（IntelliJ IDEA / Eclipse）
   - 重新导入 Maven 项目
   - 或者在 IDE 中启用注解处理器（Annotation Processors）

2. **数据库表结构**：首次运行前需要执行 `schema.sql` 创建表结构

3. **MyBatis 配置**：Mapper XML 文件位于 `src/main/resources/mapper/` 目录

4. **生产环境**：
   - 请修改 JWT 密钥
   - 关闭 SQL 日志输出（修改 `application.yml` 中的 `log-impl` 配置）
   - 建议使用 HTTPS
   - 手机号注册功能需要集成 Firebase Admin SDK 来验证 ID Token（当前为简化实现）

## 项目结构

```
backend/
├── src/main/java/com/valueguard/
│   ├── config/          # 配置类（MyBatis, Security, JWT等）
│   ├── controller/      # REST 控制器
│   ├── dto/            # 数据传输对象
│   ├── entity/         # 实体类（POJO）
│   ├── mapper/         # MyBatis Mapper 接口
│   ├── security/       # Spring Security 配置
│   ├── service/        # 业务逻辑层
│   └── util/          # 工具类
└── src/main/resources/
    ├── mapper/         # MyBatis XML 映射文件
    ├── application.yml # 应用配置
    └── schema.sql      # 数据库表结构脚本
```

