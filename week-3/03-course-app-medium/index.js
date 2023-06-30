const express = require('express');
const jwt=require('jsonwebtoken');
const fs=require('fs');
const secretKey="Vedansh";
const app = express();

function generateToken(username,password){
  return jwt.sign({username:username,password:password},secretKey);
}

function verifyToken(token){
  return jwt.verify(token,secretKey);
}
function fetchData(obj) {
  const path = './' + obj + '.txt';
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        if (data.trim() === '') {
          resolve([]);
        } else {
          resolve(JSON.parse(data));
        }
      }
    });
  });
}

function putData(obj,data){
    path='./'+obj+'.txt';
    fs.writeFile(path,JSON.stringify(data),(err)=>{
        if(err)throw err;
        return;
    });
}


app.use(express.json());



app.post('/admin/signup', (req, res) => {

  const admin=req.body;
  const token=generateToken(admin.username,admin.password);
  const newadmin=({...admin,token:token});
  
  fetchData('admins').then((admins)=>{putData('admins',[...admins,newadmin])});
  res.send({message:"Admin created successfully",token:token});


});



app.post('/admin/login', (req, res) => {

  const {username,password}=req.body;
  
  fetchData('admins').then((admins)=>{
    const admin = admins.find((admin) => admin.username === username && admin.password === password);

    if(admin)res.send({"message":'Logged in successfully',token:admin.token});
    else res.send({"message":"invalid credentials"});
  })

});




app.post('/admin/courses', (req, res) => {

  try{
    const token=req.headers.authorization.split(" ")[1];
    const {username,password}=verifyToken(token);

    fetchData('admins').then((admins)=>{
      const admin = admins.find((admin) => admin.username === username && admin.password === password);

      if(admin){
        const course=req.body;
        fetchData('courses').then((courses)=>{
          putData('courses',[...courses,{course,courseID:courses.length+1}])
          res.send({"message":"Course created successfully",courseID:courses.length+1});
        });
      }
      else res.send({"message":"invalid credentials"});
    })

  }
  catch(err){
    res.send({"message":"invalid token"});
  }

});



app.put('/admin/courses/:courseId', (req, res) => {
try{
  const token=req.headers.authorization.split(" ")[1];
  const {username,password}=verifyToken(token);
  const courseID=req.params.courseId;

  fetchData('admins').then((admins)=>{
    const admin = admins.find((admin) => admin.username === username && admin.password === password);

    if(admin){
      const course=req.body;

      fetchData('courses').then((courses)=>{
        const courseIndex=courses.findIndex((course)=>course.courseID==courseID);

        if(courseIndex!=-1)courses[courseIndex]={...req.body,courseID:courseID};
        putData('courses',[...courses])
        res.send({"message":"Course updated successfully",courseID:courseID});
      });
    }
    else res.send({"message":"invalid credentials"});
  })
}

catch(err){
  res.send({"message":"invalid token"});
}
});




app.get('/admin/courses', (req, res) => {
  try{
    const token=req.headers.authorization.split(" ")[1];
    const {username,password}=verifyToken(token);

    fetchData('admins').then((admins)=>{
      const admin = admins.find((admin) => admin.username === username && admin.password === password);

      if(admin){
        fetchData('courses').then((courses)=>{
          res.send({courses:courses});
        });
      }
      else res.send({"message":"invalid credentials"});
    })

  }catch(err){
    res.send({"message":"invalid token"});
  }

});










// User routes



app.post('/users/signup', (req, res) => {

    const user=req.body;
    const token=generateToken(user.username,user.password);
    const newuser=({...user,token:token});

    fetchData('users').then((users)=>{
      putData('users',[...users,newuser])
      res.send({message:"User created successfully",token:token});
    });

});



app.post('/users/login', (req, res) => {

  const {username,password}=req.body;
  fetchData('users').then((users)=>{
      const user = users.find((user) => user.username === username && user.password === password);
      if(user)res.send({"message":'Logged in successfully',token:user.token});
      else res.send({"message":"invalid credentials"});
  })

});




app.get('/users/courses', (req, res) => {
  try{
    const token=req.headers.authorization.split(" ")[1];
    const {username,password}=verifyToken(token);

    fetchData('users').then((users)=>{
      const user = users.find((user) => user.username === username && user.password === password);
      if(!user)res.send({"message":"invalid credentials"});
      else{
        fetchData('courses').then((courses)=>{
          res.send({courses:courses});
        });
      }
    }); 
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

  fetchData('users').then((users)=>{
      const user = users.find((user) => user.username === username && user.password === password);
      if(!user)res.send({"message":"invalid credentials"});
      else{
        fetchData('courses').then((courses)=>{
            const course=courses.find((course)=>course.courseID==courseID);
            if(user['purchasedCourses']){
              user['purchasedCourses'].push(course);
            }else{
              user['purchasedCourses']=[course];
            }
            putData('users',[...users]);
            res.send({"message":"Course purchased successfully"});
          })
        }
      });
    }
catch(err){
  res.send({"message":"invalid token"});
}

});




app.get('/users/purchasedCourses', (req, res) => {
  try{

    const token=req.headers.authorization.split(" ")[1];
    const {username,password}=verifyToken(token);

    fetchData('users').then((users)=>{
        const user = users.find((user) => user.username === username && user.password === password);
        if(!user)res.send({"message":"invalid credentials"});
        else res.send({coursesPurchased:user['purchasedCourses']});
    });
  }
  catch(err){
    res.send({"message":"invalid token"});
  }

});

app.listen(3000, () => {
console.log('Server is listening on port 3000');
});