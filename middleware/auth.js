import { SECRET_TOKEN } from "../config"

function auth(req, res, next){
    let header = req.header.authorization.split(' ')[1];
    jwt.verify(header, SECRET_TOKEN, function( err, decoded) {
        if(err){
            res.statusMessage = "The authorization TOKEN is invalid"
            return res.status(401).end();
        }
    })
    next();
}