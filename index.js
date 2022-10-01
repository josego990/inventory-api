var express = require('express');
multer = require('multer'), // "multer": "^1.1.0"
multerS3 = require('multer-s3'); //"^1.4.1"
var mssql = require('mssql');
var bodyParser = require('body-parser');
var app = express();
//app.use(express.urlencoded());
app.use(express.json());


app.use(bodyParser.urlencoded({ extended: false })); 

//INICIAN METODOS DE INVENTORY//////////////////////////////////////////------------------------------
app.get('/mssql', function (req, res) {

var query = ' select * from ad_customer '


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

//GET PRODUCT BY LOCAL ID
app.get('/inventapp_get_prds', (req, res) => {

    var local_id = req.query.l_i;

    console.log(local_id);

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'inventory_app',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {

        if (err) console.log(err);

        var request = new sql.Request();
            
        var query = "select p.id_product,\
                    p.code_product,\
                    p.name_product,\
                    p.image_path,\
                    l.price,\
                    l.quantity\
                    from ca_products p\
                    inner join ad_local_products l\
                    on l.id_product = p.id_product\
                    where l.id_local = " + local_id

        request.query(query, function (err, recordset) {
            
            if (err) console.log(err)

            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset);
            
            console.log(recordset.recordset);

            res.status(200).send(myJsonString);
            
        });

    });

});

//GET PRODUCT BY LOCAL AND FILTER SEARCH
app.get('/inventapp_get_prds_by_filter', (req, res) => {

    var local_id = req.query.l_i;
    var product_criteria = req.query.p_f;
    
    console.log(local_id);

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'inventory_app',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {

        if (err) console.log(err);

        var request = new sql.Request();
            
        var query = "select p.id_product,\
                    p.code_product,\
                    p.name_product,\
                    p.image_path,\
                    l.price,\
                    l.quantity\
                    from ca_products p\
                    inner join ad_local_products l\
                    on l.id_product = p.id_product\
                    where l.id_local = " + local_id
                    +" and p.name_product like '%" + product_criteria + "%'" 
                    

        request.query(query, function (err, recordset) {
            
            if (err) console.log(err)

            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset);
            
            //console.log(recordset.recordset);

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
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'inventory_app',
        port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
            
        var query = "select p.id_product,p.code_product,p.name_product,p.image_path,isnull(pl.price,0.0)[price],isnull(pl.quantity,0)[quantity],count(pl.id)[EXIST]\
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
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
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
                            +"'https://bucket-inventoryy.s3.amazonaws.com/"+image_product+"'"+","
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

//INSERT A BATCH PRODUCT 
app.post('/inventapp_insert_product_batch', (req, res) => {

    var body = req.body;

    console.log(body);
    console.log(body.length);

    res.send(body);

});

//SAVE LOCAL
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
    server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
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

//UPLOAD PRODUCT TO LOCAL
app.get('/inventapp_upd_prd_local', (req, res) => {

var product_id = req.query.p_i;
var price_product = req.query.p_pr;
var quantity_product = req.query.p_q;
var local_id = req.query.l_i;

var sql = require("mssql");

// config for your database
var config = {
user: 'admin',
password: 'queremencuentle',
server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
database: 'inventory_app',
port: 1433
};

sql.close();
// connect to your database
sql.connect(config, function (err) {

if (err) console.log(err);

var request = new sql.Request();

var query_select = "select p.quantity\
                from ad_local_products p\
                where id_local = " + local_id +"\
                and id_product = " + product_id ;

request.query(query_select, function (err, recordset) {

if (err) console.log(err)

var quanti = parseInt(recordset.recordsets[0][0].quantity);

quanti = quanti + parseInt(quantity_product);

var query = "UPDATE ad_local_products\
SET quantity = "+quanti+",\
    price = "+price_product+"\
WHERE id_local = "+local_id+"\
AND id_product = "+product_id+"\
SELECT 'SUCCESS' [RESULT]";
    
console.log(query);

request.query(query, function (err, recordset) {

    if (err) console.log(err)

    var myJsonString = JSON.stringify(recordset.recordset);
    
    console.log(myJsonString);

    res.status(200).send(myJsonString);

});

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
    server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
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
    server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
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

//SALE
app.post('/inventapp_save_sale', (req, res) => {

    var body = req.body;
    var products_list = body.products;
    console.log(body.products);
    
    var sql = require("mssql");
    
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'inventory_app',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {

        if (err) console.log(err);

        var request = new sql.Request();

        var query = "INSERT INTO ad_sale_header (local_id,total_articles,total_sale,date_sale)\
                    VALUES("+body.local_id+","
                            +body.total_articles+","
                            +body.total_sale
                            +",dateadd(hh,-6,getdate())) declare @identity int = SCOPE_IDENTITY()"
                            
        var subquery = "";
        var query_downgrade_products = "";

        products_list.forEach(prod => {
            
            var total_items_price = prod.quantity_in_sale * prod.product_price;
            
            subquery = subquery + " INSERT INTO ad_sale_detail (id_header,id_product,quantity,unit_price,total) "
                       +"VALUES (@identity,"
                       + prod.product_id + ","
                       + prod.quantity_in_sale + ","
                       + prod.product_price + ","
                       + total_items_price + ") "

            query_downgrade_products = query_downgrade_products + " update ad_local_products set quantity = quantity - "
            + prod.quantity_in_sale +" where id_product = " + prod.product_id 
            + " and id_local = " + body.local_id + " ";

        });

        query = query + subquery + query_downgrade_products + " select @identity[id_header], 'SUCCESS' [RESULT]";

        console.log(query);

        request.query(query, function (err, recordset) {
        
            if (err) console.log(err)
        
            // send records as a response
            sql.close();
        
            var myJsonString = JSON.stringify(recordset);
            
            console.log(recordset.recordset[0]);

            res.status(200).send(myJsonString);
            
        });

    });


});

//LOCALs
app.get('/inventapp_get_local_by_secret', (req, res) => {

    var local_secret_key = req.query.s_k_l;

    var sql = require("mssql");
        // config for your database
        var config = {
            user: 'admin',
            password: 'queremencuentle',
            server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
            database: 'inventory_app',
            port: 1433
        };

        sql.close();

        sql.connect(config, function (err) {
        
            if (err) console.log(err);
            
            var request = new sql.Request();
            
            var query = "select u.id[user_id],\
                        u.name_contact,\
                        u.is_active[user_active],\
                        u.mail,\
                        l.id[local_id],\
                        l.is_active[local_active],\
                        l.name_local\
                        from ad_local l\
                        inner join ad_user u\
                        on u.id = l.id_user\
                        where l.secret_local_key = "+"'"+local_secret_key+"'"

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
app.get('/inventapp_get_user_by_secret', (req, res) => {

    var secret_key = req.query.s_k;

    var sql = require("mssql");
        // config for your database
        var config = {
            user: 'admin',
            password: 'queremencuentle',
            server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
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

//GET SALES BY DATE FILTER
app.get('/inventapp_get_sales_by_filter', (req, res) => {

    var local_id = req.query.l_i;
    var first_date = req.query.f_d;
    var end_date = req.query.e_d;

    console.log(local_id);

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'inventory_app',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {

        if (err) console.log(err);

        var request = new sql.Request();
            
        var query = "select * from ad_sale_header where local_id = " + local_id + " and date_sale between '" + first_date + "' and '" + end_date +"'";
                  
        console.log(query);

        request.query(query, function (err, recordset) {
            
            if (err) console.log(err)

            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset);
            
            //console.log(recordset.recordset);

            res.status(200).send(myJsonString);
            
        });

    });

});

//GET SALE DETAIL BY ID_SALE
app.get('/inventapp_get_detail_by_id_sale', (req, res) => {

    var header_id = req.query.h_i;

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'inventory_app',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {

        if (err) console.log(err);

        var request = new sql.Request();
            
        var query = "select d.id_product,d.quantity,d.unit_price,d.total,p.code_product,p.name_product,p.image_path\
                    from ad_sale_detail d\
                    inner join ad_sale_header h\
                    on h.id = d.id_header\
                    inner join ca_products p\
                    on p.id_product = d.id_product\
                    where h.id =" + header_id;
                  
        console.log(query);

        request.query(query, function (err, recordset) {
            
            if (err) console.log(err)

            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset);
            
            //console.log(recordset.recordset);

            res.status(200).send(myJsonString);
            
        });

    });

});

//


//FINALIZAN METODOS DE INVENTORY-------------------------------------------------------------------------------------


//INICIAN METODOS DE AUTOBUS--------------------------------------------------------------------------------

app.post('/autobus-logni13', (req, res) => {
    
    var body = req.body;

    console.log(body);

    var sql = require("mssql");

    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();

        
        request.query("exec procLogin " +             
            "'"+body.owner_alias + "', " +
            "'"+body.owner_pass+"'",
            function (err, recordset) {
            
                if (err) console.log(err);

                // send records as a response
                sql.close();

                var myJsonString = JSON.stringify(recordset.recordset[0]);
            
                res.status(200).send(myJsonString);
            });
    });
});

app.post('/autobus-system-logni13', (req, res) => {
    
    var body = req.body;

    console.log(body);

    var sql = require("mssql");

    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query("exec procSystemLogin " +             
            "'"+body.system_user_alias + "', " +
            "'"+body.system_user_pass+"'",
            function (err, recordset) {
            
                if (err) console.log(err);

                // send records as a response
                sql.close();

                var myJsonString = JSON.stringify(recordset.recordset[0]);
            
                res.status(200).send(myJsonString);
            });
    });
});

app.post('/autobus-make-transaction', (req, res) => {
    
    var body = req.body;

    console.log(body);

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query('exec procMakeTransaction ' + 
                        body.id_customer + ', ' + 
                        body.id_bus + ', ' + 
                        body.cycle_number + ', ' + 
                        body.id_pilot + ', ' + 
                        body.ticket_type + ', \'' +
                        body.code_ticket + '\'', function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset[0]);
          
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/autobus-main-get-general-data', (req, res) => {
    
    var body = req.body;

    console.log(body);

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query('exec procGetMainData ' + body.id_bus + ', ' + body.id_pilot + ', ' + body.actual_cycle, function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset[0]);
          
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/autobus-subscribe-owner', (req, res) => {
    
    var body = req.body;

    //console.log(body);

    var sql = require("mssql");

    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query("exec procSubscribeOwner " + 
            "'"+body.owner_name + "', " + 
            "'"+body.owner_cui + "', " + 
            "'"+body.owner_phone + "', " +
            "'"+body.owner_alias + "', " +
            "'"+body.owner_pass+"'",
            function (err, recordset) {
            
                if (err) console.log(err);

                // send records as a response
                sql.close();

                var myJsonString = JSON.stringify(recordset.recordset[0]);
            
                res.status(200).send(myJsonString);
            });
    });
});

app.post('/autobus-get-owner-data', (req, res) => {
    
    var body = req.body;

    //console.log(body);

    var sql = require("mssql");

    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
    

        request.query("exec procGetOwnerData " +                 
                body.id_owner,
            function (err, recordset) {
            
                if (err) console.log(err);

                // send records as a response
                sql.close();
                

                //TO GET OWNER DATA
                var owner_data = JSON.stringify(recordset.recordsets[0][0]); //get json object
                var owner_data_json = JSON.parse(owner_data);

                //TO GET OWNER BUSES LIST
                var owner_buses = JSON.stringify(recordset.recordsets[1]); //get json array
                var owner_buses_json = JSON.parse(owner_buses);

                //TO GET OWNER PILOTS LIST
                var owner_pilots = JSON.stringify(recordset.recordsets[2]) 
                var owner_pilots_json = JSON.parse(owner_pilots);

                //TO GET OWNER BANK ACCOUNT
                var owner_bank = JSON.stringify(recordset.recordsets[3]) 
                var owner_bank_json = JSON.parse(owner_bank);
                             
                owner_data_json.buses = owner_buses_json;
                owner_data_json.pilots = owner_pilots_json;
                owner_data_json.bank = owner_bank_json;

                //console.log(owner_data_json);

                res.status(200).send(JSON.stringify(owner_data_json));
            });
    });
});

app.post('/autobus-get-active-routes', (req, res) => {

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query('select id_route, name_route from CA_ROUTES ', function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordsets[0]);
          
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/autobus-get-active-banks', (req, res) => {

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query('select * from CA_BANKS where is_active = 1', function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordsets[0]);
          
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/autobus-get-buses-by-owner', (req, res) => {

    var body = req.body;

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query('exec procGetBusesByOwnerId ' + body.id_owner, function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordsets[0]);
          
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/autobus-get-pilots-by-owner', (req, res) => {

    var body = req.body;

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query('exec procGetPilotsByOwnerId ' + body.id_owner, function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordsets[0]);
          
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/autobus-subscribe-bus', (req, res) => {
    
    var body = req.body;

    //console.log(body);

    var sql = require("mssql");

    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
    
        request.query("exec procSubscribeBus " + 
                body.id_route + ", "+
                body.id_owner + ", "+
            "'"+body.bus_brand + "', " +
            "'"+body.bus_model + "', " + 
                body.bus_year + ", " +                
            "'"+body.bus_enrollment+"',"+
                body.bus_color + "," +
            "'"+body.bus_code+"'",
            function (err, recordset) {
            
                if (err) console.log(err);

                // send records as a response
                sql.close();

                var myJsonString = JSON.stringify(recordset.recordset[0]);
            
                res.status(200).send(myJsonString);
            });
    });
});

app.post('/autobus-edit-bus', (req, res) => {
    
    var body = req.body;

    //console.log(body);

    var sql = require("mssql");

    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
    
        request.query("exec procEditBus " +
                body.id_bus + ", "+ 
                body.id_route + ", "+
                body.id_owner + ", "+
            "'"+body.bus_brand + "', " +
            "'"+body.bus_model + "', " + 
                body.bus_year + ", " +                
            "'"+body.bus_enrollment+"',"+
                body.bus_color + "," +
            "'"+body.bus_code+"',"
               +body.is_active,

            function (err, recordset) {
            
                if (err) console.log(err);

                // send records as a response
                sql.close();

                var myJsonString = JSON.stringify(recordset.recordset[0]);
            
                res.status(200).send(myJsonString);
            });
    });
});

app.post('/autobus-subscribe-pilot', (req, res) => {
    
    var body = req.body;

    //console.log(body);

    var sql = require("mssql");

    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();

        request.query("exec procSubscribePilot " + 
            "'"+body.pilot_name + "', " +
            "'"+body.pilot_licence + "', " +   
            "'"+body.pilot_phone + "',"+
                body.id_bus,
            function (err, recordset) {
            
                if (err) console.log(err);

                // send records as a response
                sql.close();

                var myJsonString = JSON.stringify(recordset.recordset[0]);
            
                res.status(200).send(myJsonString);
            });
    });
});

app.post('/autobus-edit-pilot', (req, res) => {
    
    var body = req.body;

    //console.log(body);

    var sql = require("mssql");

    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();

        request.query("exec procEditPilot " +
                body.id_pilot +
            ",'"+body.pilot_name + "', " +
            "'"+body.pilot_licence + "', " +   
            "'"+body.pilot_phone + "',"+
                body.id_bus +
            ",'"+body.lisence_type + "',"+
                body.is_active ,
            function (err, recordset) {
            
                if (err) console.log(err);

                // send records as a response
                sql.close();

                var myJsonString = JSON.stringify(recordset.recordset[0]);
            
                res.status(200).send(myJsonString);
            });
    });
});

app.post('/autobus-subscribe-bank_account', (req, res) => {
    
    var body = req.body;

    //console.log(body);

    var sql = require("mssql");

    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();

        request.query("exec procSubscribeBankAccount " + 
                body.id_owner + ", " +
                body.id_bank + ", " +   
            "'"+body.number_account + "',"+
            "'"+body.name_bank_account+ "'",
            function (err, recordset) {
            
                if (err) console.log(err);

                // send records as a response
                sql.close();

                var myJsonString = JSON.stringify(recordset.recordset[0]);
            
                res.status(200).send(myJsonString);
            });
    });
});

app.post('/autobus-main-get-cycle-data', (req, res) => {
    
    var body = req.body;

    console.log(body);

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query('exec procGetCycleData ' + body.id_bus + ", " + body.id_pilot + ", " + body.cycle, function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset[0]);
          
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/autobus-get-today-cycles-data', (req, res) => {

    var body = req.body;

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();


    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query('exec procGetCyclesDataToday ' + body.id_bus + ', ' + body.id_pilot, function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordsets);
          
            res.status(200).send(myJsonString);
        });
    });
});

//TEMPORAL TIKETS
app.post('/autobus-get-last-hundread-tickets', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    
    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query('exec procGetLastHundreadTikets', function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordsets[0]);
          
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/autobus-generate-thousand-tickets', (req, res) => {

    var autorized_user = req.body.usr;
    var autorized_pass = req.body.pass;

    if(!(autorized_user == "wachita" && autorized_pass == "micromachine")){
        res.status(200).send(JSON.stringify('{"result":"USER OR PASS NOT AUTORIZED."}'));
    }
    else{
        var sql = require("mssql");

        // config for your database
        var config = {
            user: 'admin',
            password: 'queremencuentle',
            server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
            database: 'AUTOBUS_DB',
            port: 1433
        };
    
        sql.close();
    
        sql.connect(config, function (err) {
        
            if (err) console.log(err);
    
            var request = new sql.Request();
               
            var query = "DECLARE @count INT = 0;\
            WHILE @count < 100\
            BEGIN	    \
            EXEC procGenerateTemporalTickets\
            WAITFOR DELAY '00:00:00.100'\
            SET @count = @count + 1\
            END";

            request.query(query, function (err, recordset) {
                
                if (err) console.log(err);
    
                // send records as a response
                sql.close();

                var ret = '{"status_code":"DONE"}';

                JSON.parse(ret);

                var myJsonString = JSON.stringify(ret);
              
                res.status(200).send(myJsonString);
            });
        });
    }
   
});

app.post('/autobus-get-buses-totales-today-by-owner', (req, res) => {

    var body = req.body;

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query('exec procGetBusTotalesToday ' + body.id_owner, function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordsets[0]);
          
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/autobus-get-total-money-last-seven-days', (req, res) => {

    var body = req.body;

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query('exec procGetTotalesMoneyLastSevenDays ' + body.id_owner, function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordsets[0]);
          
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/autobus-get-total-money-buses-last-30-days', (req, res) => {

    var body = req.body;

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query('exec procGetTotalMoneyBusesLast30Days ' + body.id_owner, function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordsets[0]);
          
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/autobus-make-owner-payments', (req, res) => {
    
    var body = req.body;

    console.log(body);

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
        
        request.query('exec procMakeOwnerPayment ' +
                        body.id_owner + ', ' + 
                        body.id_bank_account + ', \'' + 
                        body.date_period_payment + '\', ' + 
                        body.amount_payment + ', \'' + 
                        body.reference_payment + '\', ' +
                        body.id_system_user , function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset[0]);
          
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/autobus-get-payment_by_id', (req, res) => {

    var body = req.body;

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query('exec procGetPaymentById ' + body.id_payment, function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset[0]);
          
            res.status(200).send(myJsonString);
        });
    });
});

app.post('/autobus-get-owners-by-filter', (req, res) => {

    var body = req.body;

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AUTOBUS_DB',
        port: 1433
    };

    sql.close();

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        request.query('exec procGetOwnersByFilterName ' + '\'' + req.body.filter_name + '\'', function (err, recordset) {
            
            if (err) console.log(err);

            // send records as a response
            sql.close();

            var myJsonString = JSON.stringify(recordset.recordsets[0]);
          
            res.status(200).send(myJsonString);
        });
    });
});

//FINALIZAN METODOS DE AUTOBUS---------------------------------------------------------------------------------

//GET USER_ADMIN AGA_DB
app.post('/AGA_DB_User', (req, res) => {

    var alias_user = req.body.alias_user;
    var pass_user = req.body.pass_user;

    console.log(alias_user);

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB',
        port: 1433
    };

    sql.close();
    
    sql.connect(config, function (err) {

        if (err) console.log(err);

        var request = new sql.Request();
            
        var query = "select count(id_user)[RESULT],u.name_full,u.alias_user\
                        from tbuser u \
                        where u.alias_user = " + "'" + alias_user + "'" +
                        "and u.pass_user = " + "'"+ pass_user +"' and u.is_active = 1 " +
                        "group by u.name_full, u.alias_user";

        console.log(query);

        request.query(query, function (err, recordset) {
            
            if (err) console.log(err)

            sql.close();

            var myJsonString = JSON.stringify(recordset.recordset[0]);
            
            console.log(recordset.recordset);

            res.status(200).send(myJsonString);
            
        });

    });

});

//INSERT A NEW USER IN DB 
app.post('/AGA_DB_User_New', (req, res) => {

    var full_name_user = req.body.f_n;
    var alias_user = req.body.a_u;
    var pass_user = req.body.p_u;
    var nivel_user = req.body.n_u;
    var active_user = req.body.ac_u;
    
    var sql = require("mssql");
    
    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AGA_DB',
        port: 1433
    };
    
    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
    
        var query = "BEGIN TRY INSERT INTO tbUser (name_full, alias_user, pass_user, nivel_user, is_active)\
        VALUES("+"'"+full_name_user+"'"+","
            +"'"+alias_user+"'"+","
            +"'"+pass_user+"'"+","
            +nivel_user+"," +active_user+") SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH";
    
    
        console.log(query);
    
    
        // query to the database and get the records
        request.query(query, function (err, recordset) {
        
        if (err) console.log(err)
    
    
        // send records as a response
        sql.close();
    
        var myJsonString = JSON.stringify(recordset.recordset[0]);
        
        res.status(200).send(myJsonString);
        
        });
    
    
    });
    
    
});

app.post('/AGA_DB_User_All', (req, res) => {
    
    var sql = require("mssql");
    
    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AGA_DB',
        port: 1433
    };
    
    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
    
        var query = "SELECT * FROM tbUser order by alias_user";

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

app.post('/AGA_DB_User_By_Alias_Like', (req, res) => {

    var criteria = req.body.criteria;

    var sql = require("mssql");
    
    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AGA_DB',
        port: 1433
    };
    
    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
    
        var query = "SELECT * FROM tbUser WHERE alias_user like '%" + criteria + "%'";

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

app.post('/AGA_DB_User_By_Alias', (req, res) => {

    var criteria = req.body.criteria;

    var sql = require("mssql");
    
    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AGA_DB',
        port: 1433
    };
    
    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
    
        //var query = "SELECT * FROM tbUser WHERE alias_user like '" + criteria + "'";
	var query = "SELECT * FROM tbUser WHERE is_active=1 and alias_user like '" + criteria + "'";
	

        console.log(query);

        // query to the database and get the records
        request.query(query, function (err, recordset) {
        
        if (err) console.log(err)
    
    
        // send records as a response
        sql.close();
    
        var myJsonString = JSON.stringify(recordset.recordset[0]);
        
        res.status(200).send(myJsonString);
        
        });
    
    
    });
    
    
});
    
app.post('/AGA_DB_User_Update', (req, res) => {

    var full_name_user = req.body.f_n;
    var alias_user = req.body.a_u;
    var pass_user = req.body.p_u;
    var nivel_user = req.body.n_u;
    var active_user = req.body.ac_u;
    var id_user = req.body.id_u;

    var sql = require("mssql");
    
    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AGA_DB',
        port: 1433
    };
    
    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
    
        var query = "BEGIN TRY UPDATE tbUser\
            SET name_full = "+"'"+full_name_user+"'"+","
            +"alias_user = '"+alias_user+"'"+","
            +"pass_user = '"+pass_user+"'"+","
            +"nivel_user = " + nivel_user+"," 
            +"is_active = "+active_user + 
             " WHERE id_user =  " + id_user + " SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH";
    
        console.log(query);

        // query to the database and get the records
        request.query(query, function (err, recordset) {
        
        if (err) console.log(err)
            
        // send records as a response
        sql.close();
    
        var myJsonString = JSON.stringify(recordset.recordset[0]);
        
        res.status(200).send(myJsonString);
        
        });
    
    
    });
    
    
});

app.post('/AGA_DB_Beneficiario_All', (req, res) => {

    var sql = require("mssql");
    
    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AGA_DB',
        port: 1433
    };
    
    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
    
        var query = "SELECT * FROM tbBeneficiarios order by nombre_completo";

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

app.post('/AGA_DB_Beneficiario_By_Nombre', (req, res) => {

    var criteria = req.body.criteria;

    var sql = require("mssql");
    
    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AGA_DB',
        port: 1433
    };
    
    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
    
        var query = "SELECT * FROM tbBeneficiarios WHERE nombre_completo like '" + criteria + "'";

        console.log(query);

        // query to the database and get the records
        request.query(query, function (err, recordset) {
        
        if (err) console.log(err)
    
    
        // send records as a response
        sql.close();
    
        var myJsonString = JSON.stringify(recordset.recordset[0]);
        
        res.status(200).send(myJsonString);
        
        });
    
    
    });
    
    
});

app.post('/AGA_DB_Beneficiario_By_Convenio', (req, res) => {

    var criteria = req.body.criteria;

    var sql = require("mssql");
    
    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AGA_DB',
        port: 1433
    };
    
    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
    
        var query = "SELECT *, convert(nvarchar(10),format(fecha_nacimiento,'MM/dd/yyyy'))[fecha_nacimiento_string],\
        convert(nvarchar(10),format(fecha_suscripcion,'MM/dd/yyyy'))[fecha_suscripcion_string]\
        FROM tbBeneficiarios WHERE codigo_convenio like '" + criteria + "'";

        console.log(query);

        // query to the database and get the records
        request.query(query, function (err, recordset) {
        
        if (err) console.log(err)
    
    
        // send records as a response
        sql.close();
    
        var myJsonString = JSON.stringify(recordset.recordset[0]);
        
        res.status(200).send(myJsonString);
        
        });
    
    
    });
    
    
});

app.post('/AGA_DB_Beneficiario_By_Nombre_Like', (req, res) => {

    var criteria = req.body.criteria;

    var sql = require("mssql");
    
    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AGA_DB',
        port: 1433
    };
    
    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
    
        var query = "SELECT * FROM tbBeneficiarios WHERE nombre_completo like '%" + criteria + "%'";

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

app.post('/AGA_DB_Beneficiario_New', (req, res) => {

    var codigo_convenio = req.body.codigo_convenio;
    var nombre_completo = req.body.nombre_completo;
    var dpi = req.body.dpi;
    var telefono = req.body.telefono;
    var direccion = req.body.direccion;
    var email = req.body.email;
    var fecha_nacimiento = req.body.fecha_nacimiento;
    var nacionalidad = req.body.nacionalidad;
    var estado_civil = req.body.estado_civil;
    var profesion_oficio = req.body.profesion_oficio;
    var genero = req.body.genero;
    var fecha_suscripcion = req.body.fecha_suscripcion;
    var usuario = req.body.usuario;
    var is_active = req.body.is_active;

    var sql = require("mssql");
    
    // config for your database
    var config = {
        user: 'admin',
        password: 'queremencuentle',
        server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
        database: 'AGA_DB',
        port: 1433
    };
    
    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
    
        var query = "BEGIN TRY INSERT INTO dbo.tbBeneficiarios\
                    (codigo_convenio\
                    ,nombre_completo\
                    ,dpi\
                    ,telefono\
                    ,direccion\
                    ,email\
                    ,fecha_nacimiento\
                    ,nacionalidad\
                    ,estado_civil\
                    ,profesion_oficio\
                    ,genero\
                    ,fecha_suscripcion\
                    ,usuario\
                    ,is_active)\
                    VALUES("+
                    "'"+codigo_convenio+"'"+","
                    +"'"+nombre_completo+"'"+","
                    +"'"+dpi+"'"+","
                    +"'"+telefono+"'"+","
                    +"'"+direccion+"'"+","
                    +"'"+email+"'"+","
                    +"'"+fecha_nacimiento+"'"+","
                    +"'"+nacionalidad+"'"+","
                    +"'"+estado_civil+"'"+","
                    +"'"+profesion_oficio+"'"+","
                    +"'"+genero+"'"+","
                    +"'"+fecha_suscripcion+"'"+","
                    +"'"+usuario+"'"+","
                    +"'"+is_active+"'"
                    +") SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH";
    
    
        console.log(query);
    
    
        // query to the database and get the records
        request.query(query, function (err, recordset) {
        
        if (err) console.log(err)
    
    
        // send records as a response
        sql.close();
    
        var myJsonString = JSON.stringify(recordset.recordset[0]);
        
        res.status(200).send(myJsonString);
        
        });
    
    
    });
    
    
});


app.post('/AGA_DB_Beneficiario_Update', (req, res) => { 

	var codigo_convenio = req.body.codigo_convenio; 
	var nombre_completo = req.body.nombre_completo; 
	var dpi = req.body.dpi; 
	var telefono = req.body.telefono; 
	var direccion = req.body.direccion; 
	var email = req.body.email; 
	var fecha_nacimiento = req.body.fecha_nacimiento; 
	var nacionalidad = req.body.nacionalidad; 
	var estado_civil = req.body.estado_civil; 
	var profesion_oficio = req.body.profesion_oficio; 
	var genero = req.body.genero; 
	var fecha_suscripcion = req.body.fecha_suscripcion; 
	var usuario = req.body.usuario; 
	var is_active = req.body.is_active; 
	var id_beneficiarios = req.body.id_beneficiarios;

	var sql = require("mssql");
    
    // config for your database
    var config = { 
	user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB', 
	port: 1433
    };
    
    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
    
        var query = "BEGIN TRY UPDATE tbBeneficiarios\
			SET codigo_convenio = "+"'"+codigo_convenio+"'"+"," 
		+"nombre_completo = '"+nombre_completo+"'"+"," 
		+"dpi = " +dpi+"," 
		+"telefono = " +telefono+"," 
		+"direccion = '"+direccion+"'"+"," 
		+"email = '"+email+"'"+"," 
		+"fecha_nacimiento = '"+fecha_nacimiento+"'"+"," 
		+"nacionalidad = '"+nacionalidad+"'"+"," 
		+"estado_civil = '"+estado_civil+"'"+"," 
		+"profesion_oficio = '"+profesion_oficio+"'"+"," 
		+"genero = '"+genero+"'"+"," 
		+"fecha_suscripcion = '"+fecha_suscripcion+"'"+"," 
		+"usuario =  '"+usuario+"'"+","
		+"is_active = "+is_active +
	        " WHERE id_beneficiarios = " + id_beneficiarios + " SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH";
    
        console.log(query);

        // query to the database and get the records
        request.query(query, function (err, recordset) {
        
        if (err) console.log(err)

        // send records as a response
        sql.close();
    
        var myJsonString = JSON.stringify(recordset.recordset[0]);

        res.status(200).send(myJsonString);

        });
    });

});



app.post('/AGA_DB_Tarjeta_New', (req, res) => { 

	var codigo_convenio = req.body.codigo_convenio; 
	var no_tarjeta = req.body.no_tarjeta; 
   	var banco_emisor = req.body.banco_emisor; 
	var fecha_vencimiento = req.body.fecha_vencimiento; 
	var fecha_corte = req.body.fecha_corte; 
	var fecha_pago = req.body.fecha_pago; 
	var fecha_corte_dia = req.body.fecha_corte_dia; 
	var fecha_pago_dia = req.body.fecha_pago_dia; 
	var monto_deuda = req.body.monto_deuda; 
	var plazos = req.body.plazos; 
	var donacion = req.body.donacion; 
	var donacion_mensual = req.body.donacion_mensual; 
	var cuota_mensual = req.body.cuota_mensual; 
	var total_cuota = req.body.total_cuota; 
	var total_pagar = req.body.total_pagar; 
	var saldo_pendiente = req.body.saldo_pendiente; 
	var limite_tarjeta = req.body.limite_tarjeta; 
	var usuario = req.body.usuario; 
	var is_active = req.body.is_active; 

	var sql = require("mssql");
    
    // config for your database
    var config = { 
	user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB', 
	port: 1433
    };
 
    sql.close();
    // connect to your database
    sql.connect(config, function (err) {

        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();

        var query = "BEGIN TRY INSERT INTO dbo.tbTarjetas\
			(codigo_convenio\
			,no_tarjeta\
			,banco_emisor\
			,fecha_vencimiento\
                    	,fecha_corte\
			,fecha_pago\
			,fecha_corte_dia\
			,fecha_pago_dia\
			,monto_deuda\
			,plazos\
			,donacion\
			,donacion_mensual\
			,cuota_mensual\
			,total_cuota\
                    	,total_pagar\
			,saldo_pendiente\
			,limite_tarjeta\
			,usuario\
			,is_active)\
			VALUES("+
			"'"+codigo_convenio+"'"+","
			+"'"+no_tarjeta+"'"+","
			+"'"+banco_emisor+"'"+","
			+"'"+fecha_vencimiento+"'"+","
			+"'"+fecha_corte+"'"+","
			+"'"+fecha_pago+"'"+","
			+"'"+fecha_corte_dia+"'"+","
			+"'"+fecha_pago_dia+"'"+","
			+"'"+monto_deuda+"'"+","
			+"'"+plazos+"'"+","
			+"'"+donacion+"'"+","
			+"'"+donacion_mensual+"'"+","
			+"'"+cuota_mensual+"'"+","
			+"'"+total_cuota+"'"+","
			+"'"+total_pagar+"'"+","
			+"'"+saldo_pendiente+"'"+","
			+"'"+limite_tarjeta+"'"+","
                    	+"'"+usuario+"'"+","
			+"'"+is_active+"'"
			+") SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT  ERROR_MESSAGE()[RESULTADO] END CATCH";


        console.log(query);


        // query to the database and get the records
        request.query(query, function (err, recordset) {

        if (err) console.log(err)


        // send records as a response
        sql.close();
        var myJsonString = JSON.stringify(recordset.recordset[0]);

        res.status(200).send(myJsonString);
        });
    });
});



app.post('/AGA_DB_Tarjeta_By_Nombre_Like', (req, res) => { 

	var criteria = req.body.criteria; 
	var sql = require("mssql");

    // config for your database
    var config = { 
	user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB', 
	port: 1433
    };

    sql.close();
    // connect to your database
   sql.connect(config, function (err) {
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();

        var query = "SELECT * FROM tbTarjetas WHERE is_active = 1 AND codigo_convenio like '" + criteria + "'";

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

app.post('/AGA_DB_Tarjeta_By_NoTarjeta_Like', (req, res) => {

	var criteria = req.body.criteria;

	var sql = require("mssql");

    // config for your database
    var config = { 
	user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB', 
	port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {

        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();

	//var query = "SELECT * FROM tbTarjetas WHERE is_active=1 and no_tarjeta like '" + criteria + "'";


	//var query = "SELECT *, convert(nvarchar(10),format(fecha_corte,'dd'))[fecha_corte_string],\
	//convert(nvarchar(10),format(fecha_pago,'dd'))[fecha_pago_string]\
	//FROM tbTarjetas WHERE is_active=1 and no_tarjeta like  '" + criteria + "'";

//	var query = "SELECT *, datediff(day, fecha_corte ,getdate()) AS DiffDate,\
//	convert(nvarchar(10),format(fecha_corte,'dd'))[fecha_corte_string], convert(nvarchar(10),format(fecha_pago,'dd'))[fecha_pago_string]\
//	from tbTarjetas WHERE is_active=1 and no_tarjeta like '" + criteria + "'";


	//var query = "select *, convert(nvarchar(10),format(fecha_corte,'dd'))[fecha_corte_string], convert(nvarchar(10),format(fecha_pago,'dd'))[fecha_pago_string], \
	//datediff(day, DAY(fecha_corte), DAY(CURRENT_TIMESTAMP)) AS DiffDay \
	//from tbTarjetas  WHERE is_active=1 and no_tarjeta like  '" + criteria + "'";


	var query ="SELECT *, convert(nvarchar(10),format(fecha_corte,'dd'))[fecha_corte_string], convert(nvarchar(10),format(fecha_pago,'dd'))[fecha_pago_string],\
	datediff(DAY , CONCAT(FORMAT(GETDATE(),'yyyy-MM-'), format(fecha_corte, 'dd')), GETDATE()) AS DiffDay \
	FROM tbTarjetas WHERE is_active=1 and no_tarjeta like '" + criteria + "'";






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



app.post('/AGA_DB_Tarjeta_Update', (req, res) => {

	var codigo_convenio = req.body.codigo_convenio;
	var no_tarjeta = req.body.no_tarjeta;
	var banco_emisor = req.body.banco_emisor;
	var fecha_vencimiento = req.body.fecha_vencimiento;
	var fecha_corte = req.body.fecha_corte;
	var fecha_pago = req.body.fecha_pago;
	var fecha_corte_dia = req.body.fecha_corte_dia;
	var fecha_pago_dia = req.body.fecha_pago_dia;
	var monto_deuda = req.body.monto_deuda;
	var plazos = req.body.plazos;
	var donacion = req.body.donacion;
	var donacion_mensual = req.body.donacion_mensual;
	var cuota_mensual = req.body.cuota_mensual;
	var total_cuota = req.body.total_cuota;
	var total_pagar = req.body.total_pagar;
	var saldo_pendiente = req.body.saldo_pendiente;
	var limite_tarjeta = req.body.limite_tarjeta; 
	var usuario = req.body.usuario;
	var is_active = req.body.is_active;
	var id_tarjetas = req.body.id_tarjetas;

	var sql = require("mssql");

    // config for your database
    var config = { user: 'admin',
	password: 'queremencuentle',
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
	database: 'AGA_DB',
	port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {
 

        if (err) console.log(err);
        // create Request object

        var request = new sql.Request();
 

        var query = "BEGIN TRY UPDATE tbTarjetas\
			SET codigo_convenio = "+"'"+codigo_convenio+"'"+","
			+"no_tarjeta = "+ no_tarjeta +","
			+"banco_emisor = '"+banco_emisor+"'"+","
			+"fecha_vencimiento = '"+fecha_vencimiento+"'"+","
			+"fecha_corte = '"+fecha_corte+"'"+","
			+"fecha_pago = '"+fecha_pago+"'"+","
			+"fecha_corte_dia = '"+fecha_corte_dia+"'"+","
			+"fecha_pago_dia = '"+fecha_pago_dia+"'"+","
			+"monto_deuda = '"+monto_deuda+"'"+","
			+"plazos = '"+plazos+"'"+","
			+"donacion = '"+donacion+"'"+","
			+"donacion_mensual = '"+donacion_mensual+"'"+","
			+"cuota_mensual = '"+cuota_mensual+"'"+","
			+"total_cuota = '"+total_cuota+"'"+","
			+"total_pagar = '"+total_pagar+"'"+","
			+"saldo_pendiente = '"+saldo_pendiente+"'"+","
			+"limite_tarjeta = '"+limite_tarjeta+"'"+","
			+"usuario = '"+usuario+"'"+","
			+"is_active = "+is_active +
			" WHERE id_tarjetas = " + id_tarjetas + " SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH";

        console.log(query);
        // query to the database and get the records
        request.query(query, function (err, recordset) {

        if (err) console.log(err)

        // send records as a response
        sql.close();

        var myJsonString = JSON.stringify(recordset.recordset[0]);

	res.status(200).send(myJsonString);

        });

    });

});


app.post('/AGA_DB_Tarjeta_By_NoConvenio_IsActive', (req, res) => {

    	var criteria = req.body.criteria; 
	var sql = require("mssql");

   // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB', 
	port: 1433
    };
    
    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
    
        var query = "SELECT * FROM tbTarjetas WHERE is_active=1 and codigo_convenio like '" + criteria + "'"; console.log(query);
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


app.post('/AGA_DB_Tarjeta_Alerta_Fecha_Pago', (req, res) => { 

	var criteria1 = req.body.criteria1;
	var criteria2 = req.body.criteria2;

	var sql = require("mssql");

    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB', 
	port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {

        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();


	var query = "SELECT tbBeneficiarios.codigo_convenio, tbBeneficiarios.nombre_completo, tbTarjetas.no_tarjeta, tbTarjetas.fecha_pago, tbTarjetas.fecha_pago_dia FROM tbBeneficiarios\
	JOIN tbTarjetas ON tbTarjetas.codigo_convenio = tbBeneficiarios.codigo_convenio\
	WHERE tbTarjetas.fecha_pago_dia >= " + "'" + criteria1 + "'" +
	"AND tbTarjetas.fecha_pago_dia <= " + "'"+ criteria2 +"' AND tbTarjetas.is_active = 1 " +
	"ORDER BY fecha_pago ASC";

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


app.post('/AGA_DB_Tarjeta_Alerta_Fecha_Corte', (req, res) => {

	var criteria1 = req.body.criteria1;
	var criteria2 = req.body.criteria2;

	var sql = require("mssql");

    // config for your database
    var config = { user: 'admin',
		password: 'queremencuentle',
		server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
		database: 'AGA_DB',
		port: 1433
    		};

    sql.close();

	 // connect to your database
	    sql.connect(config, function (err) {

	if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

		var query = "SELECT tbBeneficiarios.codigo_convenio, tbBeneficiarios.nombre_completo, tbTarjetas.no_tarjeta, tbTarjetas.fecha_corte, tbTarjetas.fecha_corte_dia FROM tbBeneficiarios\
		JOIN tbTarjetas ON tbTarjetas.codigo_convenio = tbBeneficiarios.codigo_convenio\
		WHERE tbTarjetas.fecha_corte_dia >= " + "'" + criteria1 + "'" +
		"AND tbTarjetas.fecha_corte_dia <= " + "'"+ criteria2 +"' AND tbTarjetas.is_active = 1 " +
		"ORDER BY fecha_corte ASC";

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



app.post('/AGA_DB_Abono_Tarjeta_By_NoTarjeta_Like', (req, res) => { 

	var criteria = req.body.criteria; 

	var sql = require("mssql");

	// config for your database
	var config = { 
	user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB',
	 port: 1433
    	};

	sql.close();

	// connect to your database
    	sql.connect(config, function (err) {

	if (err) console.log(err);

       // create Request object
        var request = new sql.Request();

	var query = "SELECT * FROM tbHistorico_Abono_Beneficiario WHERE is_active=1 and no_tarjeta like '" + criteria + "'";

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



app.post('/AGA_DB_Abono_Tarjeta_New', (req, res) => {

	var codigo_convenio = req.body.codigo_convenio;
	var no_tarjeta = req.body.no_tarjeta;
	var saldo = req.body.saldo;
	var cuota_mensual = req.body.cuota_mensual;
	var nuevo_saldo = req.body.nuevo_saldo;
	var fecha_abono = req.body.fecha_abono;
	var no_deposito = req.body.no_deposito;
	var banco_emisor = req.body.banco_emisor;
	var monto_deuda = req.body.monto_deuda;
	var usuario = req.body.usuario;
	var is_active = req.body.is_active;

	var sql = require("mssql");

    // config for your database
    var config = {
	user: 'admin',
	password: 'queremencuentle',
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
	database: 'AGA_DB',
    	port: 1433
    };

    sql.close();
 
	// connect to your database

	 sql.connect(config, function (err) {

	if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

	var query = "BEGIN TRY INSERT INTO dbo.tbHistorico_Abono_Beneficiario\
		(codigo_convenio\
		,no_tarjeta\
		,saldo\
		,cuota_mensual\
		,nuevo_saldo\
		,fecha_abono\
		,no_deposito\
		,banco_emisor\
		,monto_deuda\
		,usuario\
            	,is_active)\
		VALUES("+
		"'"+codigo_convenio+"'"+","
		+"'"+no_tarjeta+"'"+","
		+"'"+saldo+"'"+","
		+"'"+cuota_mensual+"'"+","
		+"'"+nuevo_saldo+"'"+","
		+"'"+fecha_abono+"'"+","
		+"'"+no_deposito+"'"+","
		+"'"+banco_emisor+"'"+","
		+"'"+monto_deuda+"'"+","
		+"'"+usuario+"'"+","
		+"'"+is_active+"'"
		+") SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH";

        console.log(query);

        // query to the database and get the records
        request.query(query, function (err, recordset) { 

	if (err) console.log(err)

        // send records as a response

        sql.close(); 

	var myJsonString = JSON.stringify(recordset.recordset[0]); 
	res.status(200).send(myJsonString);
        });
    });
});

app.post('/AGA_DB_Abono_Tarjeta_By_Id_Like', (req, res) => {

    	var criteria = req.body.criteria; 

	var sql = require("mssql");

	// config for your database
    var config = {
	user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB',
	port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) {

	if (err) console.log(err);
        // create Request object

	var request = new sql.Request(); 

	var query = "SELECT * FROM tbHistorico_Abono_Beneficiario WHERE is_active=1 and id_abono_beneficiario like '" + criteria + "'";

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

app.post('/AGA_DB_User_By_Alias_Admin', (req, res) => { 

	var criteria = req.body.criteria; 
	
	var sql = require("mssql");
    
    // config for your database
    var config = { 
	user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB', 
	port: 1433
    };
    
    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
 
        var query = "SELECT * FROM tbUser WHERE is_active=1 and alias_user like '" + criteria + "'"; 
        console.log(query);
        // query to the database and get the records
        request.query(query, function (err, recordset) {
 
        if (err) console.log(err)

 
        // send records as a response
        sql.close();

        var myJsonString = JSON.stringify(recordset.recordset[0]);

        res.status(200).send(myJsonString);

        });
    });
});

app.post('/AGA_DB_Abono_Tarjeta_Update', (req, res) => {


    	var codigo_convenio = req.body.codigo_convenio;
	var no_tarjeta = req.body.no_tarjeta;
	var saldo = req.body.saldo;
	var cuota_mensual  = req.body.cuota_mensual;
	var nuevo_saldo = req.body.nuevo_saldo;
	var fecha_abono = req.body.fecha_abono;
	var no_deposito = req.body.no_deposito;
	var banco_emisor = req.body.banco_emisor;
	var monto_deuda = req.body.monto_deuda;
	var usuario = req.body.usuario;
	var is_active = req.body.is_active;
	var id_abono_beneficiario = req.body.id_abono_beneficiario

	var sql =  require("mssql");

    // config for your database
    var config = {
		user: 'admin',
		password: 'queremencuentle',
		server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
	        database: 'AGA_DB',
		port: 1433
   		 };

	    sql.close();
    // connect to your database
    sql.connect(config, function (err) {

	if (err) console.log(err);

	// create Request object
        var request = new sql.Request();

		var query = "BEGIN TRY UPDATE tbHistorico_Abono_Beneficiario\
			SET codigo_convenio = "+"'"+codigo_convenio+"'"+","
			+"no_tarjeta = "+ no_tarjeta +","
			+"saldo = '"+saldo+"'"+","
			+"cuota_mensual = '"+cuota_mensual+"'"+","
			+"nuevo_saldo = '"+nuevo_saldo+"'"+","
			+"fecha_abono = '"+fecha_abono+"'"+","
			+"no_deposito = '"+no_deposito+"'"+","
			+"banco_emisor = '"+banco_emisor+"'"+","
			+"monto_deuda = '"+monto_deuda+"'"+","
			+"usuario = '"+usuario+"'"+","
			+"is_active = "+is_active +
			" WHERE id_abono_beneficiario = " + id_abono_beneficiario + " SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT  ERROR_MESSAGE()[RESULTADO] END CATCH";


		console.log(query); 

        // query to the database and get the records

        request.query(query, function (err, recordset) { 


        if (err) console.log(err)
        // send records as a response
        sql.close(); 
	var myJsonString = JSON.stringify(recordset.recordset[0]);

	   res.status(200).send(myJsonString);

        });
    });
});



app.post('/AGA_DB_Abono_SUM_Cuota_Mensual_Id_Like', (req, res) => { 

	var criteria = req.body.criteria; 
	var sql = require("mssql");

    // config for your database
    	var config = { 
		user: 'admin', 
		password: 'queremencuentle', 
		server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
		database: 'AGA_DB',
		port: 1433
    };
    sql.close();

    // connect to your database
   	 sql.connect(config, function (err) { 

	if (err) console.log(err);

        // create Request object
        	var request = new sql.Request(); 

		var query = "SELECT SUM(cuota_mensual) as Suma_Cuota_Total FROM tbHistorico_Abono_Beneficiario WHERE is_active=1 and no_tarjeta like '" + criteria + "'";

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


app.post('/AGA_DB_Financiamiento_Tarjeta_By_Id_Like', (req, res) => { 

	var criteria = req.body.criteria;

	var sql = require("mssql");

    // config for your database
    var config = { 
	user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB',
	port: 1433
    };

    sql.close();
    // connect to your database
    sql.connect(config, function (err) {

	if (err) console.log(err);
	 // create Request object
        var request = new sql.Request(); 

	var query = "SELECT * FROM tbFinanciamiento WHERE is_active=1 and id_financiamiento like '" + criteria + "' order by no_tarjeta, codigo_tc";

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


app.post('/AGA_DB_Financiamiento_Tarjeta_New', (req, res) => { 
	var codigo_convenio = req.body.codigo_convenio; 
	var no_tarjeta = req.body.no_tarjeta; 
	var tipo = req.body.tipo; 
	var total_financiamiento = req.body.total_financiamiento; 
	var monto_financiamiento_mensual = req.body.monto_financiamiento_mensual; 
	var no_cuotas_pendientes = req.body.no_cuotas_pendientes; 
	var codigo_tc = req.body.codigo_tc; 
	var usuario = req.body.usuario; 
	var is_active = req.body.is_active; 

	var sql = require("mssql");

    // config for your database
    	var config = {
		user: 'admin',
		password: 'queremencuentle',
		server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
		database: 'AGA_DB',
		 port: 1433
		 };
 
    sql.close();
    // connect to your database
	    sql.connect(config, function (err) { 
		if (err) console.log(err);
        // create Request object

		var request = new sql.Request(); 

		var query = "BEGIN TRY INSERT INTO dbo.tbFinanciamiento\
			(codigo_convenio\
			,no_tarjeta\
			,tipo\
			,total_financiamiento\
			,monto_financiamiento_mensual\
			,no_cuotas_pendientes\
			,codigo_tc\
			,usuario\
			,is_active)\
			VALUES("+
			"'"+codigo_convenio+"'"+","
			+"'"+no_tarjeta+"'"+","
			+"'"+tipo+"'"+","
			+"'"+total_financiamiento+"'"+","
			+"'"+monto_financiamiento_mensual+"'"+","
			+"'"+no_cuotas_pendientes+"'"+","
			+"'"+codigo_tc+"'"+","
			+"'"+usuario+"'"+","
			+"'"+is_active+"'" +") SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH";

	        console.log(query);
        // query to the database and get the records
        request.query(query, function (err, recordset) { 
		if (err) console.log(err)
        // send records as a response
        sql.close(); 
	var myJsonString = JSON.stringify(recordset.recordset[0]); 
	res.status(200).send(myJsonString);
        });
    });
});






app.post('/AGA_DB_Financiamiento_Tarjeta_By_NoTarjeta_Like', (req, res) => { 

	var criteria = req.body.criteria; 
	var sql = require("mssql");

    // config for your database
    var config = { 
		user: 'admin', 
		password: 'queremencuentle', 
		server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
		database: 'AGA_DB',
		port: 1433
    		};

    sql.close();
 
	 // connect to your database
	    sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
 
	var request = new sql.Request(); 
	var query = "SELECT * FROM tbFinanciamiento WHERE is_active=1 and no_tarjeta like '" + criteria + "' order by no_tarjeta, codigo_tc";

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

app.post('/AGA_DB_Financiamiento_Tarjeta_Update', (req, res) => {

	var codigo_convenio = req.body.codigo_convenio;
	var no_tarjeta = req.body.no_tarjeta;
	var tipo = req.body.tipo;
	var total_financiamiento = req.body.total_financiamiento;
	var monto_financiamiento_mensual = req.body.monto_financiamiento_mensual;
	var no_cuotas_pendientes = req.body.no_cuotas_pendientes;
	var codigo_tc = req.body.codigo_tc;
	var usuario = req.body.usuario;
	var is_active = req.body.is_active;
	var id_financiamiento = req.body.id_financiamiento

	 var sql = require("mssql");

    // config for your database
    var config = {
	user: 'admin',
	password: 'queremencuentle',
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
	database: 'AGA_DB',
	port: 1433
    };

    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request();

		var query = "BEGIN TRY UPDATE tbFinanciamiento\
			SET codigo_convenio = "+"'"+codigo_convenio+"'"+","
			+"no_tarjeta = "+ no_tarjeta +","
			+"tipo = '"+tipo+"'"+","
			+"total_financiamiento = '"+total_financiamiento+"'"+","
			+"monto_financiamiento_mensual = '"+monto_financiamiento_mensual+"'"+","
			+"no_cuotas_pendientes = '"+no_cuotas_pendientes+"'"+","
			+"codigo_tc = '"+codigo_tc+"'"+","
			+"usuario = '"+usuario+"'"+","
			+"is_active = "+is_active +
			" WHERE id_financiamiento = " + id_financiamiento + " SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH";

		 console.log(query);
        // query to the database and get the records
        request.query(query, function (err, recordset) {
	if (err) console.log(err)
        // send records as a response
        sql.close();
	 var myJsonString = JSON.stringify(recordset.recordset[0]);
	 res.status(200).send(myJsonString);
        });
    });
});



app.post('/AGA_DB_Financiamiento_By_Cod_TC_Like', (req, res) => { 

	var criteria = req.body.criteria; 
	var criteria2 = req.body.criteria2;

	var sql = require("mssql");

    // config for your database
    var config = { 
		user: 'admin', 
		password: 'queremencuentle', 
		server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        	database: 'AGA_DB',
		port: 1433
    		};
    sql.close();

    // connect to your database
    sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 
	
		var query = "SELECT * FROM tbFinanciamiento WHERE is_active=1 and no_tarjeta like '" + criteria2 + "' and codigo_tc like '%" + criteria + "%'";

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


app.post('/AGA_DB_Historico_Financiamiento_New', (req, res) => {
	var codigo_convenio = req.body.codigo_convenio;
	var no_tarjeta = req.body.no_tarjeta;
	var nombre_completo = req.body.nombre_completo;
	var tipo = req.body.tipo;
	var fecha_corte = req.body.fecha_corte;
	var fecha_pago = req.body.fecha_pago;
	var total_financiamiento = req.body.total_financiamiento;
	var no_cuota = req.body.no_cuota;
	var usuario = req.body.usuario;
	var is_active = req.body.is_active;
	var monto_financiamiento_mensual=  req.body.monto_financiamiento_mensual;
	var codigo_tc = req.body.codigo_tc;
	var nuevo_saldo = req.body.nuevo_saldo;
	var pagar_cuota_no = req.body.pagar_cuota_no;
	var fecha_transaccion = req.body.fecha_transaccion;

	var sql = require("mssql");

    // config for your database
    var config = {
	user: 'admin',
	password: 'queremencuentle',
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com',
	database: 'AGA_DB',
	port: 1433
    };

    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
	 if (err) console.log(err);
        // create Request object
        var request = new sql.Request();

	 var query = "BEGIN TRY INSERT INTO dbo.tbHistorico_Financiamiento_Cuotas\
			(codigo_convenio\
,no_tarjeta\
,nombre_completo\
,tipo\
,fecha_corte\
,fecha_pago\
,total_financiamiento\
,no_cuota\
,usuario\
,is_active\
,monto_financiamiento_mensual\
,codigo_tc\
,nuevo_saldo\
,pagar_cuota_no\
,fecha_transaccion)\
			VALUES("+
			"'"+codigo_convenio+"'"+","
			+"'"+no_tarjeta+"'"+","
			+"'"+nombre_completo+"'"+","
			+"'"+tipo+"'"+","
			+"'"+fecha_corte+"'"+","
			+"'"+fecha_pago+"'"+","
			+"'"+total_financiamiento+"'"+","
			+"'"+no_cuota+"'"+","
			+"'"+usuario+"'"+","
			+"'"+is_active+"'"+","
			+"'"+monto_financiamiento_mensual+"'"+","
			+"'"+codigo_tc+"'"+","
			+"'"+nuevo_saldo+"'"+","
			+"'"+pagar_cuota_no+"'"+","
			+"'"+fecha_transaccion+"'"
			+") SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH";

        console.log(query);
        // query to the database and get the records
        request.query(query, function (err, recordset) { 
	if (err) console.log(err)
        // send records as a response
        sql.close(); 
	var myJsonString = JSON.stringify(recordset.recordset[0]); 
	res.status(200).send(myJsonString);
        });
    });
});


app.post('/AGA_DB_Historico_Financiamiento_By_Cod_TC_Like', (req, res) => { 

	var criteria = req.body.criteria; 
	var sql = require("mssql");

    // config for your database
    var config = { 
	user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
	database: 'AGA_DB',
	port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) { 
	if (err) console.log(err);

        // create Request object
        var request = new sql.Request(); 

	var query = "SELECT * FROM tbHistorico_Financiamiento_Cuotas WHERE is_active=1 and codigo_tc like '" + criteria + "'";

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




app.post('/AGA_DB_Historico_Financiamiento_By_Cod_TC_Like_SUM', (req, res) => { 

	var criteria = req.body.criteria; var sql = 
	require("mssql");

    // config for your database
    var config = { 
	user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
	database: 'AGA_DB',
	port: 1433
    };

    sql.close();

    // connect to your database

    sql.connect(config, function (err) {

	 if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 

	var query = "SELECT SUM(monto_financiamiento_mensual) as Suma_Cuota_Mensual FROM tbHistorico_Financiamiento_Cuotas WHERE is_active=1 and codigo_tc like '" + criteria + "'";

        console.log(query);
     // y to the database and get the records

        request.query(query, function (err, recordset) { 
	if (err) console.log(err)
        // send records as a response
        sql.close(); 
	var myJsonString = JSON.stringify(recordset.recordset); 
	res.status(200).send(myJsonString);
        });
    });
});


app.post('/AGA_DB_Historico_Financiamiento_By_Cod_TC_Like_SUM_Cuota_No', (req, res) => { 

	var criteria = req.body.criteria; 

	var sql =  require("mssql");

    // config for your database
    var config = { 
	user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
	database: 'AGA_DB',
	port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) { 

	if (err) console.log(err);
        // create Request object

        var request = new sql.Request(); 

	var query = "SELECT SUM(id_cuota) as Suma_Cuota_No FROM tbHistorico_Financiamiento_Cuotas WHERE is_active=1 and codigo_tc like '" + criteria + "'";

    
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


app.post('/AGA_DB_tbHistorico_Financiamiento_Tarjeta_By_Id_Like', (req, res) => { 

	var criteria = req.body.criteria; 
	var sql = require("mssql");

    // config for your database
    var config = { 
	user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
	database: 'AGA_DB',
    port: 1433
    };
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 
	var query = "SELECT * FROM tbHistorico_Financiamiento_Cuotas WHERE is_active=1 and id_financiamiento_cuotas like '" + criteria + "'";
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


app.post('/AGA_DB_Historico_Financiamiento_Update', (req, res) => {
    
        var codigo_convenio= req.body.codigo_convenio; 
	var no_tarjeta= req.body.no_tarjeta; 
	var nombre_completo= req.body.nombre_completo; 
	var tipo = req.body.tipo; 
var fecha_corte= req.body.fecha_corte; 
var fecha_pago= req.body.fecha_pago; 
        var total_financiamiento= req.body.total_financiamiento; 
var no_cuota= req.body.no_cuota; 
var usuario= req.body.usuario; 
var is_active= req.body.is_active; 
var monto_financiamiento_mensual= req.body.monto_financiamiento_mensual; 
var codigo_tc= req.body.codigo_tc; 
var nuevo_saldo= req.body.nuevo_saldo; 
var pagar_cuota_no= req.body.pagar_cuota_no; 
var fecha_transaccion = req.body.fecha_transaccion; 
var id_financiamiento_cuotas = req.body.id_financiamiento_cuotas

    var sql = require("mssql");
    
    // config for your database
    var config = { 
user: 'admin', 
password: 'queremencuentle', 
server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
    database: 'AGA_DB', 
port: 1433
    };
 
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 

var query = "BEGIN TRY UPDATE tbHistorico_Financiamiento_Cuotas\
	SET codigo_convenio = "+"'"+codigo_convenio+"'"+","
	+"no_tarjeta = "+ no_tarjeta +","
	+"nombre_completo = '"+nombre_completo+"'"+","
	+"tipo = '"+tipo+"'"+","
	+"fecha_corte = '"+fecha_corte+"'"+","
	+"fecha_pago = '"+fecha_pago+"'"+","
	+"total_financiamiento = '"+total_financiamiento+"'"+","
	+"no_cuota = '"+no_cuota+"'"+","
	+"usuario = '"+usuario+"'"+","
	+"is_active = '"+is_active+"'"+","
	+"monto_financiamiento_mensual ='"+monto_financiamiento_mensual+"'"+","
	+"codigo_tc = '"+codigo_tc+"'"+","
	+"nuevo_saldo = '"+nuevo_saldo+"'"+","
	+"pagar_cuota_no = '"+pagar_cuota_no+"'"+","
	+"fecha_transaccion = '"+fecha_transaccion+"'"
	+" WHERE id_financiamiento_cuotas = " + id_financiamiento_cuotas + " SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH"; 

        console.log(query);
        // query to the database and get the records
        request.query(query, function (err, recordset) { 
	if (err) console.log(err)
        // send records as a response
        sql.close(); 
	var myJsonString = JSON.stringify(recordset.recordset[0]); 
	res.status(200).send(myJsonString);
        });
    });
});



app.post('/AGA_DB_Historico_Gastos_New_DEL', (req, res) => {
    
	var codigo_convenio= req.body.codigo_convenio; 
	var no_tarjeta= req.body.no_tarjeta; 
	var nombre_completo= req.body.nombre_completo;
	var fecha_corte_dia= req.body.fecha_corte_dia; 
	var fecha_pago_dia= req.body.fecha_pago_dia; 
	var fecha_consumo= req.body.fecha_consumo; 
	var monto_consumo= req.body.monto_consumo; 
	var no_dias_pagar= req.body.no_dias_pagar; 
	var usuario= req.body.usuario; 
	var is_active= req.body.is_active;
    
    var sql = require("mssql");
    
    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
	database: 'AGA_DB', 
	port: 1433
    };
 
    sql.close();
    // connect to your database
    sql.connect(config, function (err) {
	if (err) console.log(err);
        // create Request object

        var request = new sql.Request();

		var query = "BEGIN TRY INSERT INTO dbo.tbHistorico_Gastos\
		(codigo_convenio\
		,no_tarjeta\
		,nombre_completo\
		,fecha_corte_dia\
		,fecha_pago_dia \
		,fecha_consumo \
		,monto_consumo\
		,no_dias_pagar\
		,usuario\
		,is_active\
		VALUES("+
		"'"+codigo_convenio+"'"+","
		+"'"+no_tarjeta+"'"+","
		+"'"+nombre_completo+"'"+","
		+"'"+fecha_corte_dia+"'"+","
		+"'"+fecha_pago_dia+"'"+","
		+"'"+fecha_consumo+"'"+","
		+"'"+monto_consumo+"'"+","
		+"'"+no_dias_pagar+"'"+","
		+"'"+usuario+"'"+","
		+"'"+is_active+"'"+","
		+") SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH";

        console.log(query);

        // query to the database and get the records
        request.query(query, function (err, recordset) {

	if (err) console.log(err)
        // send records as a response
        sql.close();

	var myJsonString = JSON.stringify(recordset.recordset[0]);
	res.status(200).send(myJsonString);
        });
    });
});





app.post('/AGA_DB_Historico_Gastos_New', (req, res) => {
 
        var codigo_convenio= req.body.codigo_convenio; 
	var no_tarjeta= req.body.no_tarjeta; 
	var nombre_completo= req.body.nombre_completo; 
	var fecha_corte_dia= req.body.fecha_corte_dia; 
	var fecha_pago_dia= req.body.fecha_pago_dia; 
	var fecha_consumo= req.body.fecha_consumo; 
	var monto_consumo= req.body.monto_consumo; 
	var no_dias_pagar= req.body.no_dias_pagar;
	var usuario= req.body.usuario; 
	var is_active= req.body.is_active;
        
    
    var sql = require("mssql");
    
    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
	database: 'AGA_DB',
	port: 1433
    };
 
    sql.close();
    // connect to your database

    sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 

	var query = "BEGIN TRY INSERT INTO dbo.tbHistorico_Gastos\
		(codigo_convenio\
		,no_tarjeta\
		,nombre_completo\
		,fecha_corte_dia\
		,fecha_pago_dia\
		,fecha_consumo\
		,monto_consumo\
		,no_dias_pagar\
		,usuario\
		,is_active)\
		VALUES("+ 
		"'"+codigo_convenio+"'"+","
		+"'"+no_tarjeta+"'"+","
		+"'"+nombre_completo+"'"+","
		+"'"+fecha_corte_dia+"'"+","
		+"'"+fecha_pago_dia+"'"+","
		+"'"+fecha_consumo+"'"+","
		+"'"+monto_consumo+"'"+","
		+"'"+no_dias_pagar+"'"+","
		+"'"+usuario+"'"+","
		+"'"+is_active+"'"
		+") SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH";

        console.log(query);
        // query to the database and get the records

        request.query(query, function (err, recordset) {

	if (err) console.log(err)
        // send records as a response
        sql.close();

	var myJsonString = JSON.stringify(recordset.recordset[0]);

	res.status(200).send(myJsonString);

        });
    });
});


app.post('/AGA_DB_Historico_Gastos_Suma_Consumo_By_NoTarjeta_Like', (req, res) => { 

	var criteria = req.body.criteria; 
	var sql = require("mssql");

    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB',
	port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) { 

	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 

	var query = "SELECT SUM(monto_consumo) as Suma_Consumo FROM tbHistorico_Gastos WHERE is_active=1 and no_tarjeta like '" + criteria + "'";
 
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


app.post('/AGA_DB_Gastos_Tarjeta_By_Id_Like', (req, res) => { 
	var criteria = req.body.criteria; 
	var sql = require("mssql");
    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
	database: 'AGA_DB',
	port: 1433
    };
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 
	var query = "SELECT * FROM tbHistorico_Gastos WHERE is_active=1 and id_historico_gastos like '" + criteria + "'";
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

app.post('/AGA_DB_Historico_Gastos_Update', (req, res) => {
    
        var codigo_convenio= req.body.codigo_convenio; 
	var no_tarjeta= req.body.no_tarjeta; 
	var nombre_completo= req.body.nombre_completo; 
	var fecha_corte_dia= req.body.fecha_corte_dia; 
	var fecha_pago_dia= req.body.fecha_pago_dia; 
	var fecha_consumo= req.body.fecha_consumo; 
	var monto_consumo= req.body.monto_consumo; 
	var no_dias_pagar= req.body.no_dias_pagar; 
	var usuario= req.body.usuario; 
	var is_active= req.body.is_active; 
	var id_historico_gastos = req.body.id_historico_gastos

	var sql = require("mssql");
// config for your database
	var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
	database: 'AGA_DB', 
	port: 1433
    };
 
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 

	var query = "BEGIN TRY UPDATE tbHistorico_Gastos\
	SET codigo_convenio =  "+"'"+codigo_convenio+"'"+","
	+"no_tarjeta = "+ no_tarjeta +","
	+"nombre_completo = '"+nombre_completo+"'"+","
	+"fecha_corte_dia = '"+fecha_corte_dia+"'"+","
	+"fecha_pago_dia = '"+fecha_pago_dia+"'"+","
	+"fecha_consumo = '"+fecha_consumo+"'"+","
	+"monto_consumo = '"+monto_consumo+"'"+","
	+"no_dias_pagar = '"+no_dias_pagar+"'"+","
	+"usuario = '"+usuario+"'"+","
	+"is_active = '"+is_active+"'"
	+" WHERE id_historico_gastos = " + id_historico_gastos + " SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH"; 

	console.log(query);
    // query to the database and get the records

    request.query(query, function (err, recordset) { 
	if (err) console.log(err)
    // send records as a response

    sql.close(); 
	var myJsonString = JSON.stringify(recordset.recordset[0]);
	 res.status(200).send(myJsonString);

    });
 });
});

app.listen(8080, () => {
  console.log('API Escuchando en el puerto 8080!')
});


app.post('/AGA_DB_P_SER_Registro_New', (req, res) => { 

	var sede = req.body.sede; 
	var id_correlativo = req.body.id_correlativo; 
	var correlativo = req.body.correlativo; 
	var servicio = req.body.servicio; 
	var empresa = req.body.empresa; 
	var nombre_cliente = req.body.nombre_cliente; 
	var fecha = req.body.fecha; 
	var monto_servicio = req.body.monto_servicio; 
	var codigo_cliente = req.body.codigo_cliente; 
	var hora = req.body.hora; 
	var is_active = req.body.is_active;
	var usuario = req.body.usuario;

    
    var sql = require("mssql");
    
    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
	database: 'AGA_DB',
	port: 1433
    };
 
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 

		var query = "BEGIN TRY INSERT INTO dbo.tbPago_Servicios\
		(sede\
		,id_correlativo\
		,correlativo\
		,servicio\
		,empresa\
		,nombre_cliente\
		,fecha\
		,monto_servicio\
		,codigo_cliente\
		,hora\
		,usuario\
		,is_active)\
		VALUES("+
		"'"+sede+"'"+","
		+"'"+id_correlativo+"'"+","
		+"'"+correlativo+"'"+","
		+"'"+servicio+"'"+","
		+"'"+empresa+"'"+","
		+"'"+nombre_cliente+"'"+","
		+"'"+fecha+"'"+","
		+"'"+monto_servicio+"'"+","
		+"'"+codigo_cliente+"'"+","
		+"'"+hora+"'"+","
		+"'"+usuario+"'"+","
		+"'"+is_active+"'"
		+") SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH";

        console.log(query);
        // query to the database and get the records
        request.query(query, function (err, recordset) { 
	if (err) console.log(err)
        // send records as a response
        sql.close(); 
	var myJsonString = JSON.stringify(recordset.recordset[0]); 
	res.status(200).send(myJsonString);
        });
    });
});

app.post('/AGA_DB_P_SER_By_Codigo', (req, res) => { 

	var criteria = req.body.criteria; 
	var sql = require("mssql");

    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
    	database: 'AGA_DB', 
	port: 1433
    };
    sql.close();
    // connect to your database
        sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 

	var query = "SELECT * FROM tbPago_Servicios WHERE is_active=1 and codigo_cliente like '" + criteria + "' order by codigo_cliente";

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


app.post('/AGA_DB_P_SER_Rpt_By_Fecha', (req, res) => { 
	
	var first_date = req.body.first_date; 
	var end_date = req.body.end_date; 
	var criteria = req.body.criteria
	var criteria1 = req.body.criteria1
	var criteria2 = req.body.criteria2 
	var criteria3 = req.body.criteria3
	var criteria4 = req.body.criteria4 
	
	var sql = require("mssql");

    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB',
	port: 1433
    };
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 
	//var query = "SELECT * FROM tbPago_Servicios WHERE is_active=1 and codigo_cliente like '" + criteria + "' and fecha between '" + first_date + "' and '" + end_date +"'";
	
//var query = "SELECT * FROM tbPago_Servicios WHERE is_active=1 and codigo_cliente like '" + criteria + "' AND nombre_cliente LIKE '%" + criteria1 + "%' and fecha between '" + first_date + "' and '" + end_date +"'";


//	var query = "SELECT * FROM tbPago_Servicios WHERE is_active=1 and codigo_cliente like '" + criteria + "' AND nombre_cliente LIKE '%" + criteria1 + "%' and sede like '" + criteria2 + "' and usuario like '" + criteria3 + "' and fecha between '" + first_date + "' and '" + end_date +"'";

var query = "SELECT * FROM tbPago_Servicios WHERE is_active=1 and codigo_cliente like '" + criteria + "' AND nombre_cliente LIKE '%" + criteria1 + "%' and sede like '" + criteria2 + "' and usuario like '" + criteria3 + "' and is_paid like '" + criteria4 + "'  and fecha between '" + first_date + "' and '" + end_date +"'";


	//query = "SELECT * , convert(nvarchar(10),format(fecha,'MM/dd/yyyy'))[fecha_string] FROM tbPago_Servicios WHERE is_active=1 and codigo_cliente like '" + criteria + "' and fecha_string between '" + first_date + "' and '" + end_date +"'";

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
app.post('/AGA_DB_P_SER_SUM_By_Fecha', (req, res) => { 

	var first_date = req.body.first_date;
	var end_date = req.body.end_date;
	var criteria = req.body.criteria
	var criteria1 = req.body.criteria1 
	var criteria2 = req.body.criteria2 
	var criteria3 = req.body.criteria3 
	var criteria4 = req.body.criteria4

	var sql = require("mssql");
    // config for your database

    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB',
    	port: 1433
    };
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 

//	var query = "SELECT SUM(monto_servicio) as Suma_Cuota_Total FROM tbPago_Servicios WHERE is_active=1 and codigo_cliente like '" + criteria + "' AND nombre_cliente LIKE '%" + criteria1 + "%' and fecha between '" + first_date + "' and '" + end_date +"'";
//	var query = "SELECT SUM(monto_servicio) as Suma_Cuota_Total FROM tbPago_Servicios WHERE is_active=1 and codigo_cliente like '" + criteria + "' AND nombre_cliente LIKE '%" + criteria1 + "%' and sede like '" + criteria2 + "' and usuario like '" + criteria3 + "' and fecha between '" + first_date + "' and '" + end_date +"'"; 


var query = "SELECT SUM(monto_servicio) as Suma_Cuota_Total FROM tbPago_Servicios WHERE is_active=1 and codigo_cliente like '" + criteria + "' AND nombre_cliente LIKE '%" + criteria1 + "%' and sede like '" + criteria2 + "' and usuario like '" + criteria3 + "' and is_paid like '" + criteria4 + "'  and fecha between '" + first_date + "' and '" + end_date +"'";
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


app.post('/AGA_DB_P_SER_By_Fecha_Programada_Null', (req, res) => { 


	var criteria = req.body.criteria
	var criteria1 = req.body.criteria1
	var criteria2 = req.body.criteria2
	

	var sql = require("mssql");
    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB',
    port: 1433
    };
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 
	//var query = "SELECT * FROM tbPago_Servicios WHERE is_active=1 and is_paid=0 and fecha_programada is null";

	var query = "SELECT * FROM tbPago_Servicios WHERE is_active=1 and is_paid=0 and fecha_programada is null and codigo_cliente like '" + criteria + "' AND nombre_cliente LIKE '%" + criteria1 + "%' and sede like '" + criteria2 + "' ORDER BY fecha ASC";

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

app.post('/AGA_DB_P_SER_Pago_By_Id_Like', (req, res) => { 

var criteria = req.body.criteria; 

var sql = require("mssql");
    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB',
    port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 
	var query = "SELECT * FROM tbPago_Servicios WHERE is_active=1 and is_paid=0 and id_cliente like '" + criteria + "'";

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

app.post('/AGA_DB_P_SER_By_Is_Paid_Null', (req, res) => { 

	var criteria = req.body.criteria 
	var criteria1 = req.body.criteria1 
	var criteria2 = req.body.criteria2 

	var sql = require("mssql");
    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
	database: 'AGA_DB',
	port: 1433
    };
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 

var query = "SELECT * FROM tbPago_Servicios WHERE is_active=1 and is_paid=0 and fecha_programada like '%' and codigo_cliente like '" + criteria + "' AND nombre_cliente LIKE '%" + criteria1 + "%' and sede like '" + criteria2 + "' ORDER BY fecha_programada ASC";


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



app.post('/AGA_DB_P_Ser_Update', (req, res) => { 
var sede = req.body.sede; 
var id_correlativo = req.body.id_correlativo; 
var correlativo = req.body.correlativo; 
var servicio = req.body.servicio; 
var empresa = req.body.empresa; 
var nombre_cliente = req.body.nombre_cliente; 
var fecha = req.body.fecha; 
var fecha_programada = req.body.fecha_programada; 
var monto_servicio = req.body.monto_servicio; 
var codigo_cliente = req.body.codigo_cliente; 
var hora = req.body.hora; 
var is_active = req.body.is_active; 
var usuario = req.body.usuario; 
var no_tarjeta = req.body.no_tarjeta; 
var is_paid = req.body.is_paid; 
var id_cliente = req.body.id_cliente

var sql = require("mssql");
// config for your database
var config = { user: 'admin', 
password: 'queremencuentle', 
server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
database: 'AGA_DB', 
port: 1433
};

sql.close();
// connect to your database
sql.connect(config, function (err) { 
if (err) console.log(err);
    // create Request object
    var request = new sql.Request(); 

//	var query = "BEGIN TRY UPDATE tbPago_Servicios\
//	SET sede = "+"'"+sede+"'"+","
//	+"servicio = "+ servicio +","
//	+"empresa = '"+empresa+"'"+","
//	+"nombre_cliente = '"+nombre_cliente+"'"+","
//	+"fecha = '"+fecha+"'"+","
//	+"fecha_programada  '"+fecha_programada+"'"+","
//	+"monto_servicio = '"+monto_servicio+"'"+","
//	+"codigo_cliente = '"+codigo_cliente+"'"+","
//	+"hora = '"+hora+"'"+","
//	+"is_active = '"+is_active+"'"+","
//	+"usuario = '"+usuario+"'"+","
//	+"no_tarjeta = '"+no_tarjeta+"'"+","
//	+"is_paid = '"+is_paid+"'"+
//	" WHERE id_cliente = " + id_cliente + " SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH";


	var query = "BEGIN TRY UPDATE tbPago_Servicios\
	SET fecha_programada= '"+fecha_programada+"'"+"," 
	+"no_tarjeta = '"+no_tarjeta+"'"+","
	+"is_paid = '"+is_paid+"'"+
	" WHERE id_cliente = " + id_cliente + " SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH";

console.log(query);
// query to the database and get the records
	request.query(query, function (err, recordset) { 
	
	if (err) console.log(err)

// send records as a response
	sql.close();
	 var myJsonString = JSON.stringify(recordset.recordset[0]);
	
	 res.status(200).send(myJsonString);

    });
  });
});


app.post('/AGA_DB_P_SER_By_Is_Paid_No', (req, res) => { 
	var criteria = req.body.criteria 
	var sql = require("mssql");
    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
	database: 'AGA_DB',
	port: 1433
    };
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 
	var query = "select * from tbPago_Servicios WHERE is_active=1 and is_paid=0 and sede like '" + criteria + "' ORDER  BY fecha_programada ASC";

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

app.post('/AGA_DB_P_SER_By_Is_Paid_Yes', (req, res) => { 
	var criteria = req.body.criteria 
	var sql = require("mssql");
    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
	database: 'AGA_DB',
	port: 1433
    };
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 
	var query = "select * from tbPago_Servicios WHERE is_active=1 and is_paid=1 and sede like '" + criteria + "' ORDER  BY fecha_programada ASC";
 
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


app.post('/AGA_DB_P_SER_SUM_By_Is_Paid_No', (req, res) => { 
var criteria = req.body.criteria
    
    var sql = require("mssql");
    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
	database: 'AGA_DB',
    port: 1433
    };
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 
	var query = "SELECT SUM(monto_servicio) as Suma_Cuota_Total FROM tbPago_Servicios WHERE is_active=1 and is_paid=0 and sede like '" + criteria + "'";
        
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
app.post('/AGA_DB_P_SER_SUM_By_Is_Paid_Yes', (req, res) => { 
var criteria = req.body.criteria
    
    var sql = require("mssql");
    // config for your database
    var config = { user: 'admin', 
password: 'queremencuentle', 
server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB',
    port: 1433
    };
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 
	var query = "SELECT SUM(monto_servicio) as Suma_Cuota_Total FROM tbPago_Servicios WHERE is_active=1 and is_paid=1 and sede like '" + criteria + "'";
        
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


app.post('/AGA_DB_P_SER_By_Codiga_Nombre_General', (req, res) => { 

	var criteria = req.body.criteria 
	var criteria1 = req.body.criteria1 
	var criteria2 = req.body.criteria2

    var sql  = require("mssql");

    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB',
	port: 1433
    };

    sql.close();

    // connect to your database
    sql.connect(config, function (err) { 

	if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 
//var query = "select * from tbPago_Servicios WHERE is_active=1 and codigo_cliente like '" + criteria + "' and nombre_cliente like '%" + criteria1 + "%' ORDER BY sede, codigo_cliente , nombre_cliente";
//var query = "select * from tbPago_Servicios WHERE is_active=1 and sede like '" + criteria + "' and codigo_cliente like '" + criteria1 + "' and nombre_cliente like '%" + criteria2 + "%' ORDER  BY sede, codigo_cliente , nombre_cliente";
//var query = "select * from tbPago_Servicios WHERE is_active=1 and sede like '" + criteria + "' and codigo_cliente like '" + criteria1 + "' and nombre_cliente like '%" + criteria2 + "%' ORDER  BY sede, codigo_cliente, nombre_cliente";

var query = "select * from tbPago_Servicios WHERE is_active=1 and sede like '" + criteria + "' and codigo_cliente like '" + criteria1 + "' and nombre_cliente like '%" + criteria2 + "%' ORDER  BY fecha DESC";
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



app.post('/AGA_DB_P_SER_Pago_By_Id_Like_General', (req, res) => { 
var criteria = req.body.criteria; 
var sql = require("mssql");
    // config for your database
    var config = { user: 'admin', 
password: 'queremencuentle', 
server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB',
    port: 1433
    };
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 
var query = "SELECT * FROM tbPago_Servicios WHERE is_active=1 and id_cliente like '" + criteria + "'";
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

app.post('/AGA_DB_P_Ser_Update_General', (req, res) => { 
var sede = req.body.sede; 
var id_correlativo = req.body.id_correlativo; 
var correlativo = req.body.correlativo; 
var servicio = req.body.servicio;
var empresa = req.body.empresa; 
var nombre_cliente = req.body.nombre_cliente; 
var fecha = req.body.fecha; 
//var fecha_programada =  req.body.fecha_programada; 
var monto_servicio = req.body.monto_servicio; 
var codigo_cliente = req.body.codigo_cliente; 
var hora = req.body.hora; 
var is_active = req.body.is_active; 
//var usuario = req.body.usuario; 
//var no_tarjeta = req.body.no_tarjeta; 
var is_paid  = req.body.is_paid; 
var id_cliente = req.body.id_cliente
    
var sql = require("mssql");
// config for your database
var config = { user: 'admin', 
password: 'queremencuentle', 
server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
database: 'AGA_DB', 
port: 1433
};
sql.close();
// connect to your database
sql.connect(config, function (err) { 
if (err) console.log(err);
    // create Request object
    var request = new sql.Request(); 

	var query = "BEGIN TRY UPDATE tbPago_Servicios\
	SET sede = "+"'"+sede+"'"+","
        +"id_correlativo = '"+id_correlativo+"'"+","
	+"correlativo = '"+correlativo+"'"+","
	+"servicio = '"+servicio+"'"+","
	+"empresa = '"+empresa+"'"+","
	+"nombre_cliente = '"+nombre_cliente+"'"+","
	+"fecha = '"+fecha+"'"+","
	+"monto_servicio = '"+monto_servicio+"'"+","
	+"codigo_cliente = '"+codigo_cliente+"'"+","
	+"hora = '"+hora+"'"+","
	+"is_active = '"+is_active+"'"+","
	+"is_paid = "+is_paid +
	"WHERE id_cliente = " + id_cliente + " SELECT 'EXITO'[RESULTADO] END TRY BEGIN CATCH SELECT ERROR_MESSAGE()[RESULTADO] END CATCH";



	console.log(query);
// query to the database and get the records
	request.query(query, function (err, recordset) { 
	if (err) console.log(err)
// send records as a response
	sql.close(); 
	var myJsonString = JSON.stringify(recordset.recordset[0]); 
	res.status(200).send(myJsonString);

});
});
});

app.post('/AGA_DB_P_SER_By_Id_Correlativo', (req, res) => {
 
    var sql = require("mssql");
    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB',
    	port: 1433
    };
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
if (err) console.log(err);
        // create Request object
        var request = new sql.Request(); 
var query = "SELECT TOP 1 * FROM tbPago_Servicios ORDER BY id_correlativo DESC"; 
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

app.post('/AGA_DB_P_SER_SUM_By_User', (req, res) => { 

	var first_date = req.body.first_date; 
	var end_date = req.body.end_date; 
	var criteria = req.body.criteria 
	var criteria1 = req.body.criteria1 
	var criteria2 = req.body.criteria2 
	//var criteria3 = req.body.criteria3
    
    var sql = require("mssql");
    // config for your database
    var config = { user: 'admin', 
	password: 'queremencuentle', 
	server: 'catarsysdb.ckqpeiqtrywi.us-east-1.rds.amazonaws.com', 
        database: 'AGA_DB',
	port: 1433
    };
    sql.close();
    // connect to your database
    sql.connect(config, function (err) { 
	if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
  
        //var query = "SELECT SUM(monto_servicio) as Suma_Cuota_Total* FROM tbPago_Servicios WHERE is_active=1 and codigo_cliente like '" + criteria + "' AND nombre_cliente LIKE '%" + criteria1 + "%' and sede like '" + criteria2 + "' and usuario like '" + criteria3 + "' and fecha between '" + first_date + "' and '" + end_date +"'";
	var query = "SELECT SUM(monto_servicio) as Suma_Cuota_Total FROM tbPago_Servicios  WHERE is_active=1 and usuario like '" + criteria + "' and fecha between '" + first_date + "' and '" + end_date +"'";
	// var query = "SELECT SUM(monto_servicio) as Suma_Cuota_Total FROM tbPago_Servicios  WHERE is_active=1 and usuario like '" + criteria + "' and codigo_cliente like '" + criteria1 + "' AND nombre_cliente LIKE '%" + criteria2 + "%' and fecha between '" + first_date + "' and '" + end_date +"'";
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


