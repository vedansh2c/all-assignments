const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

let Id=0;

// Admin routes
app.post('/admin/signup', (req, res) => {
    const admin=req.body;
    ADMINS.push(admin);
    res.send({message:"Admin created successfully"});
});

app.post('/admin/login', (req, res) => {
    const {username,password}=req.body;
    //check if admin exists
    const admin = ADMINS.find((admin) => admin.username === username && admin.password === password);
    console.log(admin);
    if(admin)res.send({"message":'Logged in successfully'});
    else res.send({"message":"invalid credentials"});
});

app.post('/admin/courses', (req, res) => {
  // logic to create a course
  console.log(req.headers);
  const {username,password}=req.headers;
  const admin = ADMINS.find((admin) => admin.username === username && admin.password === password);
  if(admin){
    const course=req.body;
    Id++;
    COURSES.push({...course,courseID:Id});
    res.send({"message":"Course created successfully",courseID:Id});
  }else{
    res.send({"message":"invalid credentials"});
  }
});

app.put('/admin/courses/:courseId', (req, res) => {
  // logic to edit a course
  const courseID=req.params.courseId;
  const {username,password}=req.headers;
  const admin = ADMINS.find((admin) => admin.username === username && admin.password === password);
  if(admin){
    const courseIndex=COURSES.findIndex((course)=>course.courseID==courseID);
    COURSES[courseIndex]={...req.body,courseID:courseID};
    res.send({"message":"Course updated successfully"});
  }else{
    res.send({"message":"invalid credentials"});
  }
});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses
  const {username,password}=req.headers;
  const admin = ADMINS.find((admin) => admin.username === username && admin.password === password);
  if(admin){
    res.send({courses:COURSES});
  }else{
    res.send({"message":"invalid credentials"});
  }

});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const user=req.body;
  USERS.push(user);
  res.send({message:"User created successfully"});
});

app.post('/users/login', (req, res) => {
  // logic to log in user
  const {username,password}=req.body;
  //check if admin exists
  const user = USERS.find((user) => user.username === username && user.password === password);
  if(user)res.send({"message":'Logged in successfully'});
  else res.send({"message":"invalid credentials"});
});

app.get('/users/courses', (req, res) => {
  // logic to list all courses
  const {username,password}=req.headers;
  const user = USERS.find((user) => user.username === username && user.password === password);
  if(user)res.send({courses:COURSES});
  else res.send({"message":"invalid credentials"});

});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
  const courseID=req.params.courseId;
  const {username,password}=req.headers;
  const user = USERS.find((user) => user.username === username && user.password === password);
  if(user){
    const course=COURSES.find((course)=>course.courseID==courseID);
    if(user['purchasedCourses']){
      user['purchasedCourses'].push(course);
    }else{
      user['purchasedCourses']=[course];
    }
    res.send({"message":"Course purchased successfully"});
  }else{
    res.send({"message":"invalid credentials"});
  }
});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
  const {username,password}=req.headers;
  const user = USERS.find((user) => user.username === username && user.password === password);
  if(user){
    res.send({coursesPurchased:user['purchasedCourses']});
  }else{
    res.send({"message":"invalid credentials"});
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
