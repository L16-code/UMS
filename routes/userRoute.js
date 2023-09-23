const express = require('express');
const user_route= express();


const bodyParser=require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));

const path=require('path');
const multer =require('multer');

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

user_route.get('/register',userController.loadRegister)
user_route.post('/register',upload.single('image'),userController.insertuser)

module.exports=user_route;