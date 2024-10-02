const express = require("express");
const app = express();
const cookieparser = require("cookie-parser");
const db = require("./config/connection");
const UserModal = require("./models/userModal");
const PostModal = require("./models/postsModal");
const jwt = require("jsonwebtoken");
const isLoggedIn = require("./config/auth");
const userModal = require("./models/userModal");
const authenticateUser = require("./config/authuser")
const postsModal = require("./models/postsModal");

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(cookieparser());
 
app.get("/", isLoggedIn,(req, res) => {
  res.redirect("/feed");
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/feed", isLoggedIn,authenticateUser,async (req, res) => {
  let loggedUser = req.user.userId
  let edit = req.edit
  let isLogged = req.isLogged
  let user = await PostModal.find().populate('user')
  let currentUser = await userModal.findOne({_id:loggedUser})
  
  
  res.render('feed',{user,loggedUser,edit,isLogged,currentUser})
});
 

  
// app.get("/profile", isLoggedIn, async(req, res) => {
//   let user = await userModal.findOne({email:req.user.email}).populate("posts")
//   res.render('profile',{user})
// });

// app.get("/view/:id", isLoggedIn, async (req, res) => {
//   let isSameUser = req.user.userId;
//   let user = await userModal.findOne({_id: req.params.id}).populate("posts");
  
//   if (isSameUser === user._id.toString()) {
//     res.redirect('/profile');
//   } else {
//     res.render('view', { user });
//   }
// });


app.post("/update/:id", isLoggedIn, async (req, res) => {
  let postId = req.params.id
   await PostModal.findOneAndUpdate({_id: postId},{content:req.body.content})
  let user = await UserModal.findOne({_id: req.user.userId})
  res.redirect(`/profile/${user.username}`);

});
app.get("/delete/:id", isLoggedIn, async (req, res) => {
  let postId = req.params.id
await PostModal.findOneAndDelete({_id: postId},{content:req.body.content})
  let user = await UserModal.findOne({_id: req.user.userId})
  res.redirect(`/profile/${user.username}`);
}); 


app.get("/profile/edit/:id", isLoggedIn, authenticateUser,async (req, res) => {
  let username = req.params.id
  let edit = req.edit
  let isLogged = req.isLogged
  let user = await userModal.findOne({username: username})
  if(!user) return res.status(401).send("invalid")
  if(req.user.userId != user._id.toString()) return res.status(403).send('access denied !')
  res.render('editprofile',{user,edit,isLogged})

}); 

app.post("/profile/update", isLoggedIn, async (req, res) => {
  const {name,username,email,about,password} = req.body
  let user = await userModal.findOne({_id: req.user.userId})
  if(!user) return res.status(401).send("invalid")
  if(req.user.userId != user._id.toString()) return res.status(403).send('access denied !')

  if (name) user.name = name;
  if (username) user.username = username;
  if (email) user.email = email;
  if (about) user.about = about;
  if (password) user.password = password;
  await user.save()
  res.redirect(`/profile/${user.username}`);

});


app.get("/profile/:username", authenticateUser, async (req, res) => {
  try {
    const { username } = req.params;
    let edit = req.edit
    let isLogged = req.isLogged
    const user = await userModal.findOne({ username: username }).populate('posts');
    let currentUser = await userModal.findOne({_id:req.current.userId})

  
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('profile',{user,edit,isLogged,currentUser})
 
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }  
});


app.get("/like/:id", isLoggedIn, async (req, res) => {
  let loggedUser = req.user.userId;
  let post = await PostModal.findOne({_id: req.params.id}).populate("user");

  if(post.likes.indexOf(loggedUser)=== -1){
    post.likes.push(loggedUser)

  }else{
    post.likes.splice(post.likes.indexOf(loggedUser),1)
  }
  await post.save()
  res.redirect('/feed')

});

app.post("/post", isLoggedIn, async(req, res) => {
  let user = await userModal.findOne({email:req.user.email})
    let newPost = await postsModal.create({
        user:user._id,
        content: req.body.content
    })
    user.posts.push(newPost._id)
    await user.save()
    res.redirect(`/profile/${user.username}`);

});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const existedUser = await UserModal.findOne({ email });
  if (!existedUser) return res.send("user not found");
  if (password !== existedUser.password)
    return res.send("something went wrong");

  let token = jwt.sign({ email: email, userId: existedUser._id }, "ranjan");
  res.cookie("token", token);
  // res.redirect(`/profile/${existedUser.username}`);
  res.redirect('/feed')
});

app.post("/register", async (req, res) => {
  const { name, username, email, password } = req.body;
  const existedUser = await UserModal.findOne({ email });
  if (existedUser) return res.send("user exist");

  let newUser = await UserModal.create({
    name,
    username,  
    email,
    password,
  });
  let token = jwt.sign({ email: email, userId: newUser._id }, "ranjan");
  res.cookie("token", token);
  // res.redirect(`/profile/${newUser.username}`);
  res.redirect('/feed')


});  

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});




app.listen(3000);
