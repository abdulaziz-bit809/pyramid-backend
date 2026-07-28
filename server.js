const fetch = require('node-fetch');

// Bot ma'lumotlari
const BOT_TOKEN = "8585809368:AAGvB9QmOSJyiHIv-12R0JKrgIHvrmRitDs"; // BotFather bergan kod
const ADMIN_CHAT_ID = "SIZNING_CHAT_IDINGIZ"; // userinfobot bergan ID
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Local MongoDB ulanishi
const MONGO_URI = "mongodb://127.0.0.1:27017/pyramid_db";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB ga muvaffaqiyatli ulandi!"))
  .catch(err => console.log("⚠️ MongoDB ulanmadi (MongoDB hali yoqilmagan bo'lishi mumkin):", err.message));

// Schemas (Ma'lumotlar bazasi modellari)
const OrderSchema = new mongoose.Schema({
  name: String, phone: String, type: String, count: Number,
  region: String, district: String, address: String, text: String,
  date: { type: Date, default: Date.now }
});

const CommentSchema = new mongoose.Schema({
  name: String, text: String, img: String,
  date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);
const Comment = mongoose.model('Comment', CommentSchema);

// API Yo'nalishlari (Endpoints)

// Buyurtmalar
// Buyurtma tushganda bazaga saqlaydi VA Telegramga xabar yuboradi
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();

    // Telegramga xabar yuborish formati
    const text = `🚀 *Yangi Buyurtma!*\n\n` +
                 `👤 *Ism:* ${newOrder.name}\n` +
                 `📞 *Tel:* ${newOrder.phone}\n` +
                 `📦 *Tur:* ${newOrder.type} (${newOrder.count} dona)\n` +
                 `📍 *Manzil:* ${newOrder.region || ''}, ${newOrder.district || ''}, ${oAddress || ''}\n` +
                 `💬 *Izoh:* ${newOrder.text || 'Yo\'q'}`;

    // Telegram API ga so'rov yuborish
    await fetch(`https://api.telegram.org/bot${8585809368:AAGvB9QmOSJyiHIv-12R0JKrgIHvrmRitDs}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: text,
        parse_mode: 'Markdown'
      })
    });

    res.json({ success: true, order: newOrder });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/orders', async (req, res) => {
  const orders = await Order.find().sort({ date: -1 });
  res.json(orders);
});

app.delete('/api/orders/:id', async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Sharhlar
app.post('/api/comments', async (req, res) => {
  try {
    const newComment = new Comment(req.body);
    await newComment.save();
    res.json({ success: true, comment: newComment });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/comments', async (req, res) => {
  const comments = await Comment.find().sort({ date: -1 });
  res.json(comments);
});

app.delete('/api/comments/:id', async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Serverni yurgizish
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} manzilida ishga tushdi!`);
});