let { Response } = require('./responseHandler')
let jwt = require("jsonwebtoken")
let users = require('../schemas/users')
//hi
module.exports = {
    Authentication: async function (req, res, next) {
        let token = req.headers.authorization ? req.headers.authorization : req.cookies.token;
        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1];
            if (jwt.verify(token, "NNPTUD")) {
                if (jwt.decode(token).exp < Date.now()) {
                    Response(res, 403, false, "user chua dang nhap");
                } else {
                    let userId = jwt.decode(token)._id;
                    req.userId = userId;
                    next();
                }
            } else {
                Response(res, 403, false, "user chua dang nhap");
            }
        } else {
            Response(res, 403, false, "user chua dang nhap");
        }
    },
    Authorization: function (...roleRequire) {
        return async function (req, res, next) {
            let userId = req.userId;
            let user = await users.findById(userId).populate({
                path: 'role',
                select: 'name'
            });
            let role = user.role.name;
            if(roleRequire.includes(role)){
                next();
            }else{
                Response(res, 403, false, "ban khong du quyen");
            }
        }
    }
}