/* Require external APIs and start our application instance */
var express = require('express');
var mysql = require('mysql');
var app = express();

/* Configure our server to read public folder and ejs files */
app.use(express.static('public'));
app.set('view engine', 'ejs');

/* Configure MySQL DBMS */
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'miguelespitia',
    password: 'miguelespitia',
    database: 'quotes_db'
});
connection.connect();

app.get('/', function(req, res){
	var stmtCategory = "select distinct(l9_quotes.category) from l9_quotes;";
	var stmtNames = "select * from l9_author";
	
	var names = [];
	var authors = null;
	connection.query(stmtNames,function(error,found){
    	if(error) throw error;
		if(found.length){
			found.forEach(function(f){
				names.push(f.firstName + " " + f.lastName);
			});
			authors = found;			
		}
    });
	var categories = [];
	connection.query(stmtCategory,function(error,found){
    	if(error) throw error;
		if(found.length){
			found.forEach(function(f){
				categories.push(f.category);
			});
		}
	    res.render('home', {categories:categories,names:names,authors:authors});
    });
});
app.get('/category', function(req, res) {
    var category = req.query.category;
    
    var stmt = "select * from l9_quotes natural join l9_author "+
    				"where l9_quotes.category = '" + category + "';" ; 
    				
    connection.query(stmt,function(error,found){
    	var authors = null;
    	if(error) throw error;
		if(found.length){
		   authors = found; 
		}
		res.render('quotes', {keyword:category, authors:authors});
    });
});
app.get('/author', function(req, res) {
    var name = req.query.name;
    var first = name.split(" ").splice(0,1);
    var last = name.split(" ").splice(1,2);
    var stmt = "select * from l9_quotes natural join l9_author where l9_author.firstName = '" + first + "'" + "and l9_author.lastName='"+ last + "';" ; 
    connection.query(stmt,function(error,found){
    	var authors = null;
    	if(error) throw error;
		if(found.length){
			authors = found; 
		}
		res.render('quotes', {keyword:name, authors:authors});
    });
});
app.get('/author/:authorId', function(req, res){
	var authorIds = req.params.authorId;
	var stmt = "select * from l9_author where authorId=" + authorIds + ';';
	connection.query(stmt,function(error,found){
		var author = null;
		if(error) throw error;
		if(found.length){
			author = found[0]; 
			author.dob = author.dob.toString().split(" ").splice(0, 4).join(" ");
			author.dod = author.dod.toString().split(" ").splice(0, 4).join(" ");
		}
		res.render('author', {author:author});
	});
});
app.get('/gender',function(req, res){
	var gender = req.query.gender;
	var stmt = 'select * from l9_quotes natural join l9_author where sex=\'' + gender + '\';';
    connection.query(stmt, function(error, found){
    	var authors = null;
    	if(error) throw error;
		if(found.length){
			authors = found; 
		}
		if(gender == "F"){
			gender = "Female";
		} 
		else{
			gender = "Male";
		}
		res.render('quotes', {keyword:gender, authors:authors});     
    });
});
app.get('/keyword', function(req, res) {
    var keyword = req.query.keyword;
    var stmt = "select * from l9_quotes natural join l9_author where l9_quotes.quote like '%" + keyword + "%'" ; 
    connection.query(stmt,function(error,found){
    	var authors = null;
    	if(error) throw error;
		if(found.length){
			authors = found;
		}
		res.render('quotes', {keyword:keyword, authors:authors});
    });
});
/* The handler for undefined routes */
app.get('*', function(req, res){
   res.render('error'); 
});

/* Start the application server */
app.listen(process.env.PORT || 3000, function(){
    console.log('Server has been started');
})