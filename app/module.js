module.exports = {
	loginM : function(req, res, next){
	    if (req.isAuthenticated())
	        return next();
	    res.redirect('/');
	}
};
return module.exports;