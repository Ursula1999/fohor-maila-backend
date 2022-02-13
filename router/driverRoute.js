const express = require ("express");
const bcryptjs = require("bcryptjs");
const Driver = require("../models/driverModel");
const addBin = require("../models/addbinModel");
const jwt = require("jsonwebtoken");
const { append } = require("express/lib/response");
const router = new express.Router();

const auth = require("../auth/auth");
const { route } = require("express/lib/application");


router.post("/driver/register",auth.verifyUser,auth.authorizeRoles("admin"), function(req,res){
    const createdBy = req.userInfo._id;
    console.log(createdBy);
    const email = req.body.email;
    Driver.findOne({email:email}) //username from model and const variable that pulls 
    .then(function(driverData){
        if(driverData!=null){
            res.status(400);
            res.json({message : "Driver already exist!"})
            return;
        }
        // now this is for the user which is not available in db
        const fullName = req.body.fullName;
        const password = req.body.password;
        const phone = req.body.phone;
        const address = req.body.address;
        const citizenshipNo = req.body.citizenshipNo
        bcryptjs.hash(password,10, function(e,hashed_value){
            const data = new Driver({
                email:email,
                fullName:fullName,
                password: hashed_value,
                phone:phone,
                address:address,
                citizenshipNo: citizenshipNo,
                createdBy: createdBy
                // image : req.file.filename
            })
            data.save()
            .then(function(){
                res.json({message: "Registered Successful!"});
            })
            .catch(function(e){
                res.json(e)
            })

        })

    })

})

// login route for driver

router.post("/driver/login",function(req,res){
    const email = req.body.email;
    Driver.findOne({email : email})
    .then(function(driverData){
        if(driverData===null){
            res.status(400);
            res.json({message : "Invalid Login!"})
        }
        // Comparing password between the pw proivided by client and pw stored in database
        // client pw, db wala pw before function, e-error or result
        const password = req.body.password;
        bcryptjs.compare(password, driverData.password, function(e, result){ 
                       
            if(result == false){
                res.status(400);
                return res.json({message: "Invalid password"})
            }

            // now lets generate token
            // jsonwebtoken
            const token = jwt.sign({driverId: driverData._id}, "Drivergrant");
            res.json({
                token: token,
                message : "Success"})
        })
 

    })
    
})

// profile update
router.put("/driver/profile/update",auth.verifyDriver, function(req,res){
    
    const d_id = req.driverInfo._id;
    const phone = req.body.phone;
    const address = req.body.address;
    const citizenshipNo = req.body.citizenshipNo;
    console.log(d_id);
    Driver.updateOne({_id : d_id},
        
        {address:address, 
        phone:phone, 
        citizenshipNo:citizenshipNo}
        )
    .then(function(){
        res.json({msg:"Profile Updated"})
    }
    )
    .catch(function(){
        res.status(400);
        res.json({msg:"Something went wrong"})

    });
    });

router.get('/Admin/driver/view',auth.verifyUser, auth.authorizeRoles("admin"), function(req,res){
    Driver.find()
    .then(function(DriverList){
        if(DriverList === null){
            res.status(400);
            return res.json({message:"Drivers are not available"});

        }
        res.json({sucess: true, 
            DriverList: DriverList})
    })

})
// to delete profile by admin
router.delete("/Admin/driverprofile/delete",auth.verifyUser, auth.authorizeRoles("admin"), function(req,res){
    const d_id = req.body.driverId;
    Driver.findById(d_id)
    .then(function(driverData)
    
    {
        if(driverData === null){
            res.status(400);
            return res.json({message:"Invalid ID"})
        }
        driverData.remove();
        res.json({msg:"Driver deleted"});
    })
    .catch(function(){
        res.status(400);
        res.json({msg:"Something went wrong"});
    })

})
// Individual driver schedule

router.get('/driver/myaddbin/view',auth.verifyDriver, function(req,res){
    addBin.findOne({driverEmail:req.driverInfo.email})
    .then(function(addBinList){
        if(addBinList === null){
            res.status(400);
            return res.json({message:"Bin doesnt exist"});

        }
        res.json({sucess: true, 
            addBinList: addBinList})
    })
})   


module.exports = router;