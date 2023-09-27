const User=require('../models/userModel')
const bcrypt =require('bcrypt');
const Nodemailer=require('nodemailer');
const RandomString=require('randomstring');

const config = require('../config/config');



//to send mail
const sendverifymail=async(name,email,user_id)=>{
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
            subject:"for verification ",
            html:'<p>hii '+name+', please click here to <a href="http://localhost:3000/verify?id='+user_id+'">verify</a> your mail.</p>'
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

// for reset pass. send mail
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
            html:'<p>hii '+name+', please click here to <a href="http://localhost:3000/forget-password?token='+token+'">reset </a>your password.</p>'
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
const loadRegister=async(req,res)=>{
    try {
        res.render('register')
    } catch (error) {
        
    }
}

const insertuser=async(req,res)=>{
    try {
        const spass= await securepassword(req.body.password);
        const user=new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            image:req.file.filename,
            password:spass,
            is_admin:0,
        });
        const userdata=await user.save();
        if(userdata){
            sendverifymail(req.body.name,req.body.email,userdata._id);
            res.render('register',{message:"success"})
        }else{
            res.render('register',{message:"failed to register"});
        }
    } catch (error) {
        console.log(error.message);
    }
}
const verifymail=async(req,res)=>{
    try {
        const updateinfo= await User.updateOne({_id:req.query.id},{$set:{is_verified:1}});
        console.log(updateinfo);
        res.render("email-verified");
    } catch (error) {
        console.log(error.message);
    }
}

//login user method start
const loginload=async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

const verifylogin = async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userdata=await User.findOne({email:email}); 
        if (userdata){
            const passwordmatch=await bcrypt.compare(password,userdata.password)
            if(passwordmatch){
                if(userdata.is_verified===0){
                    res.render('login',{message:"please verify your mail"})
                }else{
                    req.session.user_id=userdata._id;
                    res.redirect('/home');
                }
            }else{
                res.render('login',{message:"email and password is incorrect"});
            }

        }else{
            res.render('login',{message:"email and password is incorrect"});
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loadhome=async(req,res)=>{
try {
    const userdata=await User.findById({_id:req.session.user_id})
    res.render('home',{user:userdata});
} catch (error) {
    console.log(error.message);
}
}

const userlogout=async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}

const forgetpassword=async(req,res)=>{
    try {
        res.render('forget');
    } catch (error) {
        console.log(error.message);
    }
}
const forgetemail = async(req, res) =>{
    try {
        const email =  req.body.email;
        const userdata=await User.findOne({ email: email});
        if(userdata){
            if(userdata.is_verified===0){
                res.render('forget',{message:"please verify your mail"})

            }else{
                const randomstring=RandomString.generate();
                const upadatedata=await User.updateOne({email:email},{$set:{token:randomstring}});
                // console.log(randomstring);
                sendresetmail(userdata.name,userdata.email,randomstring);
                res.render('forget',{message:"please check your mail"});
            }
        }else{
            res.render('forget',{message:"user email is incorrect"})
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadforgetpassword=async(req,res)=>{
    try {
        const token =req.query.token;
        const tokendata=await User.findOne({token:token});
        if(tokendata){
            res.render('forget-password',{user_id:tokendata._id});
        }else{
            res.render('404',{message:"not found"});
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
const resetpassword =async(req,res)=>{
    try {
        const password=req.body.password;
        const user_id = req.body.user_id;
        const securepass=await securepassword(password);
        const updateddata=await User.findByIdAndUpdate({_id:user_id},{$set:{password:securepass,token:""}});
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

// for verification link
const loadverificationemail=async(req,res) => {
    try {
        res.render('verification');
    } catch (error) {
        console.log(error.message);
    }
}
const verificationemail=async(req,res) => {
    try {
        // res.render('verification');
        const email=req.body.email;
        const userdata=await User.findOne({ email: email});
        if(userdata){
            sendverifymail(userdata.name,email,userdata._id);
            res.render('verification',{message:"Reset verification mail has been sent to your mail"});
        }else{
            res.render('verification',{message:"email is not present"});
        }

    } catch (error) {
        console.log(error.message);
    }
}

const user_edit_load=async(req,res) => {
    try {
        const id=req.query.id;
        const userdata=await User.findOne({_id:id});
        if(userdata){
            res.render('user_edit',{user:userdata})
        }else{
            res.redirect('home');
        }

        
    } catch (error) {
        console.log(error.message);
    }
}
const user_edit=async(req,res) => {
    try {
        if(req.file){
            const userdata=await User.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,image:req.file.filename}});

        }else{
            const userdata=await User.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile}});
        }
        res.redirect('home')

    } catch (error) {
        console.log(error.message);
    }
}
module.exports={
    loadRegister,
    insertuser,
    verifymail,
    loginload,verifylogin,
    loadhome,
    userlogout,
    forgetpassword,
    forgetemail,
    loadforgetpassword,
    resetpassword,
    loadverificationemail,
    verificationemail,
    user_edit_load,
    user_edit
}