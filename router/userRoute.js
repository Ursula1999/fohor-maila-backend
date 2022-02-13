const express = require("express");
const bcryptjs = require("bcryptjs");
const User = require("../models/userModel");
const router = new express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../auth/auth");
const { redirect } = require("express/lib/response");
const res = require("express/lib/response");

router.post("/User/register", function(req,res){
    const email = req.body.email;
    User.findOne({email:email})
    .then(function(userData){
        if(userData!=null){
            res.status(400);
            res.json({message : "User already exist! Kindly try other username."})
            return;
        }
        const password = req.body.password;
        const fullname = req.body.fullname;
        const address = req.body.address;
        
        bcryptjs.hash(password, 10, function(e, hashed_value){
            const data = new User({
                fullname: fullname,
                address: address,
                email: email,
                password: hashed_value
            })
            data.save()
            .then(function(){
                res.json({message:"Registered Successfull",user:data })


            })
            .catch(function(e){
                res.status(400);
                res.json(e)
            })
        })

    })
})

router.post("/User/login", function(req, res){
    const email = req.body.email;
    User.findOne({email:email})
    .then(function(userData){
        if(userData === null){
            res.status(400);
            return res.json({message:"Email is not registered"})
        }
        const password = req.body.password;
        bcryptjs.compare(password, userData.password, function(e, result){

            if(result == false){
                res.status(400);
                return res.json({message:"Invalid password!!"});
                
            }
            const token = jwt.sign({userId: userData._id},"Usergrant");
            res.json({
                token:token,
                message:"Login Sucessful"})
        })
    })

})

router.put('/User/profile/update', auth.verifyUser, function(req, res){
        const uid = req.userInfo._id;
        const address = req.body.address;
        const fullname = req.body.fullname;
        User.updateOne({_id : uid}, {address : address, fullname: fullname},)
        .then(function(){
            res.json({msg:"Profile Updated"})
        }
        )
        .catch(function(){
            res.status(400);
            res.json({msg:"Error while updating profile!"})
    
        });
})

router.get("/User/myprofile",auth.verifyUser, function(req,res){
    const userData = req.userInfo
    res.json({
            userData
    }).catch(function(){
        res.status(400)
        res.json({message : "somethign went wrong"})
    })
})

// authorize access to admin only
router.delete("/Admin/userdelete/:id", auth.verifyUser, auth.authorizeRoles("admin"), function(req,res){
    const userId = req.params.id
    User.findById({_id:userId})
    .then(function(userData){
        if(!userData){
        return res.json({message:"User is not available"})
    }
    userData.remove();
    res.json({message:"User deleted succesfully"});})
}). catch(function(){
    res.status(400);
    res.json({message:"Error while deleting user profile"})
})






module.exports = router;