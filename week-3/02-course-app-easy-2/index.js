const express = require('express');
const jwt=require('jsonwebtoken');
const secretKey="Vedansh";
const app = express();

function generateToken(username,password){
  return jwt.sign({username:username,password:password},secretKey);
}

function verifyToken(token){
  return jwt.verify(token,secretKey);
}

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];
let Id=0;

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const admin=req.body;
  const token=generateToken(admin.username,admin.password);
  ADMINS.push({...admin,token:token});
  res.send({message:"Admin created successfully",token:token});
});

app.post('/admin/login', (req, res) => {
  const {username,password}=req.body;
  //check if admin exists
  const admin = ADMINS.find((admin) => admin.username === username && admin.password === password);
  if(admin)res.send({"message":'Logged in successfully',token:admin.token});
  else res.send({"message":"invalid credentials"});
});

app.post('/admin/courses', (req, res) => {
  try{
    const token=req.headers.authorization.split(" ")[1];
    const {username,password}=verifyToken(token);
    const admin = ADMINS.find((admin) => admin.username === username && admin.password === password);
    if(admin){
      const course=req.body;
      Id++;
      COURSES.push({...course,courseID:Id});
      res.send({"message":"Course created successfully",courseID:Id});
    }
    else res.send({"message":"invalid credentials"});
    
    
  }catch(err){
    res.send({"message":"invalid token"});
  }


});

app.put('/admin/courses/:courseId', (req, res) => {
try{
  const token=req.headers.authorization.split(" ")[1];
  const {username,password}=verifyToken(token);
  const courseID=req.params.courseId;
  const admin = ADMINS.find((admin) => admin.username === username && admin.password === password);
  if(!admin)res.send({"message":"invalid credentials"});
  else{
    const courseIndex=COURSES.findIndex((course)=>course.courseID==courseID);
    COURSES[courseIndex]={...req.body,courseID:courseID};
    res.send({"message":"Course updated successfully"});
}
  }
catch(err){
  res.send({"message":"invalid token"});
}


});

app.get('/admin/courses', (req, res) => {
  try{
    // console.log(req.headers);
    const token=req.headers.authorization.split(" ")[1];
    const {username,password}=verifyToken(token);
    const admin = ADMINS.find((admin) => admin.username === username && admin.password === password);
    if(!admin)res.send({"message":"invalid credentials"});
    else res.send({courses:COURSES});
  }catch(err){
    res.send({"message":"invalid token"});
  }
});

// User routes
app.post('/users/signup', (req, res) => {
const user=req.body;
const token=generateToken(user.username,user.password);
USERS.push({...user,token:token});
res.send({message:"User created successfully",token:token});
});

app.post('/users/login', (req, res) => {
const {username,password}=req.body;
const user = USERS.find((user) => user.username === username && user.password === password);
if(user)res.send({"message":'Logged in successfully',token:user.token});
else res.send({"message":"invalid credentials"});
});

app.get('/users/courses', (req, res) => {
  try{
    const token=req.headers.authorization.split(" ")[1];
    const {username,password}=verifyToken(token);
    const user = USERS.find((user) => user.username === username && user.password === password);
    if(!user)res.send({"message":"invalid credentials"});
    else res.send({courses:COURSES});
  }
  catch(err){
    res.send({"message":"invalid token"});
  }

});

app.post('/users/courses/:courseId', (req, res) => {
try{
  const token=req.headers.authorization.split(" ")[1];
  const {username,password}=verifyToken(token);
  const courseID=req.params.courseId;
  const user = USERS.find((user) => user.username === username && user.password === password);
  if(!user)res.send({"message":"invalid credentials"});
  else{
    const course=COURSES.find((course)=>course.courseID==courseID);
    if(user['purchasedCourses']){
      user['purchasedCourses'].push(course);
    }else{
      user['purchasedCourses']=[course];
    }
    res.send({"message":"Course purchased successfully"});
  }
}
catch(err){
  res.send({"message":"invalid token"});
}

});

app.get('/users/purchasedCourses', (req, res) => {
  try{
    const token=req.headers.authorization.split(" ")[1];
    const {username,password}=verifyToken(token);
    const user = USERS.find((user) => user.username === username && user.password === password);
    if(!user)res.send({"message":"invalid credentials"});
    else res.send({coursesPurchased:user['purchasedCourses']});
  }
  catch(err){
    res.send({"message":"invalid token"});
  }

});

app.listen(3000, () => {
console.log('Server is listening on port 3000');
});