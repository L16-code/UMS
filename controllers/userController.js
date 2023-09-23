const User=require('../models/userModel')
const bcrypt =require('bcrypt');

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
            res.render('register',{message:"success"})
        }else{
            res.render('register',{message:"failed to register"});
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    loadRegister,
    insertuser
}