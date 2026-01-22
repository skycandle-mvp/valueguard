-- ValueGuard 数据库表结构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    uid VARCHAR(100) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    photo_url VARCHAR(500),
    phone_number VARCHAR(20),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 公司表
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    logo_url VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 事件表
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(50) PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    company_id VARCHAR(50),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company_name (company_name),
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 事件分类表
CREATE TABLE IF NOT EXISTS incident_categories (
    incident_id VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    PRIMARY KEY (incident_id, category),
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(50) PRIMARY KEY,
    text TEXT NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    incident_id VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_incident_id (incident_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 审核请求表
CREATE TABLE IF NOT EXISTS review_requests (
    id VARCHAR(50) PRIMARY KEY,
    incident_id VARCHAR(50) NOT NULL,
    review TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_incident_id (incident_id),
    INDEX idx_status (status),
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

