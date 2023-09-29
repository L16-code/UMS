const express = require('express');
const user_route= express();

const config=require("../config/config")

const session=require("express-session");
user_route.use(session({secret:config.sessionsecret}));

const auth =require("../middleware/auth")

const bodyParser=require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));

const path=require('path');
const multer =require('multer');

user_route.use(express.static('public'));
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages'));
    },
    filename:function(req,file,cb){
        const name=Date.now()+'-'+file.originalname;
        cb(null,name);
    }
})
const upload=multer({storage:storage});
user_route.set('view engine','ejs');
user_route.set('views','./views/users');

const userController=require('../controllers/userController');

user_route.get('/register',auth.islogout,userController.loadRegister)
user_route.post('/register',upload.single('image'),userController.insertuser)


// email routes
user_route.get('/verify',userController.verifymail);


//login routes
user_route.get('/login',auth.islogout,userController.loginload);
user_route.get('/',auth.islogout,userController.loginload);

user_route.post('/login',userController.verifylogin);

user_route.get('/home',auth.islogin,userController.loadhome);


user_route.get('/logout',auth.islogin,userController.userlogout);

user_route.get('/forget',auth.islogout,userController.forgetpassword);
user_route.post('/forget',auth.islogout,userController.forgetemail);

user_route.get('/forget-password',auth.islogout,userController.loadforgetpassword);
user_route.post('/forget-password',userController.resetpassword);

user_route.get('/verification',auth.islogout,userController.loadverificationemail);
user_route.post('/verification',userController.verificationemail);


//user profile edit routes
user_route.get('/user-edit',auth.islogin,userController.user_edit_load);
user_route.post('/user-edit',upload.single('image'),userController.user_edit)
module.exports=user_route;