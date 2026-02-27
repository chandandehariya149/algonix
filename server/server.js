const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');


require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://algonix.online',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (req, res) => {
  res.send('Algonix backend is live');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  whatsapp: { type: String, required: true },
  profilePhoto: { type: Buffer, default: null }
});
const User = mongoose.model('User', UserSchema);

const UploadSchema = new mongoose.Schema({
  image: { type: Buffer, required: true },
  filename: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Upload = mongoose.model('Upload', UploadSchema);

const SheetProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sheetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sheet', required: true },
  solved: { type: Boolean, default: false }
});
const SheetProgress = mongoose.model('SheetProgress', SheetProgressSchema);

const MaterialSchema = new mongoose.Schema({
  language: { type: String, required: true },
  topic: { type: String, required: true },
  subtopic: { type: String, required: true },
  content: { type: String, required: true }
}, { strict: 'throw' });
const Material = mongoose.model('Material', MaterialSchema);

const SheetSchema = new mongoose.Schema({
  question: { type: String, required: true },
  solution: { type: String, required: true },
  websiteLink: { type: String },
  code: { type: String }
});
const Sheet = mongoose.model('Sheet', SheetSchema);

const TutorialSchema = new mongoose.Schema({
  iframeLink: { type: String, required: true },
  directLink: { type: String, required: true },
  topic: { type: String, required: true }
});
const Tutorial = mongoose.model('Tutorial', TutorialSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage });

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.email === 'chandandehariya149@gmail.com') {
    next();
  } else {
    res.status(403).json({ msg: 'Admin access required' });
  }
};

app.get('/api/image/:id', async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) {
      return res.status(404).json({ msg: 'Image not found' });
    }
    res.set('Content-Type', 'image/jpeg');
    res.send(upload.image);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.get('/api/profile/photo/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.profilePhoto) {
      return res.status(404).json({ msg: 'Profile photo not found' });
    }
    res.set('Content-Type', 'image/jpeg');
    res.send(user.profilePhoto);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/signup', async (req, res) => {
  const { name, email, password, whatsapp } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword, whatsapp });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.put('/api/profile', verifyToken, async (req, res) => {
  const { name, whatsapp } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, whatsapp },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/profile/photo', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const user = await User.findById(req.user.id);
    user.profilePhoto = req.file.buffer;
    await user.save();

    res.json({ profilePhoto: `/api/profile/photo/${user._id}` });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/compile', async (req, res) => {
  try {
    const response = await axios.post('https://api.jdoodle.com/v1/execute', {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: req.body.script,
      language: req.body.language,
      versionIndex: '0',
      stdin: req.body.input
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/materials/:language', async (req, res) => {
  try {
    const materials = await Material.find({ language: req.params.language });
    res.json(materials);
  } catch (err) {
    console.error('Error fetching materials:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/materials', verifyToken, isAdmin, async (req, res) => {
  const { language, topic, subtopic, content } = req.body;
  try {
    if (!language || !topic || !subtopic || !content) {
      return res.status(400).json({ msg: 'All fields (language, topic, subtopic, content) are required' });
    }
    const material = new Material({ language: language.toLowerCase(), topic, subtopic, content });
    await material.save();
    res.status(201).json(material);
  } catch (err) {
    console.error('Error adding material:', err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

app.put('/api/materials/:id', verifyToken, isAdmin, async (req, res) => {
  const { topic, subtopic, content } = req.body;
  try {
    if (!topic || !subtopic || !content) {
      return res.status(400).json({ msg: 'All fields (topic, subtopic, content) are required' });
    }
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { topic, subtopic, content },
      { new: true, runValidators: true }
    );
    if (!material) return res.status(404).json({ msg: 'Material not found' });
    res.json(material);
  } catch (err) {
    console.error('Error updating material:', err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

app.delete('/api/materials/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ msg: 'Material not found' });
    res.json({ msg: 'Material deleted' });
  } catch (err) {
    console.error('Error deleting material:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/upload-material-image', verifyToken, isAdmin, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const upload = new Upload({
      image: req.file.buffer,
      filename: `${Date.now()}-${req.file.originalname}`
    });
    await upload.save();

    res.json({ imageId: `[img]/api/image/${upload._id}[/img]` });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.get('/api/sheet', async (req, res) => {
  try {
    const sheets = await Sheet.find();
    res.json(sheets);
  } catch (err) {
    console.error('Error fetching sheets:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/sheet', verifyToken, isAdmin, async (req, res) => {
  const { question, solution, websiteLink, code } = req.body;
  try {
    const sheet = new Sheet({ question, solution, websiteLink, code });
    await sheet.save();
    res.json(sheet);
  } catch (err) {
    console.error('Error adding sheet:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.put('/api/sheet/:id', verifyToken, isAdmin, async (req, res) => {
  const { question, solution, websiteLink, code } = req.body;
  try {
    const sheet = await Sheet.findByIdAndUpdate(req.params.id, { question, solution, websiteLink, code }, { new: true });
    if (!sheet) return res.status(404).json({ msg: 'Sheet not found' });
    res.json(sheet);
  } catch (err) {
    console.error('Error updating sheet:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.delete('/api/sheet/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const sheet = await Sheet.findByIdAndDelete(req.params.id);
    if (!sheet) return res.status(404).json({ msg: 'Sheet not found' });
    await SheetProgress.deleteMany({ sheetId: req.params.id });
    res.json({ msg: 'Sheet deleted' });
  } catch (err) {
    console.error('Error deleting sheet:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.get('/api/sheet/progress', verifyToken, async (req, res) => {
  try {
    const progress = await SheetProgress.find({ userId: req.user.id });
    res.json(progress);
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/sheet/progress', verifyToken, async (req, res) => {
  const { sheetId, solved } = req.body;
  try {
    let progress = await SheetProgress.findOne({ userId: req.user.id, sheetId });
    if (progress) {
      progress.solved = solved;
    } else {
      progress = new SheetProgress({ userId: req.user.id, sheetId, solved });
    }
    await progress.save();
    res.json(progress);
  } catch (err) {
    console.error('Error updating progress:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.get('/api/tutorials', async (req, res) => {
  try {
    const tutorials = await Tutorial.find();
    res.json(tutorials);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/tutorials', verifyToken, isAdmin, async (req, res) => {
  const { iframeLink, directLink, topic } = req.body;
  try {
    if (!iframeLink || !directLink || !topic) {
      return res.status(400).json({ msg: 'All fields are required' });
    }
    const tutorial = new Tutorial({ iframeLink, directLink, topic });
    await tutorial.save();
    res.status(201).json(tutorial);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.put('/api/tutorials/:id', verifyToken, isAdmin, async (req, res) => {
  const { iframeLink, directLink, topic } = req.body;
  try {
    if (!iframeLink || !directLink || !topic) {
      return res.status(400).json({ msg: 'All fields are required' });
    }
    const tutorial = await Tutorial.findByIdAndUpdate(req.params.id, { iframeLink, directLink, topic }, { new: true });
    if (!tutorial) return res.status(404).json({ msg: 'Tutorial not found' });
    res.json(tutorial);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.delete('/api/tutorials/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const tutorial = await Tutorial.findByIdAndDelete(req.params.id);
    if (!tutorial) return res.status(404).json({ msg: 'Tutorial not found' });
    res.json({ msg: 'Tutorial deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
