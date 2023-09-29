const express = require('express');
const admin_route= express();

const config = require('../config/config');
const session=require('express-session');
admin_route.use(session({secret:config.sessionsecret}))

const bodyParser=require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');

const path=require('path');

const auth=require('../middleware/adminauth');
const adminController=require("../controllers/adminController");

admin_route.get('/',auth.islogout,adminController.loadlogin);
admin_route.post('/',adminController.adminlogin);

admin_route.get('/home',auth.islogin,adminController.homeload);

admin_route.get('/adminlogout',auth.islogin,adminController.adminlogout);






admin_route.get('*',function(req,res){
    res.redirect('/ admin');
});

module.exports = admin_route;