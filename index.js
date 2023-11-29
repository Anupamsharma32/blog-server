// const express = require("express");
// const mongoose = require("mongoose")
// const app = express();
// const cors = require('cors');
// const User = require('./models/User');
// const Post = require('./models/Post');
// const bcrypt = require('bcrypt')
// const jwt = require('jsonwebtoken');
// const multer = require('multer'); // use to upload
// const uploadMiddleware = multer({ dest: 'uploads/' });
// const cookieParser = require('cookie-parser');
// const fs = require('fs');
// app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
// app.use(express.json());
// app.use(cookieParser());
// app.use('/uploads', express.static(__dirname + '/uploads'));
// const salt = bcrypt.genSaltSync(10);// random string
// const secret = 'asdfe45we45w345wegw345werjktjwertkj';

// mongoose.connect("mongodb+srv://ANUPAMSHARMA:anupamshubham321@cluster0.0r3wqns.mongodb.net/?retryWrites=true&w=majority",
//    { useNewUrlParser: true, useUnifiedTopology: true })
//    .then(() => {
//       console.log('Connected to  Database MongoDB');
//    })
//    .catch(err => {
//       console.error('Error connecting to MongoDB:', err);
//    });
// app.get("/", (req, res) => {
//    res.send("<h1>Welcome to blog app server!!</h1>")
// });

// app.post('/register', async (req, res) => {
//    const { username, password } = req.body;
//    try {
//       const userDoc = await User.create({
//          username,
//          password: bcrypt.hashSync(password, salt),
//       });
//       res.json(userDoc);
//    } catch (e) {
//       console.log(e);
//       res.status(400).json(e);
//    }
// });

// app.post('/login', async (req, res) => {
//    const { username, password } = req.body;
//    const userDoc = await User.findOne({ username });
//    const passOk = bcrypt.compareSync(password, userDoc.password);
//    if (passOk) {
//       // logged in
//       jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
//          if (err) throw err;
//          res.cookie('token', token).json({
//             id: userDoc._id,
//             username,
//          });
//       });
//    } else {
//       res.status(400).json('wrong credentials');
//    }
// });

// app.get('/profile', (req, res) => {
//    const { token } = req.cookies;
//    jwt.verify(token, secret, {}, (err, info) => {
//       if (err) throw err;
//       res.json(info);
//    });
// });

// app.post('/logout', (req, res) => {
//    res.cookie('token', '').json('ok');
// });

// app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
//    const { originalname, path } = req.file;
//    const parts = originalname.split('.');
//    const ext = parts[parts.length - 1];
//    const newPath = path + '.' + ext;
//    fs.renameSync(path, newPath);

//    const { token } = req.cookies;
//    jwt.verify(token, secret, {}, async (err, info) => {
//       if (err) throw err;
//       const { title, summary, content } = req.body;
//       const postDoc = await Post.create({
//          title,
//          summary,
//          content,
//          cover: newPath,
//          author: info.id,
//       });
//       res.json(postDoc);
//    });

// });

// const { updateOne } = require('mongoose'); // Import the necessary module for updateOne

// app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
//    console.log("hello inside the posit");
//    let newPath = null;

//    if (req.file) {
//       const { originalname, path } = req.file;
//       const parts = originalname.split('.');
//       const ext = parts[parts.length - 1];
//       newPath = path + '.' + ext;
//       fs.renameSync(path, newPath);
//    }

//    const { token } = req.cookies;
//    jwt.verify(token, "asdfe45we45w345wegw345werjktjwertkj", {}, async (err, info) => {
//       if (err) throw err;
//       const { id, title, summary, content } = req.body;
//       const postDoc = await Post.findById(id);
//       const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);

//       if (!isAuthor) {
//          return res.status(400).json('you are not the author');
//       }

//       // Use updateOne method instead of deprecated update
//       await Post.updateOne(
//          { _id: id },
//          {
//             $set: {
//                title,
//                summary,
//                content,
//                cover: newPath ? newPath : postDoc.cover,
//             },
//          }
//       );

//       // Fetch the updated document
//       const updatedPostDoc = await Post.findById(id);
//       res.json(updatedPostDoc);
//    });
// });

// // ... Other parts of your code


// app.get('/post', async (req, res) => {
//    res.json(
//       await Post.find()
//          .populate('author', ['username'])
//          .sort({ createdAt: -1 })
//          .limit(20)
//    );
// });

// app.get('/post/:id', async (req, res) => {
//    const { id } = req.params;
//    const postDoc = await Post.findById(id).populate('author', ['username']);
//    res.json(postDoc);
// })





// app.listen(4000,()=>{
//    console.log("server is running on 4000")
// });






const express = require("express");
const mongoose = require("mongoose")
const app = express();
const cors = require('cors');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const multer = require('multer'); // use to upload
const uploadMiddleware = multer({ dest: 'uploads/' });
const cookieParser = require('cookie-parser');
const fs = require('fs');
app.use(cors({ credentials: true, origin: 'http://localhost:3000/' }));
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
      res.status(400).send({
         success : false,
         message: e.message,
         error
      });
   }
});

app.post('/login', async (req, res) => {
   const { username, password } = req.body;
   const userDoc = await User.findOne({ username });
   const passOk = bcrypt.compareSync(password, userDoc.password);
   if (passOk) {
      // logged in
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
         if (err) throw err;
         res.cookie('token', token).json({
            id: userDoc._id,
            username,
         });
      });
   } else {
      res.status(400).json('wrong credentials');
   }
});

app.get('/profile', (req, res) => {
   const { token } = req.cookies;
   jwt.verify(token, secret, {}, (err, info) => {
      if (err) throw err;
      res.json(info);
   });
});

app.post('/logout', (req, res) => {
   res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {


   const { originalname, path } = req.file;
   const parts = originalname.split('.');
   const ext = parts[parts.length - 1];
   const newPath = path + '.' + ext;
   fs.renameSync(path, newPath);
   const { token } = req.cookies;
   try {

   
      jwt.verify(token, secret, {}, async (err, info) => {
         if (err) throw err;
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
      console.log("Error in post-->"  , error);
      res.status(400).send({
         success : false,
         message: error.message,
         error
      })
   }

  

});

const { updateOne } = require('mongoose'); // Import the necessary module for updateOne

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
   console.log("hello inside the posit");
   let newPath = null;
   
   try {

      if (req.file) {
         const { originalname, path } = req.file;
         const parts = originalname.split('.');
         const ext = parts[parts.length - 1];
         newPath = path + '.' + ext;
         fs.renameSync(path, newPath);
      }
   
      const { token } = req.cookies;
      jwt.verify(token, "asdfe45we45w345wegw345werjktjwertkj", {}, async (err, info) => {
         if (err) throw err;
         const { id, title, summary, content } = req.body;
         const postDoc = await Post.findById(id);
         const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
   
         if (!isAuthor) {
            return res.status(400).json('you are not the author');
         }
   
         // Use updateOne method instead of deprecated update
         await Post.updateOne(
            { _id: id },
            {
               $set: {
                  title,
                  summary,
                  content,
                  cover: newPath ? newPath : postDoc.cover,
               },
            }
         );
   
         // Fetch the updated document
         const updatedPostDoc = await Post.findById(id);
         res.json(updatedPostDoc);
      });
      
   } catch (error) {
      res.status(400).send({
         success : false,
         message: error.message,
         error
      })
   }

  
});

// ... Other parts of your code


app.get('/post', async (req, res) => {


   try {
      res.json(
         await Post.find()
            .populate('author', ['username'])
            .sort({ createdAt: -1 })
            .limit(20)
      );
      
   } catch (error) {
      res.status(400).send({
         success : false,
         message: error.message,
         error
      })
   }


});

app.get('/post/:id', async (req, res) => {
   const { id } = req.params;

   try {
      const postDoc = await Post.findById(id).populate('author', ['username']);
      res.json(postDoc);
      
   } catch (error) {
      res.status(400).send({
         success : false,
         message: error.message,
         error
      })
   }


})





app.listen(4000, () => {
   console.log("server is running on 4000")
});

