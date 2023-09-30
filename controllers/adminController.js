const User = require("../models/userModel");
const bcrypt=  require("bcrypt")
const Nodemailer=require('nodemailer');
const RandomString= require("randomstring");
const config = require("../config/config");


const sendresetmail=async(name,email,token)=>{
    try {
        const transporter=Nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailuser,
                pass:config.emailpassword
            }
        });
        const mailoptions={
            from:config.emailuser,
            to:email,
            subject:"for Reset Password ",
            html:'<p>hii '+name+', please click here to <a href="http://localhost:3000/admin/forget-password?token='+token+'">reset </a>your password.</p>'
        }
        transporter.sendMail(mailoptions,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("emailis sent successfully",info.response)
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const securepassword=async(password)=>{
    try {
        const hashpass=await bcrypt.hash(password,10);
        return hashpass;
    } catch (error) {
        console.log(error.message)
    }
}

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
        const id=req.session.user_id;
        const userdata=await User.findOne({_id:id});

        res.render('home',{user:userdata});
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

const forgetload= async(req, res)=>{
    try {
        res.render('forget');
    } catch (error) {
        console.log(error.message);
    }
}

const forgetpassword= async(req, res)=>{
    try {
        const email= req.body.email;
        const userdata=await User.findOne({email: email})
        if(userdata){
            if(userdata.is_admin===0){
                res.render('forget',{message:"email is incorrect"})
            }else{
                const randomstring=RandomString.generate();
                const updateddata=await User.updateOne({email: email},{$set:{token:randomstring}});
                sendresetmail(userdata.name,email,randomstring);
                res.render('forget',{message:"please check your mail to reset passsword"})


            }
        }else{
            res.render('forget',{message:"email is incorrect"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const forgetpasswordload=async(req, res) => {
    try {
        const token=req.query.token;
        const tokendata =await User.findOne({token:token})
        if(tokendata){
            res.render('forget-password',{user_id:tokendata._id})
        }else{
            res.render('404',{message:"invalid link"})
        }
    } catch (error) {
        console.log(error.message);
    }
}
const resetpassword=async(req,res)=>{
    try {
        const password=req.body.password;
        const user_id=req.body.user_id;
        const securepass=await securepassword(password);
        const updateddata=await User.findByIdAndUpdate({_id:user_id},{$set:{password:securepass,token:""}});
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}

const dashboardload=async(req,res)=>{
    try {
        console.log(req.session)
        const userdata=await User.find({is_admin:0})
        res.render('dashboard',{users:userdata});
    } catch (error) {
        console.log(error.message);
    }
}
module.exports ={
    loadlogin,
    adminlogin,
    homeload,
    adminlogout,
    forgetload,
    forgetpassword,
    forgetpasswordload,
    resetpassword,
    dashboardload
}