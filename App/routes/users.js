const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();


//Loadd USER mODEL
require('../models/User');
const User = mongoose.model('users');

//User Login Route
router.get('/login', (req, res) => {
    res.render('users/login');
});

//User Register Route
router.get('/register', (req, res) => {
    res.render('users/register');
});

//Login form post 
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//Register Form POST
router.post('/register', (req, res) => {
    let errors = [];
    if(req.body.password.length < 5){
        errors.push({text: 'password must be greater than or equal to 4 characters'});
    }
    if(req.body.password != req.body.password2){
        errors.push({text: "Passwords fields must match!"})
    }
    if(errors.length > 0){
        res.render('users/register', {
            errors: errors,
            name : req.body.name,
            email : req.body.email
        });

    }else{
        User.findOne({email: req.body.email})
            .then(user => {
                if(user){
                    req.flash('error_msg', 'Email Already Registered');
                    res.redirect('/users/register');
                }else{
                    const newUser = {
                        name : req.body.name,
                        email : req.body.email,
                        password: req.body.password
                    }
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err;
                            newUser.password = hash;
                            new User(newUser)
                            .save()
                            .then(user=>{
                                req.flash('success_msg', 'You are now registered')
                                res.redirect('/users/login');
                            })
                            .catch(err => {
                                console.log(err);
                                return;
                            });
                        });
                    });
                }
            });
      
        
    }
});
//Logout User
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;