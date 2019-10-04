var express = require('express');
var app = express();

app.use(function(req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'POST, GET','PUT','OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Content-Type','application/json');
  next();
});

app.get('/', (req, res) => {
    
   
            res.status(200).send("HOLA AMIGOS"); 
  
  });

app.get('/get_inventory', (req, res) => {

  res.header('Content-Type','text/html');

  var sql = require("mssql");

  var usr_name = req.query.user_name;

  console.log(usr_name);

    // config for your database
    var config = {
        user: 'usrsmart',
        password: 'D3s@rr0ll0',
        server: '181.174.97.52', 
        database: 'INVENTARIO_ECO',
        port: 1433
    };

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('exec procGetDataInventory ' +  usr_name , function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset);
  
            var name_machine = recordset.recordset.name_machine;

            //res.status(200).send(recordset.recordset[0].name_machine);

            res.status(200).send('<!DOCTYPE html><head><style type="text/css">.animated { -webkit-animation-duration: 1s; animation-duration: 1s; -webkit-animation-fill-mode: both;  animation-fill-mode: both; } .animated.infinite { -webkit-animation-iteration-count: infinite; animation-iteration-count: infinite; } .animated.hinge { -webkit-animation-duration: 2s; animation-duration: 2s; } .animated.bounceIn, .animated.bounceOut { -webkit-animation-duration: .75s; animation-duration: .75s; } .animated.flipOutX, .animated.flipOutY { -webkit-animation-duration: .75s; animation-duration: .75s; } .col-md-offset-0 { margin-left: 0%; }  .col-md-offset-1 {  margin-left: 8.33333%;  }  .col-md-offset-2 { margin-left: 16.66667%; } .col-md-offset-3 {  margin-left: 25%; } .col-md-offset-4 {  margin-left: 33.33333%; } .col-md-offset-5 { margin-left: 41.66667%; } .col-md-offset-6 { margin-left: 50%; } .col-md-offset-7 { margin-left: 58.33333%; } .col-md-offset-8 { margin-left: 66.66667%; } .col-md-offset-9 { margin-left: 75%; } .col-md-offset-10 { margin-left: 83.33333%; } .col-md-offset-11 { margin-left: 91.66667%; } .col-md-offset-12 { margin-left: 100%; } body { font-family: "Roboto", Arial, sans-serif; font-weight: 300; font-size: 20px; line-height: 1.6; color: rgba(0, 0, 0, 0.5); } @media screen and (max-width: 992px) { body { font-size: 16px; } } h1 { color: #000; font-family: "Montserrat", Arial, sans-serif; font-weight: 700; margin: 0 0 30px 0; } #fh5co-main { width: 85%; float: right; -webkit-transition: 0.5s; -o-transition: 0.5s; transition: 0.5s; } @media screen and (max-width: 768px) { #fh5co-main { width: 100%; } } body.offcanvas { overflow-x: hidden; }</style><meta charset="utf-8"></head><body><div id="fh5co-page"><center><img src="https://ecotermo-images.s3.amazonaws.com/21.png"height="123px"></center><div id="fh5co-main"><div class="col-md-12 animate-box" data-animate-effect="fadeInLeft"></div><div class="col-md-8 col-md-offset-2 animate-box" data-animate-effect="fadeInLeft"><br><h1>'
            + recordset.recordset[0].name_employee +
            '</h1></br><br>Descripción del equipo: '    
            + recordset.recordset[0].name_machine +
            '<br>Descripcion CPU: '
            + recordset.recordset[0].cpu_description +
            '<br>Dirección de IP primaria: '
            + recordset.recordset[0].primary_ip + '<br>Estado del hardware del equipo: Detección de hardware habilitada<br>Fabricante del dispositivo: Dell Inc.<br>Modelo del dispositivo: Latitude E5430 non-vPro<<br>Número de serie: F8TCMX1<br>Fabricante del GPU: GenuineIntel<br>Descripción CPU: Intel(R) Core(TM) i3-3110M CPU @ 2.40GHz<br>Cantidad de núcleos: 2<br>Velocidad del reloj [MHz]: 2400<br>Capacidad Ram (GB): 4<br>Grafica Ram (GB): 4<br>Capacidad HDR (GB): 1000</br></p></div></body></html>')
            
        });
    });
  

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

        var myJsonString = JSON.stringify(recordset.recordset);

        res.status(200).send(myJsonString); 
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

app.listen(8000, () => {
  console.log('API Escuchando en el puerto 8000!')
});