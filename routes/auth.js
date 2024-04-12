const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models/user-model");
const jwt = require("jsonwebtoken")

router.use((req, res, next) => {
    console.log("A request is coming in to auth.js");
    next();
})

router.get("/testAPI", (req, res) => {
    const msgObj = {
        message: "Test API is working.",
    };
    return res.json(msgObj);
    });

router.post("/register", async (req, res) => {
    // check the validation of data
    const { error } = registerValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    //check if the user exists
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
        return res.status(400).send("Email already exists.");
    }
    // register the user
    const newUser = new User({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        role: req.body.role,
    });
    try{
        const savedUser = await newUser.save();
        res.status(200).send({
            msg: "User created successfully.",
            savedObject: savedUser,
        });
    }catch(err){
        res.status(400).send("User not created.");
    }
   
    });
    
    router.post("/login", (req, res) => {
        // check the validation of data
        const { error } = loginValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        //check if the user exists
        User.findOne({email: req.body.email})
        .then((data) =>{
            if(!data){
                return res.status(400).send("Email not found.");
            }else(
                data.comparePassword(req.body.password, function (err, isMatch) {
                    if (err) return res.status(400).send(err);
                    if (isMatch) {
                        const tokenObject = { _id: data._id, email: data.email };
                        const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
                        res.send({ success: true, token: "JWT " + token, data });
                    } else {
                        res.status(401).send("Wrong password.");
                    }
                })
            )
        })
    
    });

module.exports = router;