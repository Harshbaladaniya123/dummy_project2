var express = require('express');
var router = express.Router();
var auth_module = require('../Auth/auth_modules');
var common =  require('../../../config/common');
var middleware = require('../../../middleware/validation');




//login
router.get('/login',function(req,res){
   
    //digits how to valid ???
    const rules = { emailPhone : 'required' , password : 'required' };
    
    const message = { required : 'Please enter :attr'   }    


    if(middleware.checkValidationRules(req.body,res,rules,message))
    {
        auth_module.login(req.body,function(code,message,data){
            common.send_response(req.body,res,code,message,data);
        });
    }
    
});




//signup
router.post('/signup',function(req,res){
   
    const rules = {
        first_name : 'required',
        email : 'required|email',
        password : 'required',
        mobile_number : 'required|digits:10',
        date_of_birth : 'required|date',
        gender : 'required',
        location : 'required',
        longitude : 'required',
        lattitude : 'required'
    };
    
    const message = {
        required : 'Please enter :attr',
        email : 'Please enter a valid :attr',
        date : 'Please enter a valid :attr',
        digits : 'Please enter a valid :attr'
    }    


    if(middleware.checkValidationRules(req.body,res,rules,message))
    {
        auth_module.addUser(req.body,function(code,message,data){
            common.send_response(req.body,res,code,message,data);
        });
    }
    
});




//homescreen banner
router.get('/homescreen-banner',(req,res)=>{
    auth_module.bannerListing(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});



//homescreen api
router.get('/homescreen-user',(req,res)=>{
    auth_module.userDetails(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});


//homescreen categories
router.get('/homescreen-categories',(req,res)=>{
    auth_module.categoriesDetail(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});



//homescreen merchant listing
router.get('/homescreen-merchant-listing',(req,res)=>{
    auth_module.merchantListing(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});



//homescreen trending service providers
router.get('/homescreen-merchant-listing',(req,res)=>{
    auth_module.trendingServiceProviders(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});



//searching filter
router.get('/search-filter',(req,res)=>{
    auth_module.searchFilter(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});



//particular merchant details
router.get('/merchant-details',(req,res)=>{
    auth_module.particularMerchantDetails(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});



//vouchers listing
router.get('/vouchers-details',(req,res)=>{
    auth_module.vouchersListing(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});



//merchant contact details
router.get('/merchant-contact-details',(req,res)=>{
    auth_module.merchantContactDetails(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});



//merchant ratings and review
router.get('/merchant-ratings-review',(req,res)=>{
    auth_module.merchantRatingReview(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});



//rate merchant
router.post('/merchant-insert-rating',(req,res)=>{
    auth_module.rateMercahant(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});




//voucher liking- unliking merchant
router.post('/voucher-like-unlike',(req,res)=>{
    auth_module.voucherLikeUnlike(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});




//merchant liking- unliking
router.post('/merchant-like-unlike',(req,res)=>{
    auth_module.merchantLikeUnlike(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});




//merchant likind listing
router.get('/merchant-liked-listing',(req,res)=>{
    auth_module.merchantLikedDetails(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});



//voucher liked listing
router.get('/voucher-liked-listing',(req,res)=>{
    auth_module.voucherLikedDetails(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});



router.post('/contact-us',(req,res)=>{

    const rules = { userId : 'required' , subject : 'required' , description : 'required' };
    
    const message = { required : 'Please enter :attr'   }    


    if(middleware.checkValidationRules(req.body,res,rules,message))
    {
        auth_module.contactDetails(req.body,function(code,message,data){
            common.send_response(req.body,res,code,message,data);
        });
    }

});




router.post('/update-profile',function(req,res){
   
    const rules = {
        first_name : 'required',
        date_of_birth : 'required|date',
        gender : 'required',
        location : 'required',
        longitude : 'required',
        lattitude : 'required'
    };
    
    const message = {
        required : 'Please enter :attr',
        date : 'Please enter a valid :attr',
    }    


    if(middleware.checkValidationRules(req.body,res,rules,message))
    {
        auth_module.updateProfile(req.body,function(code,message,data){
            common.send_response(req.body,res,code,message,data);
        });
    }
    
});




//voucher details
router.post('/voucher-details',(req,res)=>{
    auth_module.voucherDetails(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});




//contact us
router.post('/delete-user-account',(req,res)=>{
    auth_module.deleteUserAccount(req.body,function(code,message,data){
        common.send_response(req.body,res,code,message,data);
    });
});







module.exports = router;