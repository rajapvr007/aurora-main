import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import generateToken from '../utils/generateToken.js'

//Auth user and get token
//POST /api/users/login
//Public

const authUser = asyncHandler( async( req,res ) => {
    const { email, password } = req.body;
    const user = await User.findOne({email});

    if(user && (await user.matchPassword(password))) {
        generateToken(res,user._id);
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    }
    else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

//register user
//POST /api/users
//Public

const registerUser = asyncHandler(async ( req,res ) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({email});

    if(userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    const user = await User.create({
        name,
        email,
        password,
    })

    if(user) {
        generateToken(res,user._id);
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            password: user.password,
        })
    }
    else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});


//logout the user and clear cookies
//POST /api/users/logout
//Private

const logoutUser = asyncHandler( async( req,res ) => {
    res.cookie('jwt','',{
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({message: 'Logged out successfully'});
});


//get user profile
//GET /api/users/profile
//Private

const getUserProfile = asyncHandler( async( req,res ) => {
    const user = await User.findById(req.user._id);
    if(user) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});


//update user profile
//PUT /api/users/profile
//Private

const updateUserProfile = asyncHandler( async( req,res ) => {
    const user = await User.findById(req.user._id);
    if(user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if(req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin
        });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});


//get all users
//GET /api/users
//Private/Admin

const getUsers = asyncHandler( async( req,res ) => {
    const users = await User.find({});
    if(users) {
        res.status(200).json(users);
    }
    else {
        res.status(404);
        throw new Error('No users found');
    }
});


//get user by id
//GET /api/users/:id
//Private/Admin

const getUserByID = asyncHandler( async( req,res ) => {
    const user = await User.findById(req.params.id).select('-password');
    if(user) {
        res.status(200).json(user);
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});


//delete user
//DELETE /api/users/:id
//Private/Admin

const deleteUser = asyncHandler( async( req,res ) => {
    const user = await User.findById(req.params.id);
    if(user) {
        if(user.isAdmin) {
            res.status(400);
            throw new Error('Cannot delete admin user');
        } else {
            await User.findByIdAndDelete(user._id);
            res.status(200).json({message: 'User deleted'});
        }
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});

//update user
//PUT /api/users/:id
//Private/Admin

const updateUser = asyncHandler( async( req,res ) => {
    const user = await User.findById(req.params.id);
    if(user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isAdmin = Boolean(req.body.isAdmin);

        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin
        });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});


export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    getUserByID,
    deleteUser,
    updateUser
};