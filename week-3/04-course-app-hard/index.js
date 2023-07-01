const express = require('express');
const jwt=require('jsonwebtoken');
const fs=require('fs');
const mongoose=require('mongoose');

const ADMINSECRET="adminsecret";
const USERSECRET="usersecret";

const app = express();
app.use(express.json());

//connecting to mongodb
mongoose.connect('mongodb+srv://vedansh:mongodb@cluster0.d7vfzti.mongodb.net/courses',
 {useNewUrlParser: true, useUnifiedTopology: true, dbName: "courses" })
 .then(()=>{
  console.log("Connected to database");
});

//creating schemas
const adminSchema=new mongoose.Schema({
  username:String,
  password:String,
});

const userSchema=new mongoose.Schema({
  username:String,
  password:String,
  purchasedCourses:[{type:mongoose.Schema.Types.ObjectId,ref:'Course'}]
});

const courseSchema=new mongoose.Schema({
  title:String,
  description:String,
  price:Number,
  imageLink:String,
  published:Boolean,
});

//creating models
const Admin=mongoose.model('Admin',adminSchema);
const User=mongoose.model('User',userSchema);
const Course=mongoose.model('Course',courseSchema);


//functions to authenticate protected routes
function authenticateAdmin(req,res,next){
  const authHeader=req.headers.authorization;
  if(authHeader){
    const token=authHeader.split(" ")[1];
    jwt.verify(token,ADMINSECRET,(err,user)=>{
      if(err)return res.sendStatus(403);
      req.user=user;
      next();
    })
  }
}

function authenticateUser(req,res,next){
  const authHeader=req.headers.authorization;
  if(authHeader){
    const token=authHeader.split(" ")[1];
    jwt.verify(token,USERSECRET,(err,user)=>{
      if(err)return res.sendStatus(403);
      req.user=user;
      next();
    })
  }
}
    
//admin routes

app.post('/admin/signup', async (req, res) => {
  const {username,password}=req.body;
  const admin=await Admin.findOne({username});
  if(admin)return res.status(403).json({"message":"Admin already exists"});
  else{
    const admin=new Admin({username,password});
    admin.save();
    const token=jwt.sign({username:username,password:password},ADMINSECRET);
    res.status(200).json({message:"Admin created successfully",token:token});
  }
});

app.post('/admin/login', async (req, res) => {
  const {username,password}=req.headers;
  const admin=await Admin.findOne({username,password});
  if(admin){
    const token=jwt.sign({username:username,password:password},ADMINSECRET);
    res.status(200).json({message:"Logged in successfully",token:token});
  }else{
    res.status(403).json({message:"Invalid credentials"});
  }
});

app.post('/admin/courses',authenticateAdmin, async(req, res) => {
    const course=req.body;
    const newCourse=new Course(course);
    await newCourse.save();
    res.status(200).json({message:"Course created successfully",courseID:newCourse._id});
});

app.put('/admin/courses/:courseId',authenticateAdmin, async(req, res) => {
    const course=await Course.findByIdAndUpdate(req.params.courseId,req.body,{new:true});
    if(course)res.status(200).json({message:"Course updated successfully"});
    else res.status(404).json({message:"Course not found"});
});

app.get('/admin/courses',authenticateAdmin,async (req, res) => {
    const courses=await Course.find({});
    res.status(200).json({courses:courses});
});

//user routes

app.post('/users/signup', async (req, res) => {
    const {username,password}=req.body;
    const user=await User.findOne({username});
    if(user){
      res.status(403).json({"message":"User already exists"});
    }else{
      const newUser=new User({username,password});
      await newUser.save();
      const token=jwt.sign({username:username,password:password},USERSECRET);
      res.status(200).json({message:"User created successfully",token:token});
    }
});

app.post('/users/login', async (req, res) => {
  const {username,password}=req.headers;
  const user=await User.findOne({username,password});
  if(user){
    const token=jwt.sign({username:username,password:password},USERSECRET);
    res.status(200).json({message:"Logged in successfully",token:token});
  }else{
    res.status(403).json({message:"Invalid credentials"});
  }
});

app.get('/users/courses',authenticateUser,async(req, res) => {
  const courses=await Course.find({published:true});
  res.status(200).json({courses:courses});
});

app.post('/users/courses/:courseId',authenticateUser,async(req, res) => {
  const courseId=req.params.courseId;
  const course=await Course.findById(courseId);
  if(course){
    const user=await User.findOne({username:req.user.username});
    if(user){
      user.purchasedCourses.push(course);
      await user.save();
      res.status(200).json({message:"Course purchased successfully"});
    }else{
      res.status(404).json({message:"User not found"});
    }
  }else{
    res.status(404).json({message:"Course not found"});
  }
});

app.get('/users/purchasedCourses',authenticateUser,async (req, res) => {
  const user=await User.findOne({username:req.user.username}).populate('purchasedCourses');
  if(user){
    res.status(200).json({courses:user.purchasedCourses});
  }else{
    res.status(404).json({message:"User not found"});
  }
});

app.listen(3000, () => {
console.log('Server is listening on port 3000');
});