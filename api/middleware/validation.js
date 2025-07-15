const Validator = require('Validator');
var conn = require('../config/database');
const { response } = require('express');

var bypassmethods = new Array("signup","login","verify_otp","validateusers")

var middleware = {

    checkValidationRules : (request,response,rules,message) => {

        const v = Validator.make(request,rules,message);
        
        
        if(v.fails())
        {
            var error = '';
            const errors = v.getErrors();

            for(var i in errors){ error = errors[i][0]; break; }

            response_data = {  code:'0', message:error }

            response.status(200).send(response_data);

            return false;
        }
        else{ return true; }

    },
    
    validateapikey: function(req,res,callback){

        var api_key = (req.headers['api_key'] != undefined && req.headers['api_key'] != "") ? req.headers['api_key'] : '';  
    
        if(api_key!=""){
            
            try{
                if(api_key != "",api_key == process.env.API_KEY){
                    callback();
                } else{
                     response_data={
                        code : '0',
                        message : 'invalid api key'
                     }

                     res.status(401);
                     res.send(response_data);
                }
                
            } catch(error){
                response_data={
                    code: '0',
                    message : 'invalid api key'
                }

                res.status(401);
                res.send(response);
            }
        }
    else{
        
          response_data={
            code: '0',
            message : 'invalid api key'
          }

          res.status(401);
          res.send(response);

        }
     
    },

    //validate header token
      validateheadertoken: function(req,res,callback){
      var headertoken = (req.headers['token'] != undefined && req.headers['token'] !='') ? req.headers['token'] : '';
      
      var path_data=req.path.split('/');

      if(bypassmethods.indexOf(path_data[4]) === -1){
        if(headertoken != ''){
            try{
                var findtoken = 'select * from tbl_user_device where token=?';

                conn.query(findtoken,[token],function(error,token){
                    if(!error && token.length>0){
                          req.user_id=token[0].user_id;
                          callback();
                    }else{
                        var response = {
                            code : '0',
                            message : 'invalid header token'
                        }

                        res.status(401).send(response);
                    }
                })
            } catch(error){
                var response = {
                    code : '0',
                    message : 'invalid header token'
                }
                res.status(401).send(response);
            }
        } else{
            var response = {
                code : '0',
                message : 'invalid header token'
            }

            res.status(401).send(response);
        }
      }   else{
            callback();
      }
      
      }

};

module.exports = middleware;