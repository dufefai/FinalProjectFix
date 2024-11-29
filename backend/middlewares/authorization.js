const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

const authorization ={
    verifyToken : (req, res, next) => {
        const token = req.headers.token;
        if(token){
            const accessToken = token.split(" ")[1];
            jwt.verify(accessToken, process.env.ACCESS_KEY,(error, user)=>{
                if(error){
                    return res.status(403).json("Token is not valid");
                }
                req.user = user;
                next();
            })
        }
        else{
            return res.status(401).json("You are not authenticated");
        }
    },
    verifyAdmin : (req, res, next)=>{
        authorization.verifyToken(req, res , ()=> {
            if(req.user.role == "admin"){
                next();
            }
            else{
                return res.status(403).json("You don't have permission");
            }
        })
    }
}

module.exports = authorization;