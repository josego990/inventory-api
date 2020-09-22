var express = require('express');
multer = require('multer'), // "multer": "^1.1.0"
multerS3 = require('multer-s3'); //"^1.4.1"
var mysql = require('mysql');
var bodyParser = require('body-parser');
var app = express();
//app.use(express.urlencoded());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false })); 

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

//INSERT A BATCH PRODUCT 
app.post('/inventapp_insert_product_batch', (req, res) => {

var body = req.body;

console.log(body);
console.log(body.length);

res.send(body);

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
server: 'msqlserverexpress.cwz13vhixiyz.us-east-1.rds.amazonaws.com',
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

//SALE
app.post('/inventapp_save_sale', (req, res) => {

    var body = req.body;
    var products_list = body.products;
    console.log(body.products);
    
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

        var query = "INSERT INTO ad_sale_header (local_id,total_articles,total_sale,date_sale)\
                    VALUES("+body.local_id+","
                            +body.total_articles+","
                            +body.total_sale
                            +",dateadd(hh,-6,getdate()))"
                            
        var subquery = "";

        products_list.forEach(prod => {
            
            subquery = subquery + " INSERT INTO ad_sale_detail (id_header,id_product,quantity,unit_price,total) " 
                       +"VALUES (SCOPE_IDENTITY()," 
                       + prod.product_id + "," 
                       + prod.quantity_in_sale + ","
                       + prod.product_price + ","
                       + "100.00)"

        });

        query = query + subquery + " select 'SUCCESS' [RESULT]";

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

//FINALIZAN METODOS DE INVENTORY-------------------------------------------------------------------------------------

app.listen(8080, () => {
  console.log('API Escuchando en el puerto 8080!')
});
