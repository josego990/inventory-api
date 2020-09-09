var express = require('express');
multer = require('multer'), // "multer": "^1.1.0"
multerS3 = require('multer-s3'); //"^1.4.1"
var mysql = require('mysql');
var bodyParser = require('body-parser');
var app = express();
//app.use(express.urlencoded());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false })); 

//app.use(express.static('public'));
//AWS CONSTANT
/**/
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: 'AKIAVG2URPVSURFRO6UE',
  secretAccessKey: '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'
});


var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'corpolex-docs',
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            console.log(file);
            cb(null, file.originalname); 
        }
    })
});

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'josego990@gmail.com',
    pass: 'xxx'
  }
});

var mailOptions = {
  from: 'josego990@gmail.com',
  to: 'yotiplagio@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  //res.header('Access-Control-Allow-Credentials', true);
  //res.header('Access-Control-Allow-Methods', 'POST, GET','PUT','OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Content-Type','application/json');
  next();
});

app.get('/send_mail', function (req, res) {
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          res.send("Uploaded!");
        }
      });
});

/* */
app.get('/upload_form', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

//used by upload form
app.post('/upload', upload.array('upl',1), function (req, res, next) {

    var value1 = req.query.param_one;

    console.log(value1);

    res.send("Uploaded!" + value1);
});

var urlencodedParser = bodyParser.urlencoded({extended: false});

app.post('/upload_xxx', urlencodedParser, function (req, res) {

    //ONLY WORK BY enctype="application/x-www-form-urlencoded" FORM

    var value1 = req.query.param_one;

    console.log(value1);

    res.status(200).send(req.body);

});

function collectRequestData(request, callback) {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if(true) {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}

//INICIAN METODOS DE INVENTORY//////////////////////////////////////////------------------------------
app.get('/mysql', function (req, res) {
  
    var query = ' select * from ad_customer '

    var con = mysql.createConnection({
        host: "database-1.cridzebmfdot.us-east-1.rds.amazonaws.com",
        user: "admin",
        password: "queremencuentle",
        database: "db_inventory",
    });

    con.connect((err) => {
        if(err){
          console.log('Error connecting to Db');
          return;
        }
        console.log('Connection established');
      });

      con.query(query, (err,rows) => {
        if(err) throw err;
      
        console.log('Data received from Db:');
        console.log(rows);
        var myObj = {};
				
        myObj.stuff = rows;
        
        res.send(myObj);
    });

    con.end((err) => {

    console.log('Connection end.');

});
  

});

//GET PRODUCT BY ID
  app.get('/inventapp_get_prd', (req, res) => {

    var code_product = req.query.p_id;

    console.log(code_product);

    var sql = require("mssql");
  
      // config for your database
      var config = {
          user: 'admin',
          password: 'queremencuentle',
          server: 'msqlserverexpress.cwz13vhixiyz.us-east-1.rds.amazonaws.com', 
          database: 'inventory_app',
          port: 1433
      };
      
      sql.close();
  
      // connect to your database
      sql.connect(config, function (err) {
      
          if (err) console.log(err);
  
          // create Request object
          var request = new sql.Request();
             
          var query = "select * from ca_products where code_product = '" + code_product + "'";

          //console.log(query);

          // query to the database and get the records
          request.query(query, function (err, recordset) {
              
              if (err) console.log(err)

              // send records as a response
              sql.close();
  
              var myJsonString = JSON.stringify(recordset.recordset);
             
              res.status(200).send(myJsonString);
              
          });
  
      });
  
  });
  
//GET PRODUCT EXISTENCE ON LOCAL BY CODE ..FULL QUERY
app.get('/inventapp_get_prd_v2', (req, res) => {

    var code_product = req.query.p_id;
    var local_id = req.query.l_i;

    console.log(code_product);

    var sql = require("mssql");
  
      // config for your database
      var config = {
          user: 'admin',
          password: 'queremencuentle',
          server: 'msqlserverexpress.cwz13vhixiyz.us-east-1.rds.amazonaws.com', 
          database: 'inventory_app',
          port: 1433
      };
      
      sql.close();
  
      // connect to your database
      sql.connect(config, function (err) {
      
          if (err) console.log(err);
  
          // create Request object
          var request = new sql.Request();
             
          var query = "select p.id_product,p.code_product,p.name_product,p.image_path,pl.price,pl.quantity,count(pl.id)[EXIST]\
          from\
              (select p.* from ca_products p\
               where p.code_product = '"+code_product+"')p\
          left join\
              (select lp.* from ad_local_products lp\
               where lp.id_local = "+local_id+")pl\
          on pl.id_product = p.id_product\
          group by p.id_product,p.code_product,p.name_product,p.image_path,pl.price,pl.quantity";

          //END QUERY

          console.log(query);

          // query to the database and get the records
          request.query(query, function (err, recordset) {
              
              if (err) console.log(err)

              // send records as a response
              sql.close();
  
              var myJsonString = JSON.stringify(recordset.recordset);
             
              console.log(myJsonString);

              res.status(200).send(myJsonString);
              
          });
  
      });
  
  });

  //INSERT A NEW PRODUCT IN DB --> CHANGE TO POST METHOD
    app.get('/inventapp_sv_prd', (req, res) => {

    var code_product = req.query.p_id;
    var name_product = req.query.p_nm;
    var image_product = req.query.p_img;
    //var status_product = req.query.p_sts;
    var price_product = req.query.p_pr;
    var quantity_product = req.query.p_q;
    var localId = req.query.l_i;

    var sql = require("mssql");
  
      // config for your database
      var config = {
          user: 'admin',
          password: 'queremencuentle',
          server: 'msqlserverexpress.cwz13vhixiyz.us-east-1.rds.amazonaws.com',
          database: 'inventory_app',
          port: 1433
      };
      sql.close();
      // connect to your database
      sql.connect(config, function (err) {
      
          if (err) console.log(err);
          // create Request object
          var request = new sql.Request();
            
          var query = "INSERT INTO ca_products (code_product,name_product,image_path,status_product,price) \
                       VALUES("+"'"+code_product+"'"+","
                               +"'"+name_product+"'"+","
                               +"'https://bucket-inventario.s3.amazonaws.com/"+image_product+"'"+","
                               +"1,"
                               +price_product+")\
                       INSERT INTO ad_local_products (id_local,id_product,price,quantity)\
                       VALUES("+ localId +", SCOPE_IDENTITY(),"
                                +price_product+","
                                +quantity_product+")\
                               select 'SUCCESS' [RESULT]";

          console.log(query);

          // query to the database and get the records
          request.query(query, function (err, recordset) {
              
              if (err) console.log(err)

              // send records as a response
              sql.close();
  
              var myJsonString = JSON.stringify(recordset.recordset);
             
              res.status(200).send(myJsonString);
              
          });
  
      });
  
  });

  app.get('/inventapp_sv_prd_local', (req, res) => {
    
    var product_id = req.query.p_i;
    var price_product = req.query.p_pr;
    var quantity_product = req.query.p_q;
    var localId = req.query.l_i;

    var sql = require("mssql");
  
      // config for your database
      var config = {
          user: 'admin',
          password: 'queremencuentle',
          server: 'msqlserverexpress.cwz13vhixiyz.us-east-1.rds.amazonaws.com',
          database: 'inventory_app',
          port: 1433
      };
      sql.close();
      // connect to your database
      sql.connect(config, function (err) {
      
          if (err) console.log(err);
          // create Request object
          var request = new sql.Request();
            
          var query = "INSERT INTO ad_local_products (id_local,id_product,price,quantity)\
                       VALUES("+ localId + ","
                                +product_id+","
                                +price_product+","
                                +quantity_product+")\
                               select 'SUCCESS' [RESULT]";

          console.log(query);

          // query to the database and get the records
          request.query(query, function (err, recordset) {
              
              if (err) console.log(err)

              // send records as a response
              sql.close();
  
              var myJsonString = JSON.stringify(recordset.recordset);
             
              res.status(200).send(myJsonString);
              
          });
  
      });
  
  });

  //USER
  app.get('/inventapp_sv_usr', (req, res) => {

    var name_user = req.query.n_u;
    var address_user = req.query.a_u;
    var mail_user = req.query.m_u;
    var phone = req.query.p_u;
    var sec_key = req.query.s_k_u;
    var pic_path = req.query.p_p_u;

    var sql = require("mssql");
      // config for your database
      var config = {
          user: 'admin',
          password: 'queremencuentle',
          server: 'msqlserverexpress.cwz13vhixiyz.us-east-1.rds.amazonaws.com',
          database: 'inventory_app',
          port: 1433
      };
      sql.close();
  
      sql.connect(config, function (err) {
      
          if (err) console.log(err);
         
          var request = new sql.Request();
          
          var query = "INSERT INTO ad_user(name_contact,address_contact,phone,secret_key,mail,picture_path)\
                       VALUES("+"'"+name_user+"',"
                               +"'"+address_user+"',"
                               +phone+","
                               +"'"+sec_key+"',"
                               +"'"+mail_user+"',"
                               +"'https://bucket-inventario.s3.amazonaws.com/"+"generic_pic"+"')\
                               select 'SUCCESS' [RESULT], SCOPE_IDENTITY() [ID_INSERT]";

          request.query(query, function (err, recordset) {
              
              if (err) console.log(err)

              // send records as a response
              sql.close();
  
              var myJsonString = JSON.stringify(recordset.recordset);
             
              res.status(200).send(myJsonString);
              
          });
  
      });
  
  });
  
  //LOCAL
  app.get('/inventapp_sv_local', (req, res) => {

    var user_id = req.query.u_i;
    var local_name = req.query.l_n;
    var local_address = req.query.l_a;
    var local_secret_key = req.query.s_k_l;

    var sql = require("mssql");
      // config for your database
      var config = {
          user: 'admin',
          password: 'queremencuentle',
          server: 'msqlserverexpress.cwz13vhixiyz.us-east-1.rds.amazonaws.com',
          database: 'inventory_app',
          port: 1433
      };

      sql.close();
  
      sql.connect(config, function (err) {
      
          if (err) console.log(err);
         
          var request = new sql.Request();
          
          var query = "INSERT INTO ad_local(id_user,name_local,secret_local_key,address_local)\
                       VALUES("+user_id+","
                               +"'"+local_name+"',"
                               +"'"+local_secret_key+"',"
                               +"'"+local_address+"')\
                               select 'SUCCESS' [RESULT], SCOPE_IDENTITY() [ID_INSERT]";

          request.query(query, function (err, recordset) {
              
              if (err) console.log(err)

              // send records as a response
              sql.close();
  
              var myJsonString = JSON.stringify(recordset.recordset);
             
              res.status(200).send(myJsonString);
              
          });
  
      });
  
  });
  
 //LOCAL
 app.get('/inventapp_get_local_by_secret', (req, res) => {

    var name_user = req.query.n_l;
    var address_user = req.query.a_u;
    var mail_user = req.query.m_u;
    var phone = req.query.p_u;
    var sec_key = req.query.s_k_u;
    var pic_path = req.query.p_p_u;

    var sql = require("mssql");
      // config for your database
      var config = {
          user: 'admin',
          password: 'queremencuentle',
          server: 'msqlserverexpress.cwz13vhixiyz.us-east-1.rds.amazonaws.com',
          database: 'inventory_app',
          port: 1433
      };

      sql.close();
  
      sql.connect(config, function (err) {
      
          if (err) console.log(err);
         
          var request = new sql.Request();
          
          var query = "INSERT INTO ad_user(name_contact,address_contact,phone,secret_key,mail,picture_path)\
                       VALUES("+"'"+name_user+"',"
                               +"'"+address_user+"',"
                               +phone+","
                               +"'"+sec_key+"',"
                               +"'"+mail_user+"',"
                               +"'https://bucket-inventario.s3.amazonaws.com/"+"generic_pic"+"')\
                               select 'SUCCESS' [RESULT]";

          request.query(query, function (err, recordset) {
              
              if (err) console.log(err)

              // send records as a response
              sql.close();
  
              var myJsonString = JSON.stringify(recordset.recordset);
             
              res.status(200).send(myJsonString);
              
          });
  
      });
  
  });

    //LOCAL
    app.get('/inventapp_get_user_by_secret', (req, res) => {

        var secret_key = req.query.s_k;

        var sql = require("mssql");
            // config for your database
            var config = {
                user: 'admin',
                password: 'queremencuentle',
                server: 'msqlserverexpress.cwz13vhixiyz.us-east-1.rds.amazonaws.com',
                database: 'inventory_app',
                port: 1433
            };

            sql.close();
        
            sql.connect(config, function (err) {
            
                if (err) console.log(err);
                
                var request = new sql.Request();
                
                var query = "SELECT * FROM AD_USER where secret_key = "+"'"+secret_key+"'";

                request.query(query, function (err, recordset) {
                    
                    if (err) console.log(err)

                    // send records as a response
                    sql.close();
        
                    var myJsonString = JSON.stringify(recordset.recordset);
                    
                    res.status(200).send(myJsonString);
                    
                });
        
            });
        
        });

//FINALIZAN METODOS DE INVENTORY----------------------------------------------------------------------


app.get('/', (req, res) => {
  res.send('El API está activo y respondiendo v07092020.')
});

app.get('/other', (req, res) => {
    res.send('Hello Other World!')
  });

app.get('/get_videos', (req, res) => {
    
    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'usrsmart',
        password: 'D3s@rr0ll0',
        server: '181.174.97.52', 
        database: 'SMART_AXS',
        port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('exec procGetFilesByCriteria 0,54,0,0', function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset);
        
            //var string = myJsonString.toString();
  
            res.status(200).send(myJsonString);
            
        });
    });
  });

app.post('/get_videos', (req, res) => {
    
    var id_company = req.headers.i_c;
 
    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'usrsmart',
        password: 'D3s@rr0ll0',
        server: '181.174.97.52',
        database: 'SMART_AXS',
        port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('exec procGetFilesByCriteria 0,' + id_company + ',0,0,0,0,0', function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset);
        
            var string = myJsonString.toString();
  
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/get_all_videos', (req, res) => {
    
    var id_company = req.headers.i_c;
 
    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'usrsmart',
        password: 'D3s@rr0ll0',
        server: '181.174.97.52', 
        database: 'SMART_AXS',
        port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('exec procGetVideosByCompany ' + id_company, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset);
        
            var string = myJsonString.toString();
  
            res.status(200).send(myJsonString);
            
        });

    });
    
  });

app.post('/get_all_location_by_company', (req, res) => {
    
    var id_company = req.headers.i_c;
 
    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'usrsmart',
        password: 'D3s@rr0ll0',
        server: '181.174.97.52',
        database: 'SMART_AXS',
        port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('exec getAllLocationByCompany ' + id_company, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset);
        
            var string = myJsonString.toString();
  
            res.status(200).send(myJsonString);
            
        });

    });
    
  });

  //GET CDC DATA BY COMPANY
app.get('/get_cdc', (req, res) => {
    
    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'usrsmart',
        password: 'D3s@rr0ll0',
        server: '181.174.97.52', 
        database: 'SMART_AXS',
        port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('exec getCDCAllDataByCompany 21', function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordsets);
        
            var string = myJsonString.toString();
  
            res.status(200).send(myJsonString);
            
        });

    });
    
  });

//LOGIN
app.post('/login', (req, res) => {
    
  var sql = require("mssql");

    // config for your database
    var config = {
        user: 'usrsmart',
        password: 'D3s@rr0ll0',
        server: '181.174.97.52',
        database: 'SMART_AXS',
        port: 1433
    };

    var user_mame = req.headers.u_s;
    var user_pass = req.headers.p_a;

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query("exec procValidateUser " + "'" + user_mame + "'," + user_pass, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset);
        
            var string = myJsonString.toString();
  
            res.status(200).send(myJsonString); 
        });
    });
});

//ABC
app.get('/get_companies', (req, res) => {
    
    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'usrsmart',
        password: 'D3s@rr0ll0',
        server: '181.174.97.52', 
        database: 'SMART_AXS',
        port: 1433
    };

    sql.close();

    // connect to database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('exec procGetAllCompanies 0', function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset);

            res.status(200).send(myJsonString); 
        });
    });
  });

app.get('/get_active_companies', (req, res) => {

var sql = require("mssql");

// config for your database
var config = {
    user: 'usrsmart',
    password: 'D3s@rr0ll0',
    server: '181.174.97.52', 
    database: 'SMART_AXS',
    port: 1433
};

sql.close();

// connect to database
sql.connect(config, function (err) {

    if (err) console.log(err);

    // create Request object
    var request = new sql.Request();
        
    // query to the database and get the records
    request.query('exec procGetActiveCompanies 0', function (err, recordset) {
        
        if (err) console.log(err)

        // send records as a response
        sql.close();

          var myObj = {};
				
        myObj.stuff = recordset;
        
        res.send(myObj);
    });
});
});

app.get('/get_regions_by_company', (req, res) => {

    var id_company = req.headers.i_c;

    var sql = require("mssql");
    
    // config for your database
    var config = {
        user: 'usrsmart',
        password: 'D3s@rr0ll0',
        server: '181.174.97.52',
        database: 'SMART_AXS',
        port: 1433
    };

    sql.close();
    
    // connect to database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
    
        // create Request object
        var request = new sql.Request();
            
        // query to the database and get the records
        request.query('exec procGetRegionsByCompany ' + id_company, function (err, recordset) {
            
            if (err) console.log(err)
    
            // send records as a response
            sql.close();
    
            var myJsonString = JSON.stringify(recordset.recordset);
    
            res.status(200).send(myJsonString); 
        });
    });
});

app.post('/edit_company', (req, res) => {
    
    var sql = require("mssql");
  
      // config for your database
      var config = {
          user: 'usrsmart',
          password: 'D3s@rr0ll0',
          server: '181.174.97.52', 
          database: 'SMART_AXS',
          port: 1433
      };
  
      var id_company = req.headers.i_c;
      var name_company = req.headers.n_c;
      var address_company = req.headers.a_c;
      var telephone1_company = req.headers.t1_c;
      var telephone2_company = req.headers.t2_c;
      var email_company = req.headers.e_c;
      var status_company = req.headers.s_c;
      
      sql.close();
  
      // connect to your database
      sql.connect(config, function (err) {
      
          if (err) console.log(err);
  
          // create Request object
          var request = new sql.Request();
             
          var query = "exec procEditCompany " + id_company + ",'" 
          + name_company + "','" + address_company + "','" + telephone1_company + "','" 
          + telephone2_company + "','" + email_company + "'," + "1";

          //console.log(query);

          // query to the database and get the records
          request.query(query, function (err, recordset) {
              
              if (err) console.log(err)
  
              // send records as a response
              sql.close();
  
              var myJsonString = JSON.stringify(recordset.recordset);
             
              res.status(200).send(myJsonString);
              
          });
  
      });
  
  });
-
app.post('/new_company', (req, res) => {
    
    var sql = require("mssql");
  
      // config for your database
      var config = {
          user: 'usrsmart',
          password: 'D3s@rr0ll0',
          server: '181.174.97.52', 
          database: 'SMART_AXS',
          port: 1433
      };
  
      var id_country = req.headers.i_c;
      var name_company = req.headers.n_c;
      var address_company = req.headers.a_c;
      var telephone1_company = req.headers.t1_c;
      var telephone2_company = req.headers.t2_c;
      var email_company = req.headers.e_c;
      var location_company = req.headers.l_c
      var status_company = req.headers.s_c;
      
      sql.close();
  
      // connect to your database
      sql.connect(config, function (err) {
      
          if (err) console.log(err);
  
          // create Request object
          var request = new sql.Request();
        
          var query = "exec procInsertCompany " + id_country + ",'" + name_company + "','" + address_company + "','" + location_company + "','"
          + telephone1_company + "','" + telephone2_company + "','" + email_company + "'";

          //console.log(query);

          // query to the database and get the records
          request.query(query, function (err, recordset) {
              
              if (err) console.log(err)
  
              // send records as a response
              sql.close();
  
              var myJsonString = JSON.stringify(recordset.recordset);
             
              res.status(200).send(myJsonString);
              
          });
  
      });
  
  });

app.post('/delete_company', (req, res) => {
    
    var sql = require("mssql");
  
      // config for your database
      var config = {
          user: 'usrsmart',
          password: 'D3s@rr0ll0',
          server: '181.174.97.52', 
          database: 'SMART_AXS',
          port: 1433
      };
  
      var id_company = req.headers.i_c;
    
      sql.close();
  
      // connect to your database
      sql.connect(config, function (err) {
      
          if (err) console.log(err);
  
          // create Request object
          var request = new sql.Request();
             
          var query = "exec procDeleteCompany " + id_company ;

          //console.log(query);

          // query to the database and get the records
          request.query(query, function (err, recordset) {
              
              if (err) console.log(err)
  
              // send records as a response
              sql.close();
  
              var myJsonString = JSON.stringify(recordset.recordset);
             
              res.status(200).send(myJsonString);
              
          });
  
      });
  
  });

app.get('/get_users', (req, res) => {
    
    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'usrsmart',
        password: 'D3s@rr0ll0',
        server: '181.174.97.52', 
        database: 'SMART_AXS',
        port: 1433
    };

    sql.close();

    // connect to database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('exec procGetAllUsers 0', function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset);

            res.status(200).send(myJsonString); 
        });
    });
  });

  app.post('/edit_user', (req, res) => {
    
    var sql = require("mssql");
  
      // config for your database
      var config = {
          user: 'usrsmart',
          password: 'D3s@rr0ll0',
          server: '181.174.97.52', 
          database: 'SMART_AXS',
          port: 1433
      };
  
      var id_company = req.headers.i_c;
      var name_company = req.headers.n_c;
      var address_company = req.headers.a_c;
      var telephone1_company = req.headers.t1_c;
      var telephone2_company = req.headers.t2_c;
      var email_company = req.headers.e_c;
      var status_company = req.headers.s_c;
      
      sql.close();
  
      // connect to your database
      sql.connect(config, function (err) {
      
          if (err) console.log(err);
  
          // create Request object
          var request = new sql.Request();
             
          var query = "exec procEditCompany " + id_company + ",'" 
          + name_company + "','" + address_company + "','" + telephone1_company + "','" 
          + telephone2_company + "','" + email_company + "'," + "1";

          //console.log(query);

          // query to the database and get the records
          request.query(query, function (err, recordset) {
              
              if (err) console.log(err)
  
              // send records as a response
              sql.close();
  
              var myJsonString = JSON.stringify(recordset.recordset);
             
              res.status(200).send(myJsonString);
              
          });
  
      });
  
  });
////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //INICIAN SERVICIOS DE CORPOLEX


  
//exec procInsertDocumentUpload 2,'archivo-prueba','2020-06-06 00:00:00.000'
  
app.post('/corpolex-login', (req, res) => {
    
    var sql = require("mssql");
  
      // config for your database
      var config_sql = {
          user: 'usrsmart',
          password: 'D3s@rr0ll0',
          server: '181.174.97.52',
          database: 'CORPOLEX',
          port: 1433
      };
  
      var user_mame = req.headers.u_s;
      var user_pass = req.headers.p_a;
  
      sql.close();
  
      // connect to your database
      sql.connect(config_sql, function (err) {
      
          if (err) console.log(err);
  
          var request = new sql.Request();
             
          // query to the database and get the records
          request.query("exec procValidateUser " + "'" + user_mame + "'," + user_pass, function (err, recordset) {
              
              if (err) console.log(err);

              sql.close();
  
              var myJsonString = JSON.stringify(recordset.recordset);
          
              var string = myJsonString.toString();
    
              res.status(200).send(myJsonString); 
          });
      });
  });

  app.get('/corpolex_get_companies', (req, res) => {
    
    var id_company = req.headers.i_c;
    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'usrsmart',
        password: 'D3s@rr0ll0',
        server: '181.174.97.52',
        database: 'CORPOLEX',
        port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('exec procGetCompanies 1' , function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset);
        
            var string = myJsonString.toString();
  
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/corpolex-get_companies', (req, res) => {
    
    var id_company = req.headers.i_c;
    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'usrsmart',
        password: 'D3s@rr0ll0',
        server: '181.174.97.52',
        database: 'CORPOLEX',
        port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('exec procGetCompanies ' + id_company , function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset);
        
            var string = myJsonString.toString();
  
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/corpolex-get_files_by_company', (req, res) => {
    
    var id_company = req.headers.i_c;
    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'usrsmart',
        password: 'D3s@rr0ll0',
        server: '181.174.97.52',
        database: 'CORPOLEX',
        port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('exec proGetDocumentsByCompany ' + id_company, function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset);

  
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/corpolex-upload-file', upload.array('upl',1), function (req, res, next) {

    var id_company = req.query.i_c;
    var name_file = req.query.n_f;
    var date_expired = req.query.d_e;

    console.log(id_company+"-"+name_file+"-"+date_expired);

    var sql = require("mssql");
  
      // config for your database
      var config = {
          user: 'usrsmart',
          password: 'D3s@rr0ll0',
          server: '181.174.97.52', 
          database: 'CORPOLEX',
          port: 1433
      };

      sql.close();
  
      // connect to your database
      sql.connect(config, function (err) {
      
          if (err) console.log(err);
  
          // create Request object
          var request = new sql.Request();
        
          var query = "exec procInsertDocumentUpload " + id_company + ",'" + name_file + "','" + date_expired + "'";

          //console.log(query);

          // query to the database and get the records
          request.query(query, function (err, recordset) {
              
              if (err) console.log(err)
  
              // send records as a response
              sql.close();
  
              var myJsonString = JSON.stringify(recordset.recordset);
             
              res.set('Content-Type', 'text/html');

              res.status(200).send('<input type="button" value="EL ARCHIVO SE CARGO CORRECTAMENTE" onclick=" window.location.replace("http://corpolex-page.s3-website-us-east-1.amazonaws.com/");>');
              
          });
  
      });


   
});

app.post('/corpolex_new_company', (req, res) => {
    
    var sql = require("mssql");
  
      // config for your database
      var config = {
          user: 'usrsmart',
          password: 'D3s@rr0ll0',
          server: '181.174.97.52', 
          database: 'SMART_AXS',
          port: 1433
      };
  
      var id_country = req.headers.i_c;
      var name_company = req.headers.n_c;
      var address_company = req.headers.a_c;
      var telephone1_company = req.headers.t1_c;
      var telephone2_company = req.headers.t2_c;
      var email_company = req.headers.e_c;
      var location_company = req.headers.l_c;
      var status_company = req.headers.s_c;
      
      sql.close();
  
      // connect to your database
      sql.connect(config, function (err) {
      
          if (err) console.log(err);
  
          // create Request object
          var request = new sql.Request();
        
          var query = "exec procInsertCompany " + id_country + ",'" + name_company + "','" + address_company + "','" + location_company + "','"
          + telephone1_company + "','" + telephone2_company + "','" + email_company + "'";

          //console.log(query);

          // query to the database and get the records
          request.query(query, function (err, recordset) {
              
              if (err) console.log(err)
  
              // send records as a response
              sql.close();
  
              var myJsonString = JSON.stringify(recordset.recordset);
             
              res.status(200).send(myJsonString);
              
          });
  
      });
  
  });

//FINALIZAN SERVICIOS DE CORPOLEX
//////////////////////////////////////////////////////////////////////////////////
app.listen(8080, () => {
  console.log('API Escuchando en el puerto 8080!')
});
