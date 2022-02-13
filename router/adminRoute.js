const express = require("express");
const bcryptjs = require('bcryptjs');
const router = new express.Router();
const jwt = require("jsonwebtoken");
const Admin = require('../models/adminModel');

// Admin registration
router.post("/admin/register", function(req,res){
    const email = req.body.email;
    
    Admin.findOne({email: email})
    .then(function(AdminData){
        if(AdminData!=null){
            res.status(400);
            res.json({message : "Admin already exist"})
            return;
         }
         
    const password = req.body.password;
    bcryptjs.hash(password, 10, function(e, hashed_value){
        const data = new Admin({
            email: email,
            password: hashed_value

        })
        data.save()
        .then(function(){
            res.json({message: "Admin Registered succesfully"})
        })
        .catch(function(e){
            res.status(400);
            res.json(e);
        })
    })

    })
})

// Admin login
router.post('/admin/login', function(req,res){
    const email = req.body.email;
    Admin.findOne({email : email})
    .then(function(AdminData){
        if(AdminData === null){
            res.status(400);
            res.json({message: "Invalid email"})
        }

        const password = req.body.password;
        bcryptjs.compare(password, AdminData.password, function(e,result){

            if(result == false){
                res.status(400);
                return res.json({message : "Invalid password"})
            }

            const token = jwt.sign({})
        })
    })

})

module.exports = router;