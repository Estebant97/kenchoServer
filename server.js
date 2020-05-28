// librerias
const express = require( 'express');
const bodyParser = require( 'body-parser');
const mongoose = require( 'mongoose' );
const morgan = require( 'morgan' );
const jsonParser = bodyParser.json();
const bcrypt = require( 'bcryptjs' );
const jwt = require( 'jsonwebtoken' );
const { Comments } = require('./models/comments-model');
const { Likes } = require('./models/likes-model');
const { Posts } = require('./models/posts-model');
const { Users } = require('./models/users-model');
const {DATABASE_URL, PORT, SECRET_TOKEN} = require( './config' );
const cors = require( './middleware/cors' );
const app = express();
//use
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
  
    const path = require('path');
    app.get('*', (req,res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
  
}
app.use( morgan( 'dev' ) );
app.use( cors );


//*****************************************************USERS*********************************************
app.get('/validate-user', (req, res) => {
    const {sessiontoken} = req.headers;
    jwt.verify( sessiontoken, SECRET_TOKEN, (err, decoded ) => {
        if( err ){
            res.statusMessage = "Session expired";
            return res.status( 400 ).end();
        }
        return res.status( 200 ).json( decoded );
    });
});
// get all users
app.get('/allUsers', (req, res) =>{
    Users
    .getAllUsers()
    .then(users => {
        return res.status(201).json(users)
    })
    .catch( err=> {
        res.statusMessage = err.message;
        return res.status(500).end();
    })
});
// Login
app.post( '/users/login', jsonParser, (req, res) => {
    let {email, password } = req.body;
    if( !email || !password ){
        res.statusMessage = "Parameter missing in the body of the request";
        return res.status( 406 ).end();
    }
    Users
        .getUserByEmail( email )
        .then( user => {
            if( user ){
                bcrypt.compare( password, user.password )
                    .then( result => {
                        if(result) {
                            let userData = {
                                username : user.username,
                                email: user.email, 
                                userOid : user._id
                            };
                            jwt.sign(userData, SECRET_TOKEN, {expiresIn : '1h'}, (err, token) => {
                                if( err ){
                                    res.statusMessage = "Something went wrong with generating the token";
                                    return res.status( 400 ).end();
                                }
                                return res.status(200).json({ token });
                            })
                            //return res.status( 200 ).json( user );
                        }else {
                            throw new Error("Invalid credentials");
                        }
                    })
                    .catch( err => {
                        res.statusMessage = err.message;
                        return res.status( 402 ).end();
                    });
            } else {
                throw new Error( "User doesn't exists!" );
            }
        })
        .catch( err => {
            res.statusMessage = err.message;
            return res.status( 500 ).end();
        });
});
//post a new user Register
app.post('/users/register', jsonParser, (req, res) => {
    const {username,email, password} = req.body;
    if( !username || !email||!password){
        res.statusMessage = "One of these parameters is missing in the request";
        return res.status( 406 ).end();
    }
    bcrypt.hash(  password, 10)
        .then( hashedPassword => {
            const newUser={
                username,
                email, 
                password : hashedPassword
            }
            Users
            .createUser(newUser)
            .then(user=>{
                return res.status(201).json(user);
            })
            .catch( err => {
                res.statusMessage = err.message;
                return res.status( 500 ).end();
            });
        });
});
/*
//GET DATA FROM SPECIFIC USER
app.get('/user/:id',(req,res)=>{
    let id=req.params.userOid;
    Users
    .getUserById(id)
    .then(user=>{
        return res.status(200).json(user);
    })
    .catch( err => {
        res.statusMessage = err.message;
        return res.status( 500 ).end();
    });
})
*/
//*****************************************POSTS*****************************************
//GET ALL POSTS
app.get( '/posts', ( req, res ) => {
    let header = req.headers.authorization.split(' ')[1];
    console.log(header);
    let {username} = jwt.decode(header);
    console.log(username);
    Posts
        .getAllPosts()
        .then( posts => {
            return res.status( 200 ).json( posts );
        })
        .catch( err => {
            res.statusMessage = err.message;
            return res.status( 500 ).end();
        });
});
//GET POST BY ID
//UNA VEZ PICANDOLE AL POST SOLO DESPLIEGA ESE CON SUS COMENTARIOS
app.get('/postsById/:postId',(req,res) => {
    let id = req.params.postId;
    if( !id ){
        res.statusMessage = "id not sent as params";
        return res.status(406).end(); 
    }
    Posts
        .getPostById(id)
        .then(post=> {
            
            console.log(post);
            return res.status( 200 ).json( post );
        }) 
       
       
           
            //CHECAR SOBRE LOS COMENTARIOS DE CADA POST
    
       
        .catch( err => {
            res.statusMessage = err.message;
            return res.status( 500 ).end();
        });
});
//GET POST BY USER ID 
//EL USUARIO PUEDE VER LOS POSTS QUE HA HECHO
app.get('/postsByUser/:userId',(req,res)=>{
    const id = req.params.userId;
    if( !id ){
        res.statusMessage = "id not sent as params";
        return res.status(406).end(); 
    }
    Posts
        .getPostByUser(id)
        .then(posts=>{
            return res.status( 200 ).json( posts );
        })
        .catch( err => {
            res.statusMessage = err.message;
            return res.status( 500 ).end();
        });
})

/* app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
    const file = req.file
    if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }
      res.send(file)
  }) */

//ADD POST
app.post('/newPost',jsonParser,(req,res)=>{
    //CHECAR QUE ONDA CON COMMENTS Y USER QUE SON REFERENCIADOS
    //primero checar que el usuario que quiere crear el post existe!
    //const id = req.params._id;
    // tener una funcion getUserById --> si esa funcion retorna existosamente hacer el create del post
    // si no retornar un
    let header = req.headers.authorization.split(' ')[1];
    let {userOid} = jwt.decode(header);
    console.log(userOid);
    const {title,image,comments} = req.body;
    if( !title||!image ||!userOid ){
        res.statusMessage = "One of these parameters is missing in the request";
        return res.status( 406 ).end();
    }

    const newPost={title,image,comments,userOid};

    Posts
        .addPost(newPost)
        .then(post=>{
            return res.status(201).json(post);
        })
        .catch( err => {
            res.statusMessage = err.message;
            return res.status( 500 ).end();
        });

});
// DELETE POST BY ID
// in case a post is deleted it must be removed from the likes and comments should be wiped
app.delete( '/deletePost/:id', (req, res) => {
    let id = req.params.id;
    // first delete comments
    /* Posts
        .deleteComments(id)
        .then( post => {
            if( post.errmsg ){
                res.statusMessage = "That id was not found in the list of posts";
                return res.status( 404 ).end();
            }
                return res.status( 200 ).json( post );
        })
        .catch( err => {
            res.statusMessage = "Something is wrong with the Database";
            console.log("1 " + err);
            return res.status( 500 ).end();
        }); */
    // then remove from likedPosts
    /* Likes
        .delLikedPostById(id)
        .then( likedPost => {
            if( likedPost.errmsg ){
                res.statusMessage = "That id was not found in the list of posts";
                return res.status( 404 ).end();
            }
                return res.status( 200 ).json( likedPost );
        })
        .catch( err => {
            res.statusMessage = "Something is wrong with the Database";
            console.log("2 " + err);
            return res.status( 500 ).end();
        }); */
    // then delete post
    Posts
        .delPostById( id )
        .then( post => {
            if( post.errmsg ){
                res.statusMessage = "That id was not found in the list of posts";
                return res.status( 404 ).end();
            }
                return res.status( 200 ).json( post );
        })
        .catch( err => {
            res.statusMessage = "Something is wrong with the Database";
            return res.status( 500 ).end();
        });
});
// PATCH Title of Post By id
app.patch('/updatePost/:id', jsonParser, (req, res) => {
    const {_id, title} = req.body;
    const psid = req.params.id;
    if(!_id){
        res.statusMessage = "ID is not sent in the request";
        return res.status( 406 ).end();
    }
    if(_id !== psid){
        res.statusMessage = "Request ID doesnt match ID";
        return res.status( 409 ).end();
    }
    Posts
        .patchPostById(psid, title)
        .then( post => {
            if( post.errmsg ){
                res.statusMessage = "No post for the ID requested";
                return res.status( 404 ).end();
            }
                return res.status( 202 ).json( post );
        })
        .catch( err => {
            console.log( err );
            res.statusMessage = "Something is wrong with the database";
            return res.status( 500 ).end();
        })

})
//**************************Likes********************************
// Get all likes by user
app.get('/getLikesByUser/:userId', (req, res) => {
    const id = req.params.userId;
    if( !id ){
        res.statusMessage = "id not sent as params";
        return res.status(406).end(); 
    }
    Likes
        .getAllLikedPostsByUser(id)
        .then(posts=>{
            return res.status( 200 ).json( posts );
        })
        .catch( err => {
            res.statusMessage = err.message;
            return res.status( 500 ).end();
        });
});

// Add a post to your like section
app.post('/newLike', jsonParser, (req, res) => {
    const {userOid, postOid, liked} = req.body;
    
    const newLike = {userOid,postOid, liked};

    Likes
        .createLikedPost( newLike )
        .then(like => {
            return res.status(201).json(like);
        })
        .catch( err => {
            res.statusMessage = err.message;
            return res.status( 500 ).end();
        });
    
});

// **************************COMMENTS************************************
app.post('/newComment', jsonParser, (req, res) => {
    const {content, userOid, postOid} = req.body;
    const newComment = {content, userOid, postOid};

    Comments
        .addComment(newComment)
        .then(c => {
            return c;
        })
        .then(cJson => {
            Posts
                .updateComments(postOid, cJson._id)
                .then(updatedPost => {
                    return res.status(201).json(updatedPost);
                });
        })
        .catch( err => {
            res.statusMessage = err.message;
            return res.status( 500 ).end()
        });

    
});

app.get('/getCommentsByUserId/:userId', (req, res) => {
    let header = req.headers.authorization.split(' ')[1];
    console.log(header);
    let {userOid} = jwt.decode(header);
    console.log(userOid);
    //const id = req.params.userId;
    if( !userOid ){
        res.statusMessage = "id not sent as params";
        return res.status(406).end(); 
    }
    Comments
        .getAllCommentsByUserId(userOid)
        .then(comments=>{
            return res.status( 200 ).json( comments );
        })
        .catch( err => {
            res.statusMessage = err.message;
            return res.status( 500 ).end();
        });
});
// GET ALl Comments
app.get('/getAllComments', (req, res) => {
    Comments
        .getAllComments()
        .then( comments => {
            return res.status( 200 ).json( comments );
        })
        .catch( err => {
            res.statusMessage = err.message;
            return res.status( 500 ).end();
        })
})
// DELETE Comment by id
app.delete('/deleteComment/:id', (req, res) => {
    let id = req.params.id;
    Comments
        .delCommentById( id )
        .then( comment => {
            if(comment.errmsg ){
                res.statusMessage = "That id was not found in the list of comments";
                return res.status( 404 ).end();
            }
                return res.status( 200 ).json( comment );
        })
        .catch( err => {
            res.statusMessage = "Something is wrong with the database";
            return res.status( 500 ).end();
        })
});
// Update comment by id  post <----> comment
app.patch('/updateComment/:id', jsonParser, (req, res) => {
    const {_id, content} = req.body;
    const psid = req.params.id;
    if(!_id){
        res.statusMessage = "ID is not sent in request";
        return res.status( 406 ).end();
    }
    if(_id !== psid){
        res.statusMessage = "Request ID doesnt match ID";
        return res.status( 409 ).end();
    }
    Comments
        .patchCommentById( psid, content )
        .then( comment => {
            if( comment.errmsg ){
                res.statusMessage = "No comment for ID requested";
                return res.status( 404 ).end();
            }
                return res.status( 202 ).json( comment );
        })
        .catch( err => {
            res.statusMessage = "Something is wrong with the database";
            return res.status( 500 ).end();
        })
});

app.listen( PORT, () => {
    console.log( `This server is running on port ${PORT}` );

    new Promise( ( resolve, reject ) => {

        const settings = {
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
            useCreateIndex: true
        };
        mongoose.connect( DATABASE_URL, settings, ( err ) => {
            if( err ){
                return reject( err );
            }
            else{
                console.log( "Database connected successfully." );
                return resolve();
            }
        })
    })
    .catch( err => {
        console.log( err );
    });
});