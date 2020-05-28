const mongoose = require( 'mongoose' );

const commentSchema = mongoose.Schema({
    userOid:{
        type:mongoose.Schema.Types.ObjectId,
        ref : 'users',
        required:true
    },
    postOid : {
        type:mongoose.Schema.Types.ObjectId,
        ref : 'users',
        required:true
    },
    content : {
        type : String,
        required : true
    }
});

const commentModel = mongoose.model( 'comments', commentSchema );

const Comments = {
    addComment : function( newComment ){
        return commentModel
                .create( newComment )
                .then( comment => {
                    return comment;
                })
                .catch( err => {
                    throw new Error( err.message );
                });
    },
    //COMMENTS DEL ACTIVITY LOG
    getAllCommentsByUserId : function(id){
        return commentModel
                .find({userOid: id})
                .populate('userOid', ['username'] )
                .then( comments => {
                    return comments;
                })
                .catch( err => {
                    throw new Error( err.message );
                });
    }, 
    getAllComments : function() {
        return commentModel
            .find()
            .then( comments => {
                return comments;
            })
            .catch( err => {
                throw new Error( err.message );
            })
    }, 
    delCommentById : function( id ){
        return commentModel
                .findOneAndRemove({"_id" : id})
                .then( comment => {
                    return comment;
                })
                .catch( err => {
                    return err;
                });
    }, 
    patchCommentById : function(id, uContent){
        return commentModel
                .findByIdAndUpdate({"_id": id}, {"content": uContent})
                .then( commentUpdate => {
                    return commentUpdate;
                })
                .catch(err => {
                    return err;
                })  
    }
}

module.exports = {
    Comments
};