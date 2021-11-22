module.exports = (req, res, next)=>{
    if(req.user.verification.verified){
        next();
    }else{
        res.send('User not verified.');
    }
};