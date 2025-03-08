import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
dotenv.config();

const app = express();

mongoose.set('strictQuery', false);

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true
}));

let mongoURL = process.env.MONGO_URL;

mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to MongoDB");
})
.catch((err) => {
  console.error("MongoDB connection error: ", err);
});

app.use(session({
  secret: 'SECRET_KEY',
  resave: false,
  saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoURL }),
  cookie: { maxAge: 1000 * 60 * 60 }
}));

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

app.post('/api/signup', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (username.length < 8) {
    return res.status(400).json({ message: 'Username must be at least 8 characters long' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const lowercase = /[a-z]/;
  const uppercase = /[A-Z]/;
  const special = /[!@#$%^&*(),.?":{}|<>]/;
  if (!lowercase.test(password) || !uppercase.test(password) || !special.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one lowercase letter, one uppercase letter, and one special character' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    return res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Both fields are required' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Username does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    req.session.userId = user._id;
    req.session.username = user.username;

    return res.status(200).json({ message: 'Login successful', username: user.username });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logout successful' });
  });
});

app.get('/api/user', (req, res) => {
  if (req.session.userId) {
    return res.status(200).json({ username: req.session.username });
  } else {
    return res.status(401).json({ message: 'Not authenticated' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
