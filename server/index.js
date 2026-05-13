const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'secret_admin_key';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory goods store (默认数据)
let goods = [
  { id: 1, name: 'GOIBAO 旗舰手机', price: 5999, pic: 'https://picsum.photos/seed/phone/600/600' },
  { id: 2, name: 'GOIBAO 智能手表', price: 2399, pic: 'https://picsum.photos/seed/watch/600/600' },
  { id: 3, name: 'GOIBAO 无线耳机', price: 1299, pic: 'https://picsum.photos/seed/earphone/600/600' },
  { id: 4, name: 'GOIBAO 轻奢包包', price: 3899, pic: 'https://picsum.photos/seed/bag/600/600' },
  { id: 5, name: 'GOIBAO 潮流鞋履', price: 1699, pic: 'https://picsum.photos/seed/shoe/600/600' },
  { id: 6, name: 'GOIBAO 专业相机', price: 8999, pic: 'https://picsum.photos/seed/camera/600/600' },
  { id: 7, name: 'GOIBAO 轻薄本', price: 6899, pic: 'https://picsum.photos/seed/laptop/600/600' },
  { id: 8, name: 'GOIBAO 高端香水', price: 1599, pic: 'https://picsum.photos/seed/perfume/600/600' }
];

// Helper: broadcast goods updated
function broadcastGoods() {
  io.emit('goods-updated', goods);
}

// Public API: 获取商品列表
app.get('/api/goods', (req, res) => {
  res.json({ ok: true, data: goods });
});

// Public API: 获取单个商品
app.get('/api/goods/:id', (req, res) => {
  const id = Number(req.params.id);
  const g = goods.find(x => x.id === id);
  if (!g) return res.status(404).json({ ok: false, error: 'Not found' });
  res.json({ ok: true, data: g });
});

// Admin middleware (简单密钥校验)
function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.admin_key;
  if (key && key === ADMIN_KEY) return next();
  return res.status(401).json({ ok: false, error: 'Unauthorized' });
}

// Admin API: 创建商品
app.post('/api/admin/goods', requireAdmin, (req, res) => {
  const { name, price, pic } = req.body;
  if (!name || typeof price !== 'number') return res.status(400).json({ ok: false, error: 'Invalid data' });
  const id = goods.length ? Math.max(...goods.map(g => g.id)) + 1 : 1;
  const newG = { id, name, price, pic: pic || 'https://picsum.photos/600/600' };
  goods.push(newG);
  broadcastGoods();
  res.json({ ok: true, data: newG });
});

// Admin API: 更新商品
app.put('/api/admin/goods/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const idx = goods.findIndex(g => g.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, error: 'Not found' });
  const { name, price, pic } = req.body;
  if (name) goods[idx].name = name;
  if (typeof price === 'number') goods[idx].price = price;
  if (pic) goods[idx].pic = pic;
  broadcastGoods();
  res.json({ ok: true, data: goods[idx] });
});

// Admin API: 删除商品
app.delete('/api/admin/goods/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const idx = goods.findIndex(g => g.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, error: 'Not found' });
  const removed = goods.splice(idx, 1)[0];
  broadcastGoods();
  res.json({ ok: true, data: removed });
});

// Admin API: 手动广播（触发前端刷新）
app.post('/api/admin/broadcast', requireAdmin, (req, res) => {
  broadcastGoods();
  res.json({ ok: true });
});

// 简单登录示例（演示用）
app.post('/api/login', (req, res) => {
  const { account, password } = req.body;
  // 仅演示：实际应使用数据库和安全验证
  if (account === 'test' && password === '123456') {
    return res.json({ ok: true, data: { account: 'test', nickname: '高端用户' } });
  }
  return res.status(401).json({ ok: false, error: 'Invalid credentials' });
});

// Socket.IO 连接
io.on('connection', socket => {
  console.log('socket connected', socket.id);
  // 连接时立即推送一次当前商品
  socket.emit('goods-updated', goods);
  socket.on('ping', () => socket.emit('pong'));
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
