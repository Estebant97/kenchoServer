const mongoose = require( 'mongoose' );

const postsSchema = mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    image : {
        type: String,
        required: true
       //falta poner los datos de la imagen
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref : 'comments'
    }],
    userOid:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required:true
    }
});

const postModel = mongoose.model( 'posts', postsSchema );

const Posts = {
    //CHECAR CON EL PROFE 
    addPost : function( newPost ){
        return postModel
                .create( newPost )
                .then( post => {
                    return post;
                })
                .catch( err => {
                    throw new Error( err.message );
                });
    },
    //HOME
    getAllPosts : function(){
        return postModel
                .find()
                .populate('userOid', ['username'] )
                .then( posts => {
                    return posts;
                })
                .catch( err => {
                    throw new Error( err.message );
                });
    },
    getPostById : function( id ){
        return postModel
                .find( {_id: id})
                .populate( 'comments', ['content','userOid.username'] )
                .populate({path: 'comments', select : 'content userOid',
                    // Get friends of friends - populate the 'friends' array for every friend
                    populate: { path: 'userOid', select: 'username' }
                })
                .populate( 'userOid', ['username'] )
                //checar este populate que si funciona pero no se si mostrara todos los usuarios
                //preguntar como mostrar el username tambien por cada comment
                // checar algo de populate adentro del populate
                .then( post => {
                    return post;
                })
                .catch( err => {
                    throw new Error( err.message );
                });
    },
    getPostByUser: function(id){
        return postModel
            .find({userOid:id})
            .populate('userOid', ['username'])
            .then( post => {
                return post;
            })
            .catch( err => {
                throw new Error( err.message );
            });
    },
    //esto es para updatear los comments del post!!!
    updateComments : function(idPost, idComment){
        return postModel
            .update({_id: idPost}, {$push: {comments: idComment}})
            .then(updatedPost => {
                return updatedPost;
            })
            .catch(err => {
                throw new Error(err.message);
            });
    },
    delPostById : function( id ){
        return postModel
                .findOneAndRemove({_id : id})
                .then( post => {
                    return post;
                })
                .catch( err => {
                    return err;
                });
    }, 
    // solo se puede cambiar el titulo del post
    patchPostById : function(id, uTitle){
        return postModel
                .findByIdAndUpdate({"_id": id}, {"title": uTitle})
                .then( postUpdate => {
                    return postUpdate;
                })
                .catch(err => {
                    return err;
                })  
    },
    deleteComments : function(idPost){
        return postModel
                .findOneAndUpdate({_id: idPost}, {"$pull" : {"comments" : null}})
                .then(deletedComments => {
                    return deletedComments;
                })
                .catch(err => {
                    throw new Error(err.message);
                })
    }
}

module.exports = {
    Posts
};