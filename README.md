# GoIbao

全球最全购物平台

此项目包含一个轻量前端和可实时控制、对接 API 的后台（Node.js + Express + Socket.IO）。

功能简介：
- Web 前端（静态页面）用于展示商品并实时接收后端推送的更新
- 后端提供 REST API（增删改查商品、登录、管理）并通过 WebSocket（Socket.IO）实时推送商品变更
- 简单的管理密钥校验用于保护管理接口（在生产中请替换、更严格管理）

快速运行：
1. 进入 server 目录：
   cd server
2. 安装依赖：
   npm install
3. 复制环境变量文件并设置管理密钥（可选）：
   cp .env.example .env
   编辑 .env 中的 ADMIN_KEY
4. 启动：
   npm start
5. 在浏览器打开：http://localhost:3000

开发说明：
- 前端静态文件在 public/，后端在 server/index.js
- 后端将监听商品变更并通过 Socket.IO 把更新推送到所有连接的客户端

安全与生产提示：
- 目前仅使用简单的管理密钥校验和内存数据存储，请使用数据库、HTTPS、认证与访问控制来替代
- 生产部署请设置环境变量、启用日志、限制来源等
