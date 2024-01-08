const jwt = require('jsonwebtoken');
const secretKey = 'mysecretkey'; // replace with your secret key

function AuthMiddleware(req, res, next) {
    var authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        // check if the header starts with "Bearer " prefix
        const token = authHeader.split(' ')[1]; // split the header and get the token part
        authHeader = token;
    }   
    jwt.verify(req.headers.authorization, process.env.KEY, (error, data) => {
        if (error) {
            return res.status(400).send({ message: "invalid token" })
        }

        else {
            console.log("data",data)
            req.body.userID = data.id;
            req.headers.userID = data.id
            console.log("Req.headers",req.headers)
            next();
        }
    })
}

// function AuthMiddleware(req, res, next) {
//     console.log("req", req.headers)
//     var authHeader = req.headers.authorization;
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//         // check if the header starts with "Bearer " prefix
//         const token = authHeader.split(' ')[1]; // split the header and get the token part
//         jwt.verify(token, process.env.KEY, (error, data) => {
//             if (error) {
//                 return res.status(400).send({ message: "invalid token" });
//             } else {
//                 console.log("data", data);
//                 req.body.userID = data.id;
//                 next();
//             }
//         });
//     } else {
//         return res.status(401).send({ message: "Unauthorized" });
//     }
// }


module.exports = AuthMiddleware;
