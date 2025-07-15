var conn = require('../config/database');
var constant = require('../config/constant');


var common = {

    send_response : function(req,res,code,message,data) {
        responseData = { code : code , message : message , data : data };
        res.status(200).send(responseData);
    },

    getUserDetails : (userId,callback)=>{
    
        conn.query('SELECT * FROM tbl_user WHERE id = ? AND is_delete = 0',[userId],(error,result)=>{
            if( !error && result.length > 0 ) 
            { callback(result[0]); }
        })
    },

    device_details : (device_data,callback)=>{
              console.log(device_data);
    },

    checkEmail : (email)=>{
        
        var mailformat = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/g

        if( mailformat.test(email) ){ return true; }
        else{ return false; }
    },


    checkPhone : (phone)=>{
        
        var phoneformat = /[0-9]{10}/g

        if( phoneformat.test(phone) ){ return true; }
        else{ return false; }
    },


    emailIsUsed : (email,callback) => {

        conn.query('SELECT * FROM tbl_user AS u WHERE u.is_delete = 0 AND u.is_active = 1 AND u.email = ?',[email],(error,result)=>{
            if(error){ console.log(error); return false; }
            else{ if(result.length > 0){ return true; } else{ return false; } }
        });

    },


    phoneIsUsed : (phone_number,callback) => {

        conn.query('SELECT * FROM tbl_user AS u WHERE u.is_delete = 0 AND u.is_active = 1 AND u.mobile_number = ?',[phone_number],(error,result)=>{
            if(error){  console.log(error); return false; }
            else{ if(result.length > 0){ return true; } else{ return false; } }
        });

    },


    dobIsValid : (dob) =>{
        var rex = /^\d{4}-\d{2}-\d{2}$/;
        return rex.test(dob);
    },


    merchantRatingExist : (userId,merchantId,callback) => {

        conn.query('SELECT * FROM tbl_merchant_ratings AS mr WHERE mr.is_active = 1 AND mr.user_id = ? AND mr.merchant_id = ?',[userId,merchantId],(error,result)=>{
            if(error){  console.log(error); return false; }
            else{ if(result.length > 0){ callback(true) } else{ callback(false) } }
        });
    
    },



    getRatingDetails : (insertId,callback)=>{
    
        conn.query('SELECT * FROM tbl_merchant_ratings WHERE id = ?',[insertId],(error,result)=>{
            if( !error && result.length > 0 ) 
            { callback(result[0]); }
        })
    },


    getVoucherLikeDetails :  (insertId,callback)=>{
    
        conn.query('SELECT * FROM tbl_voucher_like WHERE id = ?',[insertId],(error,result)=>{
            if( !error && result.length > 0 ) 
            { callback(result[0]); }
        })
    },



    getMerchantLikeDetails :  (insertId,callback)=>{
    
        conn.query('SELECT * FROM tbl_merchant_likes WHERE id = ?',[insertId],(error,result)=>{
            if( !error && result.length > 0 ) 
            { callback(result[0]); }
        })
    },


}


module.exports = common;