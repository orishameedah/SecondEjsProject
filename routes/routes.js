const express = require('express');
const router = express.Router();
const User = require('../models/users');
const cloudinary = require("../utils/cloudinary");
const multer = require('multer');  //multer means uploading our images to our local files
const fs = require('fs');  //fs means file system (removing of image where we store it)

// var storage = multer.diskStorage({
//     // destination: function(req, file, cb){
//     //     cb(null, './public/uploads');
//     // },
//     // filename:  function(req, file, cb){
//     //     cb(null, file.fieldname + '_' + Date.now() + '_' + file.originalname );
//     // }
// })

var storage = multer.diskStorage({})

//middleware
var upload = multer({
    storage: storage,
}).single('image')  //we are going to be uploading single images at a time

//api or route to insert a user onto mongodb
// router.post('/add', upload, (req, res)=> {
//     const user = new User({
//         name: req.body.name,   //represent the body of our html tags that we aare sending to backend
//         email: req.body.email,
//         phone: req.body.phone,
//         image: req.file.filename,
//     });

//     user.save((err)=> {
//         if(err){
//             res.json({ message: err.message, type: 'danger' });
//         }else{
//             req.session.message ={
//                 type: 'success', 
//                 message: 'User added successfully!',
//             };
//         }
//         console.log(req.session)
//         res.redirect('/')
//     })
// })
router.post('/add', upload, async (req, res)=> {
    const result = await cloudinary.uploader.upload(req.file.path);
    try{
        const user = new User({
            name: req.body.name,   //represent the body of our html tags that we aare sending to backend
            email: req.body.email,
            phone: req.body.phone,
            image: result.secure_url,
            cloudinary_id: result.public_id,
        });

        await user.save();
        req.session.message ={
            type: 'success', 
            message: 'User added successfully!',
        };
        // console.log(req.session)
        res.redirect('/')
    }catch(err){
        res.json({ message: err.message, type: 'danger' });
    }
})

//Get all users route
router.get('/', (req, res)=>{
    User.find().exec((err, users)=>{
        if(err){
            res.json({message: err.message});
        }else{
            res.render('index', {title: 'Home Page', users: users})
        }
    })
})

router.get('/add',  (req, res)=>{
    res.render('add_users', {title: 'Add Users'})
})

router.get('/edit/:id', (req, res)=> {
    let id = req.params.id; //the id value is coming from the url in the browser 
    User.findById(id, (err, user)=> {
        if(err){
            res.redirect('/');
        }else {
            if (user == null){
                res.redirect('/')
            }else{
                res.render('edit_users', {title: 'Edit User', user: user})
            }
        }
    })
})

//Update user route
router.post('/update/:id', upload, async (req, res)=>{
    let id = req.params.id;
    let user = await User.findById(req.params.id);
    let new_image = '';
    if(req.file){
        const result = await cloudinary.uploader.upload(req.file.path);
        // new_image = req.file.path; //assign the newly selected image file name to new_image
        new_image = result.secure_url;
        try{
            // fs.unlinkSync('./public/uploads/' + req.body.old_image); //to remove old image from public
                  // Delete image from cloudinary
        await cloudinary.uploader.destroy(user.cloudinary_id);  //to replace 
        } catch(err){
            console.log(err)
        }
    }else{
        new_image = req.body.old_image;  //means we are not changing the old image
        // new_image = user.image;
    }

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image,
    }, (err, result)=>{
        if(err){
            res.json({message: err.message, type: 'danger'});
        }else{
            req.session.message = {
                type: 'success',
                message: 'User updated successfully',
            };
            // res.redirect(`/edit/${id}`);
            res.redirect('/');
        }
    });
});



//delete user route
// router.get('/delete/:id', (req, res)=>{
//     let id = req.params.id;
//     User.findByIdAndRemove(id, (err, result,)=> {
//         if(result.image != ''){
//             try{
//                 // fs.unlinkSync('./public/uploads/'+result.image);  //remove the image of the delete record
//             }catch(err){
//                 console.log(err);
//             }
//         }

//         if(err){
//             res.json({message:err.message})
//         }else{
//            req.session.message ={
//             type: 'info',
//             message: 'User deleted successfully',
//            };
//            res.redirect('/') 
//         }

//     })
// })

//deleting image from cloudinary and also remove the user information from db
router.get("/delete/:id", async (req, res) => {
    try {
      // Find user by id
      let user = await User.findById(req.params.id);
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(user.cloudinary_id);
      // Delete user from mongodb
      await user.remove();
      req.session.message ={
        type: 'info',
        message: 'User deleted successfully',
      };
      res.redirect('/') 
    } catch (err) {
        console.log(err)
      res.json({message:err.message})
}});

module.exports = router;