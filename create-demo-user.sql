-- Demo用户数据插入脚本
-- 邮箱: demo@example.com
-- 密码: demo123
-- 角色: ADMIN

-- 检查是否已存在demo用户
DO $$
DECLARE
    demo_user_exists BOOLEAN;
    demo_password TEXT;
BEGIN
    -- 检查demo用户是否已存在
    SELECT EXISTS (
        SELECT 1 FROM users WHERE email = 'demo@example.com'
    ) INTO demo_user_exists;

    IF NOT demo_user_exists THEN
        -- 使用bcrypt哈希密码 'demo123'
        -- 哈希值: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
        demo_password := '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
        
        -- 创建demo用户
        INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
        VALUES (
            gen_random_uuid()::text,
            'demo@example.com',
            'Demo用户',
            demo_password,
            'ADMIN',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Demo用户创建成功!';
        RAISE NOTICE '登录信息:';
        RAISE NOTICE '邮箱: demo@example.com';
        RAISE NOTICE '密码: demo123';
        RAISE NOTICE '角色: ADMIN';
    ELSE
        RAISE NOTICE 'Demo用户已存在，登录信息:';
        RAISE NOTICE '邮箱: demo@example.com';
        RAISE NOTICE '密码: demo123';
        RAISE NOTICE '角色: ADMIN';
    END IF;
END $$;

-- 创建示例部门（如果不存在）
INSERT INTO departments (id, name, description, "createdAt", "updatedAt") VALUES
(gen_random_uuid()::text, '技术部', '负责产品开发和技术架构', NOW(), NOW()),
(gen_random_uuid()::text, '市场部', '负责市场推广和品牌建设', NOW(), NOW()),
(gen_random_uuid()::text, '人事部', '负责人力资源管理', NOW(), NOW()),
(gen_random_uuid()::text, '财务部', '负责财务管理和预算控制', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

RAISE NOTICE '示例部门数据已创建';