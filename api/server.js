require('dotenv').config();

var conn = require('./config/database');

const express = require('express');

let app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));


var auth = require('./modules/v1/Auth/route');
app.use('/',require('./middleware/validation').validateapikey);
app.use('/',require('./middleware/validation').validateheadertoken);
app.use('/api/modules/v1/Auth',auth);






// for running the server
try {
    app.listen(3000,()=>console.log('Server is running : '+process.env.PORT) );
} catch (error) {
    console.log('Failed');
}

