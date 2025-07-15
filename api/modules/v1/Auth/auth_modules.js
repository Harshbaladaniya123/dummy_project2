var common = require('../../../config/common');
var conn = require('../../../config/database');
var constant = require('../../../config/constant');
var md5 = require('md5');
var asyncLoop = require("node-async-loop")

var Auth = 
{

    //for login
     login: function(request,callback){
         if(request.login_type == 's' || request.login_type == ''|| request.login_type == undefined){
            var login = "select * from tbl_user where (email=? or password=?) and is_active=1 and is_delete=0";

            var condition = [request.emailPhone,md5(request.password)]
         } else {
            var login =`select * from tbl_user where social_id = ? and login_type = ? and is_active=1 and is_delete=0;`

            var condition = [request.social_id,request.login_type];
}

          conn.query(login,condition,function(error,userinfo){
            if(error){
                callback('0','Oops,something went wrong in a login',error);
            }
            else{
                if(userinfo.length>0){
                    var user = userinfo[0];

                    if(user.step_completed == 3){
                        var device_data = {
                           "user_id": user.id,
                           "token"  : commom.generateToken(),
                           "device_type" : request.device_type,
                           "device_token" : request.device_token,
                           "uuid" : request.uuid,
                           "os_version" : request.os_version,
                           "device_name" : request.device_name,
                           "model_name" : request.model_name,
                           "ip" : request.ip
}

                        common.device_details(device_data,function(response){
                            if(response==true){
                                common.getUserDetails(user.id,function(response){
                                    callback('1','login sucessfull',response)
                                })
                            }else{
                                callback('0','login failed',{})
                            }
                        })
                    }  else{
                        if(user_is_verified == 1){
                          callback('5','personal info completed yet',{})
                            } else{
                          callback('4','account is not verified yet',{})
                            }
                         }
                } else{
                    callback('2','invalid credentials',userinfo)
                }
            }
          })
     },


    addUser: function (requestData, callback) 
    {
    
    common.emailIsUsed(requestData.email, (result)=> {
      if(result){
        callback("0", "Email is already in use !!", []);
      }
      else {
       common.phoneIsUsed(requestData.mobile_number,(result)=> {
        if(result){
         callback("0", "Phone number is already in use !!", []);
        } else {
            if (!common.dobIsValid(requestData.date_of_birth)) {
              callback("0", "Date of Birth is not valid !!", []);
            } else {

            var insertObj = {
              name: requestData.name,
              email: requestData.email,
              profile_image:   requestData.profile_image == undefined ? "" : requestData.profile_image,
              password: md5(requestData.password),
              location: requestData.location,
              lattitude: requestData.lattitude,
              longitude: requestData.longitude,
              interest_id:requestData.interest_id == undefined  ? "" : requestData.interest_id,
              date_of_birth: requestData.date_of_birth,
              gender: requestData.gender,
              mobile_number: requestData.mobile_number,
              
            };


            var deviceInfo = {
              token : requestData.token,
              device_type : requestData.device_type,
              device_token : requestData.device_token,
              os_version : requestData.os_version,
              device_name : requestData.device_name,
              model_name : requestData.model_name,
              ip : requestData.ip
          }
      
          conn.query("select * from tbl_user where email = ? or mobile_number = ?",[requestData.email,requestData.mobile_number], (error,result) => {
              if (error) {  callback("0", "Something went wrong !!", error);  }
              else {

                if(result.length<1)
                {
                  conn.query( "INSERT INTO tbl_user SET ?",[insertObj], (error, result) => {
                      if (error) { callback("0", "Something went wrong !!", error); }
                      else
                      {
                        if (result.affectedRows > 0) 
                        {
                            Auth.addDeviceInfo(result.insertId, deviceInfo, (deviceInfo) => {
                            common.getUserDetails(result.insertId, (userInfo) => {
                              callback("1", "Data Added", userInfo);
                          
                              });
        
                          });
                    }
                  }
                }
              );
            }
            else{
              callback("0", "User Already Exist", []);
            }
          }
        }); 
          
        }
      }
    });
  }});
  },
  

    addDeviceInfo : (user_id, deviceInfo, callback) => {
      console.log(user_id);
      // console.log(deviceInfo);
      var checkDevice = 
      `SELECT * FROM tbl_user_device WHERE user_id = ${user_id}`
      conn.query(checkDevice, (error, deviceFound) => {
          if(error) {
              callback("0", "Something Went Wrong", null);
          }
          else {
              if(deviceFound.length > 0) {
                  conn.query(`UPDATE tbl_user_device SET ? WHERE user_id = ${user_id}`, [deviceInfo], (error, result) => {
                      if(error) {
                          callback("0", "Error", null);
                      } 
                      else {
                          callback("1", "Device Info updated Successfully", result);
                      }
                  });
              }
              else {
                  deviceInfo.user_id = user_id;
                  conn.query(`INSERT INTO tbl_user_device SET ?`, [deviceInfo], (error, result) => {
                      if(error) {
                          callback("0", "Error", null);
                      }
                      else {
                          callback("1", "New Device Inserted", result);
                      }
                  });
              }
          }
      });
    },


    //for insertion of the data
   /* addUser : function(requestData,callback)
    {

        if( common.emailIsUsed(requestData.email) )
        {  callback('0','Email is already in use !!',[]);  }
        else
        { 
            if( common.phoneIsUsed(requestData.mobile_number) ) { callback('0','Mobile Number is already in use !!',[]); }
            else
            {
                if( !common.dobIsValid(requestData.date_of_birth) ) { callback('0','Date of Birth is not valid !!',[]); }
                else
                {
                    var insertObj = {
                        first_name : requestData.first_name,
                        last_name : ( requestData.last_name == undefined ) ? '' : requestData.last_name,
                        email : requestData.email,
                        profile_image : ( requestData.profile_image == undefined ) ? '' : requestData.profile_image,
                        password : md5(requestData.password),
                        location : requestData.location,
                        lattitude : requestData.lattitude,
                        longitude : requestData.longitude,
                        interest_id : ( requestData.interest_id == undefined ) ? '' : requestData.interest_id,
                        date_of_birth : requestData.date_of_birth,
                        gender : requestData.gender,
                        mobile_number : requestData.mobile_number
                    };
            
                    conn.query('INSERT INTO tbl_user SET ?',[insertObj],(error,result)=>{
            
                        if(error){ callback('0','Something went wrong !!',error); }
                        else{ 
                            if(result.affectedRows > 0){ 
                                
                                common.getUserDetails(result.insertId,(userInfo)=>{
                                    callback('1','Data Added',userInfo);
                                });
                            }
                        }
                    });
                }
            }
        }
    }, */


    userDetails : (requestData,callback) =>{

       common.getUserDetails(requestData.userId,(result)=>{
            callback('1','Success',result);
       });

    },

    
    categoriesDetail : (requestData,callback) =>{

        conn.query('SELECT * FROM tbl_categories AS c WHERE c.is_active = 1',(error,result)=>{
            if(error){ callback('0','Something went wrong !!',error); }
            else{ if(result.length > 0){ callback('1','Success',result); }else{ callback('2','Data Not Found',[]); }  }
        });
 
    },



    bannerListing : (requestData,callback) =>{

        conn.query('SELECT * FROM tbl_banner AS b WHERE b.is_active = 1',(error,result)=>{
            if(error){ callback('0','Something went wrong !!',error); }
            else{ if(result.length > 0){ callback('1','Success',result); }else{ callback('2','Data Not Found',[]); }  }
        });
 
    },




    searchFilter : (requestData,callback) =>{

        if(requestData.categoryName != undefined)
        {
            conn.query(`SELECT c.name FROM tbl_categories AS c WHERE c.name like '%${requestData.categoryName}%' `,[requestData.categoryName],(error,result)=>{
                if(error){ callback('0','Something went wrong !!',error); }
                else{ if(result.length > 0){ callback('1','Success',result); }else{ callback('2','Data Not Found','Opps We cant find what you are looking for.Please try another keyword. '); }  }
            });
        }
        else if(requestData.merchantName != undefined)
        { 
            conn.query(`SELECT m.name FROM tbl_merchants AS m WHERE m.name like '%${requestData.merchantName}%' `,(error,result)=>{
                if(error){ callback('0','Something went wrong !!',error); }
                else{ if(result.length > 0){ callback('1','Success',result); }else{ callback('2','Data Not Found','Opps We cant find what you are looking for.Please try another keyword. '); }  }
            });
        }
    
    },


    trendingServiceProviders : (requestData,callback) =>{

        conn.query(`
            SELECT m.*,
            ( SELECT  ROUND ( ( 6371 * acos( cos( radians(u.lattitude) ) 
                        * cos( radians( m.lattitude ) ) 
                        * cos( radians( m.longitude ) - radians(u.longitude) ) 
                        + sin( radians(u.lattitude) ) 
                        * sin( radians( m.lattitude ) ) ) ) , 1 )
            FROM tbl_user AS u WHERE u.is_delete = 0 AND u.is_active = 1 AND u.id = ?  ) AS distance,
            IFNULL( ( SELECT CASE WHEN l.merchant_id = m.id THEN 1 END FROM tbl_merchant_likes AS l WHERE l.merchant_id = m.id AND l.user_id = ? AND l.is_active = 1  ) , 0 ) AS is_like
            FROM tbl_merchants AS m WHERE m.is_active = 1 AND m.is_delete = 0 ORDER BY m.avg_rating ;`,[requestData.userId,requestData.userId],(error,result)=>{
            if(error){ callback('0','Something went wrong !!',error); }
            else{ if(result.length > 0){ callback('1','Success',result); }else{ callback('2','Data Not Found',[]); }  }
        
        });

    },
    

    merchantListing : (requestData,callback) =>{


        if (requestData != undefined) {
            
            var data = 
            {
                avgRating : (requestData.avgRating != undefined) ? requestData.avgRating : [],
                nearby : (requestData.categoriesId != undefined) ? requestData.categoriesId : [],
                categories : (requestData.categoriesId != undefined) ? requestData.categoriesId : [],
                amenities : (requestData.amenitiesId != undefined) ? requestData.amenitiesId : [],
                minDistance : (requestData.minDistance != undefined && requestData.minDistance != null ) ? requestData.min_dis : 0,
                maxDistance : (requestData.maxDistance != undefined && requestData.maxDistance != null ) ? requestData.max_dis : 200,
            }

            var categoriesId = "";
            var categoriesQuery = ""
            var amentiesId = "";
            var amenitiesQuery = "";
            var nearbyQuery = "";
            var avgRatingQuery = "";


            if (data.categories.length > 0) {
                data.categories.forEach((element)=>{ categoriesId += element + "|"; })
                categoriesQuery = `AND CONCAT(",", m.category_id, ",") REGEXP ",(${categoriesId} ),"`
            }

            if (data.amenities.length > 0) {
                data.amenities.forEach((element) => { amentiesId += element + "|"; })
                amenitiesQuery = `AND CONCAT("," , m.amenties_id, ",") REGEXP ",(${ amentiesId } ),"`
            }

            var distanceQuery = "";
            var condition = [];


            if ((requestData.minDistance != undefined && requestData.minDistance != null) || (requestData.maxDistance != undefined && requestData.maxDistance != null)) {
                distanceQuery = "HAVING distance BETWEEN ? AND ?";
                condition.push(data.minDistance, data.maxDistance);
            }



            if ((requestData.minDistance != undefined && requestData.minDistance != null) && (requestData.maxDistance != undefined && requestData.maxDistance != null) && data.nearby == 1 ) {
                distanceQuery = "HAVING distance < 10";
                condition.push(data.minDistance, data.maxDistance);
            }


            if( data.avgRating == 1 )
            {
                avgRatingQuery = "ORDER BY m.avg_rating";
            }


            var query = `SELECT *,
                (SELECT 
                    ROUND( ( 6371 * acos( cos( radians(u.lattitude) ) 
                        * cos( radians( m.lattitude ) ) 
                        * cos( radians( m.longitude ) - radians(u.longitude) ) 
                        + sin( radians(u.lattitude) ) 
                        * sin( radians( m.lattitude ) ) ) ),1) AS distance from tbl_user AS u where u.id = ${requestData.userId} ) as distance,
                    IFNULL((SELECT (CASE WHEN l.merchant_id is NOT NULL THEN 1 ELSE 0 end) from tbl_merchant_likes l WHERE l.user_id = ${requestData.userId} and l.merchant_id = m.id),0) as is_like  
                from tbl_merchants m 
                WHERE m.is_active = 1 and m.is_delete = 0 ${categoriesQuery} ${amenitiesQuery} ${distanceQuery} ${avgRatingQuery}
            `;


            console.log(query);
            conn.query(query,condition,(error,result)=>{
                if(error){ callback('0','Something went wrong !!',error); }
                else
                {
                    if(result.length > 0)
                    {
                        asyncLoop( result,(items,next)=>{

                            conn.query(`SELECT * FROM tbl_categories AS c WHERE c.is_active = 1 AND FIND_IN_SET(c.id,?)`,[items.category_id],(error,results)=>{
                                if(error){ callback('0','Something went wrong !!',error); }
                                else{ items.categories = results; }
                            });


                            conn.query(`SELECT * FROM tbl_amenties AS a WHERE a.is_active = 1 AND FIND_IN_SET(a.id,?)`,[items.amenties_id],(error,results)=>{
                                if(error){ callback('0','Something went wrong !!',error); }
                                else{ items.categories = results; next(); }
                            });


                        },(error)=>{ if(error){ callback('0','Something went wrong !!',error); } else{ callback('1','Success',result);  } });
                    }
                    else{ callback('0','Something went wrong !!',error); }
                }
            });



            
        }
    },



    /* particularMerchantDetails : (requestData,callback)=>{


        conn.query(`
            SELECT m.* , GROUP_CONCAT(mi.image) AS gallery  ,
            ( SELECT GROUP_CONCAT(a.name,' -- ',a.image) FROM tbl_amenties AS a WHERE a.is_active = 1 AND FIND_IN_SET(a.id,m.amenties_id) ) AS amenties, 
            ( SELECT ROUND ( ( 6371 * acos( cos( radians(u.lattitude) ) 
                                        * cos( radians( m.lattitude ) ) 
                                        * cos( radians( m.longitude ) - radians(u.longitude) ) 
                                        + sin( radians(u.lattitude) ) 
                                        * sin( radians( m.lattitude ) ) ) ) , 1 )
            FROM tbl_user AS u WHERE u.is_delete = 0 AND u.is_active = 1 AND u.id = ? ) AS distance,
            IFNULL( ( SELECT CASE WHEN l.merchant_id = m.id THEN 1 END FROM tbl_merchant_likes AS l WHERE l.merchant_id = m.id AND l.user_id = ? AND l.is_active = 1  ) , 0 ) AS is_like
            FROM tbl_merchants AS m
            JOIN tbl_merchant_images AS mi ON mi.merchant_id = m.id
            WHERE m.is_active = 1 AND m.is_delete = 0 AND m.id = ?
            GROUP BY m.id;`,[requestData.userId,requestData.userId,requestData.merchantId],(error,result)=>{
            if(error){ callback('0','Something went wrong !!',error); }
            else{ if(result.length > 0){ callback('1','Success',result); }else{ callback('2','Data Not Found',[]); }  }
            
        });


    },*/

    particularMerchantDetails: (requestData, callback) => {


        var query = "";
        var condition = "";
    
        query = ` SELECT m.* , GROUP_CONCAT(mi.image) AS gallery  ,
        ( SELECT GROUP_CONCAT(a.name,' -- ',a.image) FROM tbl_amenties AS a WHERE a.is_active = 1 AND FIND_IN_SET(a.id,m.amenties_id) ) AS amenties, 
        ( SELECT ROUND ( ( 6371 * acos( cos( radians(u.lattitude) ) 
                                    * cos( radians( m.lattitude ) ) 
                                    * cos( radians( m.longitude ) - radians(u.longitude) ) 
                                    + sin( radians(u.lattitude) ) 
                                    * sin( radians( m.lattitude ) ) ) ) , 1 )
        FROM tbl_user AS u WHERE u.is_delete = 0 AND u.is_active = 1 AND u.id = ? ) AS distance,
        IFNULL( ( SELECT CASE WHEN l.merchant_id = m.id THEN 1 END FROM tbl_merchant_likes AS l WHERE l.merchant_id = m.id AND l.user_id = ? AND l.is_active = 1  ) , 0 ) AS is_like
        FROM tbl_merchants AS m
        JOIN tbl_merchant_images AS mi ON mi.merchant_id = m.id
        WHERE m.is_active = 1 AND m.is_delete = 0 AND m.id = ?
        GROUP BY m.id;`, condition = [requestData.userId, requestData.userId, requestData.merchantId];
    
        conn.query(query, condition, function (error, result) {
            if (error) {
                callback("0", "Filed to display data", error);
            } else {
                if(result.length > 0){
                    asyncLoop(result, function(item, next){ 
                        conn.query(`select * from tbl_amenties ta where FIND_IN_SET(ta.id,"${item.amenties_id}")`,function(error,result){
                            if (error) {
                                callback("0", "Error", error)
                            } else {
                                if(result.length > 0){
                                    var arr = [];
                                    result.forEach((ele) => {                                        
                                        var obj = {
                                            name : ele.name,
                                            img : ele.image
                                        }
                                    arr.push(obj);
                                    });
                                    item.amenities =  arr;
                                    next();
                                }else{
                                    next();
                                }
                            }
                        });
                    },function(error){
                        if (error) {
                            callback("0", "Failed to fetch", error)
                        } else {
                            callback("1", "Aminities data", result);
                        }
                    });
                }
            }
        });
    },



    vouchersListing : (requestData,callback) => {

        conn.query(`
            SELECT v.*,
            IFNULL( ( SELECT CASE WHEN  l.voucher_id = v.id THEN 1 END FROM tbl_voucher_like AS l WHERE l.is_active = 1 AND l.user_id = 1 AND l.voucher_id = v.id ) , 0 ) AS is_like,
            IFNULL( (SELECT CASE WHEN r.voucher_id = v.id THEN 1 END FROM tbl_voucher_redeemed AS r WHERE r.voucher_id = v.id AND r.user_id = 1 ) , 0 ) AS is_redeemed,
            ( SELECT CASE WHEN v.expiry_date >= CURRENT_DATE THEN 0 ELSE 1 END FROM tbl_voucher AS vr WHERE vr.is_active = 1 AND vr.id = v.id ) AS is_expired
            FROM tbl_voucher AS v 
            WHERE v.is_active = 1  AND v.merchant_id = 1;`,[requestData.userId,requestData.userId,requestData.merchantId],(error,result)=>{
            if(error){ callback('0','Something went wrong !!',error); }
            else{ if(result.length > 0){ callback('1','Success',result); }else{ callback('2','Data Not Found',[]); }  }
            
        });

    },


    merchantContactDetails : (requestData,callback) => {

        conn.query(`
            SELECT m.email,m.mobile_number,m.location,m.lattitude,m.longitude FROM tbl_merchants AS m WHERE m.is_active = 1 AND m.is_delete = 0 AND m.id = ?;`,
            [requestData.merchantId],(error,result)=>{
            if(error){ callback('0','Something went wrong !!',error); }
            else{ if(result.length > 0){ callback('1','Success',result); }else{ callback('2','Data Not Found',[]); }  }
            
        });

    },


    merchantRatingReview : (requestData,callback) => {

        conn.query(`
            SELECT mr.* , u.*, DATE_FORMAT(mr.created_at,'%d %M') AS posted_date
            FROM tbl_merchant_ratings AS mr
            JOIN tbl_user AS u ON u.id = mr.user_id
            WHERE mr.is_active = 1 AND mr.merchant_id = ?`,
            [requestData.merchantId],(error,result)=>{
            if(error){ callback('0','Something went wrong !!',error); }
            else{ if(result.length > 0){ callback('1','Success',result); }else{ callback('2','Data Not Found',[]); }  }
            
        });

    },



    rateMercahant : (requestData,callback) => {

        common.merchantRatingExist(requestData.userId,requestData.merchantId,(result)=>{
            if(!result)
            {
                var obj = { 
                    user_id : requestData.userId , 
                    merchant_id : requestData.merchantId,
                    rating : requestData.rating,
                    review : requestData.review,
                }

                conn.query(`INSERT INTO tbl_merchant_ratings SET ?`,[obj],(error,result)=>{
                    if(error){ callback('0','Something went wrong !!',error); }
                    else{ 
                        if(result.affectedRows > 0){
                            common.getRatingDetails(result.insertId,(ratingInfo)=>{
                                callback('1','Data Added',ratingInfo);
                            });
                        } else{ callback('0','Data Not Inserted',[]);}
                    }
                });
            }
            else{ callback('0','You have already rated',[]) }
        });

    },



    voucherLikeUnlike : (requestData,callback) => { 

        var dataQuery ={
            voucher_id : requestData.voucherId,
            user_id : requestData.userId
        }

        conn.query('SELECT l.* FROM tbl_voucher_like AS l WHERE l.voucher_id = ? AND l.user_id = ?',[requestData.voucherId,requestData.userId],(error,result)=>{
            if(error){ callback('0','Something went wrong !!',error); }
            else{
                if(result==0){
                    conn.query('INSERT INTO tbl_voucher_like SET ?',[dataQuery],(error,result)=>{
                        if(error){ callback('0','Something went wrong !!',error); }
                        else{ if(result.affectedRows > 0){
                            common.getVoucherLikeDetails(result.insertId,(likeInfo)=>{
                                callback('1','Data Added',likeInfo);
                            });
                        } else{ callback('0','Data Not Inserted',[]);} }
                    });
                }
                else{
                    conn.query(`DELETE FROM tbl_voucher_like WHERE tbl_voucher_like.voucher_id = ? AND tbl_voucher_like.user_id = ?;`,[requestData.voucherId,requestData.userId],(error,result)=>{ 
                        if(error){ callback('0','Something went wrong !!',error); }
                        else{ callback('0','Unliked Successfully',error); }
                    })
                }
            }
        });

    },







    merchantLikeUnlike : (requestData,callback) => { 

        var dataQuery ={
            merchant_id : requestData.merchantId,
            user_id : requestData.userId
        }

        conn.query('SELECT l.* FROM tbl_merchant_likes AS l WHERE l.merchant_id = ? AND l.user_id = ?',[requestData.merchantId,requestData.userId],(error,result)=>{
            if(error){ callback('0','Something went wrong !!',error); }
            else{
                if(result==0){
                    conn.query('INSERT INTO tbl_merchant_likes SET ?',[dataQuery],(error,result)=>{
                        if(error){ callback('0','Something went wrong !!',error); }
                        else{ if(result.affectedRows > 0){
                            common.getMerchantLikeDetails(result.insertId,(likeInfo)=>{
                                callback('1','Data Added',likeInfo);
                            });
                        } else{ callback('0','Data Not Inserted',[]);} }
                    });
                }
                else{
                    conn.query(`DELETE FROM tbl_merchant_likes WHERE tbl_merchant_likes.merchant_id = ? AND tbl_merchant_likes.user_id = ?;`,[requestData.merchantId,requestData.userId],(error,result)=>{ 
                        if(error){ callback('0','Something went wrong !!',error); }
                        else{ callback('0','Unliked Successfully',error); }
                    })
                }
            }
        });

    },




    merchantLikedDetails : (requestData,callback) => {

        conn.query(`
            SELECT mr.* , m.*
            FROM tbl_merchant_likes AS mr
            JOIN tbl_merchants AS m ON m.id = mr.merchant_id
            WHERE mr.is_active = 1 AND m.is_active = 1 AND m.is_delete = 0 AND mr.user_id = ?`,
            [requestData.userId],(error,result)=>{
            if(error){ callback('0','Something went wrong !!',error); }
            else{ if(result.length > 0){ callback('1','Success',result); }else{ callback('2','Data Not Found',[]); }  }
            
        });

    },



    voucherLikedDetails : (requestData,callback) => {

        conn.query(`
            SELECT vr.* , v.*
            FROM tbl_voucher_like AS vr
            JOIN tbl_voucher AS v ON v.id = vr.voucher_id
            WHERE vr.is_active = 1 AND v.is_active = 1 AND vr.user_id = ?`,
            [requestData.userId],(error,result)=>{
            if(error){ callback('0','Something went wrong !!',error); }
            else{ if(result.length > 0){ callback('1','Success',result); }else{ callback('2','Data Not Found',[]); }  }
            
        });

    },




    deleteUserAccount : (requestData,callback) => {

        conn.query(`UPDATE tbl_user AS u SET u.is_delete = 1 WHERE u.id = ?  `,[requestData.userId],(error,result)=>{
            if(error){ callback('0','Something went wrong !!',error); }
            else{ if(result.length > 0){ callback('1','Success','Account Deleted Successfully'); }else{ callback('2','Data Not Found',[]); }  }
        });

    },



    contactDetails : (requestData,callback) => {

        var obj = { user_id : requestData.userId , subject : requestData.subject , description : requestData.description };

        conn.query(` INSERT INTO tbl_contact_us SET ?  `,[obj],(error,result)=>{
            if(error){ callback('0','Something went wrong !!',error); }
            else{ if(result.length > 0){ callback('1','Success','Account Deleted Successfully'); }else{ callback('2','Data Not Found',[]); }  }
        });

    },


    updateProfile : function(requestData,callback)
    {

        if( common.emailIsUsed(requestData.email) )
        {  callback('0','Email is already in use !!',[]);  }
        else
        { 
            if( common.phoneIsUsed(requestData.mobile_number) ) { callback('0','Mobile Number is already in use !!',[]); }
            else
            {
                if( !common.dobIsValid(requestData.date_of_birth) ) { callback('0','Date of Birth is not valid !!',[]); }
                else
                {
                    var insertObj = {
                        first_name : requestData.first_name,
                        last_name : ( requestData.last_name == undefined ) ? '' : requestData.last_name,
                        profile_image : ( requestData.profile_image == undefined ) ? '' : requestData.profile_image,
                        location : requestData.location,
                        lattitude : requestData.lattitude,
                        longitude : requestData.longitude,
                        interest_id : ( requestData.interest_id == undefined ) ? '' : requestData.interest_id,
                        date_of_birth : requestData.date_of_birth,
                        gender : requestData.gender,
                    };
            
                    conn.query('UPATE tbl_user SET ? WHERE id = ?',[requestData.userId],[insertObj],(error,result)=>{
            
                        if(error){ callback('0','Something went wrong !!',error); }
                        else{ 
                            if(result.affectedRows > 0){ 
                                
                                common.getUserDetails(result.insertId,(userInfo)=>{
                                    callback('1','Data Added',userInfo);
                                });
                            }
                        }
                    });
                }
            }
        }
    },




    voucherDetails : (requestData,callback) => {

        conn.query('SELECT v.* FROM tbl_voucher AS v WHERE v.is_active = 1 AND v.id = ?;',[requestData.voucherId],(error,result)=>{
            if(error){ callback('0','Something went wrong !!',error); }
            else{ if(result.length > 0){ callback('1','Success',result); }else{ callback('2','Data Not Found',[]); }  }
        });

    }




}


module.exports = Auth;