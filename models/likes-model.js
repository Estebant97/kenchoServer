const mongoose = require( 'mongoose' );

const likesSchema = mongoose.Schema({
    
    postOid:{
        type:mongoose.Schema.Types.ObjectId,
        ref : 'posts',
        required:true
    },
    userOid:{
        type:mongoose.Schema.Types.ObjectId,
        ref : 'users',
        required:true
    },
    liked: {
        type: Boolean,
        default : false,
        required: true
    }
});

const likeModel = mongoose.model( 'likes', likesSchema );

const Likes = {
    createLikedPost : function( newLikedPost ){
        return likeModel
                .create( newLikedPost )
                .then( likedPost => {
                    return likedPost;
                })
                .catch( err => {
                    throw new Error( err.message );
                }); 
    },
    getAllLikedPostsByUser : function(id){
        return likeModel
        .find({userOid:id})
        .populate('postOid', ['title'])
        .then(likedPosts=>{
            return likedPosts;
        })
        .catch( err => {
            throw new Error( err.message );
        });
    },
    checkIfLiked : function(postid, userid){
        return likeModel
        .exists({userOid:userid, postOid: postid})
        .then( isLiked => {
            return isLiked;
        })
        .catch( err => {
            return err;
        })
    },
    // change the boolean from True to False
    delLikedPostById : function( id ){
        return likeModel
                .findOneAndRemove({"postOid" : id})
                .then( likedPost => {
                    return likedPost;
                })
                .catch( err => {
                    return err;
                });
    }, 
    patchLikedById : function(id, uLiked){
        return likeModel
                .findByIdAndUpdate({"_id": id}, {"liked": uLiked})
                .then( likeUpdate => {
                    return likeUpdate;
                })
                .catch(err => {
                    return err;
                })  
    },
    delAllLiked : function(id) {
        return likeModel
            .deleteMany({postOid : id})
            .then( del => {
                return del;
            })
            .catch(err => {
                return err;
            })
    }
    // update liked post change boolean from False to True;
}

module.exports = {
    Likes
};