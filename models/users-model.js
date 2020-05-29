const mongoose = require( 'mongoose' );

const userSchema = mongoose.Schema({
    username : {
        type : String,
        required : true,
        index: {unique:true}
    },
    email:{
        type: String,
        required:true,
        unique: true
    },
    password:{
        type: String,
        required:true
    }


});

const userModel = mongoose.model( 'users', userSchema );

const Users = {
    createUser : function( newUser ){
        return userModel
                .create( newUser )
                .then( user => {
                    return user;
                })
                .catch( err => {
                    throw new Error( err.message );
                }); 
    },
    getAllUsers : function(){
        return userModel
                .find()
                .then( users => {
                    return users;
                })
                .catch( err => {
                    throw new Error( err.message );
                }); 
    },
    getUserByEmail : function( email ){
        return userModel
                .findOne( {email} )
                .then( user => {
                    return user;
                })
                .catch( err => {
                    throw new Error(err.message);
                });
    },
    getUserById: function(id){
        return userModel
                    .find( {_id: id})
                    .then( user => {
                        return user;
                    })
                    .catch( err => {
                        throw new Error( err.message );
                    });
    },
    // delete user by id
    delUserById : function(id){
        return userModel
                .findOneAndRemove({"_id" : id})
                .then( user => {
                    return user;
                })
                .catch( err => {
                    return err;
                });
    },
    // patch by id
    patchUserById : function(id, uUsername, uEmail, uPassword){
        return userModel
                .findByIdAndUpdate({"_id": id}, {"username": uUsername, "email": uEmail, "password" : uPassword})
                .then( userUpdate => {
                    return userUpdate;
                })
                .catch(err => {
                    return err;
                })  
    }
}

module.exports = {
    Users
};