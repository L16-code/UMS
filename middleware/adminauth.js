const User = require("../models/userModel");
const islogin=async(req,res,next)=>{
    try {
        if(req.session.user_id){}
        else{
            res.redirect('/admin')
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}
const islogout=async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/admin/home')
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}
const isadmin=async(req,res,next)=>{
    try {
        const id=req.session.user_id;
        const userdata=await User.findOne({_id:id})
        // console.log(userdata.is_admin);
        if(userdata.is_admin===1){
        }else{
            res.redirect('404');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    islogin,
    islogout,
    isadmin
}