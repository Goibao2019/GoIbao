// 前端逻辑：fetch 后端 API 并通过 Socket.IO 接收实时更新
const socket = io();

const $ = id => document.getElementById(id);
const goodsEl = $('goods');
const searchEl = $('search');
const refreshBtn = $('refreshBtn');
const adminKeyEl = $('adminKey');
const openAdminBtn = $('openAdmin');
const adminArea = $('adminArea');
const addGoodsBtn = $('addGoods');
const gName = $('gName');
const gPrice = $('gPrice');
const gPic = $('gPic');
const broadcastBtn = $('broadcast');
const clearAdminBtn = $('clearAdmin');

let goods = [];
let adminKey = '';

async function fetchGoods() {
  try {
    const res = await fetch('/api/goods');
    const json = await res.json();
    if (json.ok) {
      goods = json.data;
      renderGoods();
    }
  } catch (e) {
    console.error(e);
  }
}

function renderGoods() {
  const q = searchEl.value.trim().toLowerCase();
  const list = goods.filter(g => !q || g.name.toLowerCase().includes(q));
  goodsEl.innerHTML = list.map(g => `
    <div class="goods-item">
      <img class="goods-img" src="${g.pic}" alt="">
      <div class="goods-info">
        <div style="font-weight:600">${g.name}</div>
        <div style="color:#FFD700;margin-top:6px">${g.price} GB</div>
      </div>
    </div>
  `).join('');
}

// Socket 事件：接收后台推送的商品更新
socket.on('goods-updated', data => {
  goods = data;
  renderGoods();
});

refreshBtn.addEventListener('click', fetchGoods);
searchEl.addEventListener('input', renderGoods);

openAdminBtn.addEventListener('click', () => {
  adminKey = adminKeyEl.value.trim();
  if (!adminKey) return alert('请输入管理密钥');
  adminArea.classList.remove('hidden');
});

clearAdminBtn.addEventListener('click', () => {
  adminArea.classList.add('hidden');
  adminKeyEl.value = '';
  adminKey = '';
});

addGoodsBtn.addEventListener('click', async () => {
  const name = gName.value.trim();
  const price = Number(gPrice.value);
  const pic = gPic.value.trim();
  if (!name || !price) return alert('请填写名称和数字价格');
  try {
    const res = await fetch('/api/admin/goods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ name, price, pic })
    });
    const json = await res.json();
    if (!json.ok) return alert('新增失败：' + (json.error || '未知'));
    gName.value = '';
    gPrice.value = '';
    gPic.value = '';
    alert('新增成功');
    // 后端会广播，前端通过 socket 接收并更新
  } catch (e) {
    console.error(e);
    alert('新增失败');
  }
});

broadcastBtn.addEventListener('click', async () => {
  if (!adminKey) return alert('请输入管理密钥并打开管理面板');
  try {
    const res = await fetch('/api/admin/broadcast', { method: 'POST', headers: { 'x-admin-key': adminKey } });
    const json = await res.json();
    if (!json.ok) return alert('广播失败');
    alert('已广播');
  } catch (e) {
    console.error(e);
    alert('广播失败');
  }
});

// 初始化
fetchGoods();
