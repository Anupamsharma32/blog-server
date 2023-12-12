const express = require("express");
const mongoose = require("mongoose")
const app = express();
const cors = require('cors');
const bodyParser=require("body-parser")
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const multer = require('multer'); // use to upload
const uploadMiddleware = multer({ dest: 'uploads/' });
const cookieParser = require('cookie-parser');
const fs = require('fs');
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
// app.use(cors({ credentials: true, origin: 'https://blog-app-anupam-ewi1p3bff-anupamsharma32s-projects.vercel.app' }));
app.use(express.json());

app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
const salt = bcrypt.genSaltSync(10);// random string
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

mongoose.connect("mongodb+srv://ANUPAMSHARMA:anupamshubham321@cluster0.0r3wqns.mongodb.net/?retryWrites=true&w=majority",
   { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => {
      console.log('Connected to  Database MongoDB');
   })
   .catch(err => {
      console.error('Error connecting to MongoDB:', err);
   });
app.get("/", (req, res) => {
   res.send("<h1>Welcome to blog app server!!</h1>")
});

app.post('/register', async (req, res) => {
   const { username, password } = req.body;

   const existingUser = await User.findOne({ username });

   if (existingUser) {
      return res.status(400).json({
         success: false,
         message: "User already exists!",
      });
   }


   try {
      const userDoc = await User.create({
         username,
         password: bcrypt.hashSync(password, salt),
      });
      res.json(userDoc);
   } catch (e) {
      console.log(e);
      res.status(400).json(e);
   }
});

app.post('/login', async (req, res) => {
   try {
      const { username, password } = req.body;
      const userDoc = await User.findOne({ username });

      if (!userDoc) {
         // User not found
         return res.status(401).json({ error: 'Invalid username or password' });
      }

      const passOk = bcrypt.compareSync(password, userDoc.password);

      if (passOk) {
         // Password is correct
         jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token);
             return res.json({
               id: userDoc._id,
               username,
            });
         });
      } else {
         // Password is incorrect
        return  res.status(401).json({ error: 'Invalid username or password' });
      }

   } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal server error' });
   }
});




app.get('/profile', (req, res) => {
   const { token } = req.cookies;
   jwt.verify(token, secret, {}, (err, info) => {
      if (err) throw err;
      res.json(info);
   });
});
const { updateOne } = require('mongoose');
app.post('/logout', (req, res) => {
   res.cookie('token', '').json('ok');
   res.status(200).json({ message: 'Logout successful' });
   
});
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
   try {
      const { originalname, path } = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      const newPath = path + '.' + ext;
      fs.renameSync(path, newPath);

      const { token } = req.cookies;
      jwt.verify(token, secret, {}, async (err, info) => {
         if (err) {
            console.error(err);
            return res.status(401).json({ success: false, message: 'Unauthorized' });
         }

         const { title, summary, content } = req.body;
         const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id,
         });
         res.json(postDoc);
      });

   } catch (error) {
      console.error(error);
      res.status(500).send({
         success: false,
         message: 'Error in creating post.',
         error,
      });
   }
});

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
   try {
      let newPath = null;
      if (req.file) {
         const { originalname, path } = req.file;
         const parts = originalname.split('.');
         const ext = parts[parts.length - 1];
         newPath = path + '.' + ext;
         fs.renameSync(path, newPath);
      }

      const { token } = req.cookies;
      jwt.verify(token, secret, {}, async (err, info) => {
         if (err) {
            console.error(err);
            return res.status(401).json({ success: false, message: 'Unauthorized' });
         }

         const { id, title, summary, content } = req.body;
         const postDoc = await Post.findById(id);

         if (!postDoc || JSON.stringify(postDoc.author) !== JSON.stringify(info.id)) {
            return res.status(400).json({ success: false, message: 'You are not the author or post not found.' });
         }

         await postDoc.updateOne({
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover,
         });

         res.json(postDoc);
      });

   } catch (error) {
      console.error(error);
      res.status(500).send({
         success: false,
         message: 'Error in updating post.',
         error,
      });
   }
});


app.get('/post', async (req, res) => {
   res.json(
      await Post.find()
         .populate('author', ['username'])
         .sort({ createdAt: -1 })
         .limit(40)
   );
});

app.get('/post/:id', async (req, res) => {
   const { id } = req.params;
   const postDoc = await Post.findById(id).populate('author', ['username']);
   res.json(postDoc);
})





app.listen(4000, () => {
   console.log("server is running on 4000")
});

