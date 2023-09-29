const User = require("../models/userModel");
const bcrypt=  require("bcrypt")

const loadlogin = async(req,res)=>{
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}
const adminlogin = async(req,res)=>{
    try {
        const email=req.body.email;
        const password=req.body.password;
        const userdata=await User.findOne({ email: email});
        if(userdata){
            const passwordmatch=await bcrypt.compare(password, userdata.password);
            if(passwordmatch){
                if(userdata.is_admin===1){
                    req.session.user_id=userdata._id;
                    res.redirect("home");
                }else{
                    res.render('login',{message:"email and password is incorrect"})
                }
            }else{
                res.render('login',{message:"email and password is incorrect"})
            }
        }else{
            res.render('login',{message:"email and password is incorrect"})

        }

    } catch (error) {
        console.log(error.message);
    }
}

const homeload= async(req, res)=>{
    try {
        res.render('home');
    } catch (error) {
        console.log(error.message);
    }
}

const adminlogout= async(req, res)=>{
    try {
        req.session.destroy();
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}
module.exports ={
    loadlogin,
    adminlogin,
    homeload,
    adminlogout
}