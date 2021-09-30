/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
*  Name: Mandeep Kumar___ Student ID: ___157972183___ Date: ___2021-04-26____
*
*  Online (Heroku) Link: https://obscure-caverns-13947.herokuapp.com/
*
********************************************************************************/ 


const dataServiceAuth = require("./data-service-auth.js");
const clientSessions = require("client-sessions");
var express = require("express");
var app = express();
const ds = require("./data-service.js");
const path = require("path");
const multer = require("multer");
const fs = require('fs');
const bodyParser = require('body-parser');
const exphbs = require("express-handlebars");
const HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "week10example_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
  }));

app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
  }

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

app.engine(".hbs", exphbs({ 
    extname: ".hbs",
    defaultLayout: 'main',
    helpers:{
        navLink: function(url, options){
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }  
    }


}));
app.set("view engine", ".hbs");

app.get("/", function(req, res) {
    res.render('home', {});
});

app.get("/about", function(req, res) {
    res.render('about', {});
});
///////////////////////////
app.get("/people/add",ensureLogin, (req, res) => {
    ds.getStores().then((data) => {
        res.render("addPerson", {stores: data});
    }).catch((err)=>{
        res.render("addPerson", {stores: []});
    });
});

app.post("/people/add", ensureLogin, (req, res) => {
    ds.addPeople(req.body).then(()=>{
        res.redirect("/people");
    }).catch((rejectMsg) => {
        res.status(500).send("Unable to add person");
    }); 
});

app.get("/images/add", ensureLogin, (req, res) => {
    res.render('addImage', {});
});

app.post("/images/add", upload.single("imageFile"),ensureLogin, (req, res) => {
    res.redirect("/images");
});

app.get("/images", ensureLogin, (req, res) => {
    let path = "./public/images/uploaded";
     
    fs.readdir(path, function(err, items) {
        res.render('images', {
            images: items
        }); 
    });
});

app.get("/people", ensureLogin, (req, res) => {
    if(req.query.phone){
        ds.getPeopleByPhone(req.query.phone)
        .then((data) => {
            if (data.length > 0)
                res.render('people',{people: data.map(value => value.dataValues)});
            else
                res.render('people',{ message: "No results" });
        })
        .catch((rejectMsg) => {
            res.status(500).send("No results");
         });
    }
    else if(req.query.vin){
        ds.getPeopleByVin(req.query.vin)
        .then((data) => {
            if (data.length > 0)
                res.render('people',{people: data.map(value => value.dataValues)});
            else
                res.render('people',{ message: "No results" });
        })
        .catch((rejectMsg) => {
            res.status(500).send("No results");
         });
    }
    else {
        ds.getAllPeople()
        .then((data) => {
            if (data.length > 0){
                res.render('people',{people: data.map(value => value.dataValues)});
                
            }
            else {
                res.render('people',{ message: "No results" });
            }
        })
        .catch((rejectMsg) => {
            res.status(500).send("No results");
        });
    }
});

app.get("/person/:pepNum", ensureLogin, (req, res)=> {
    let viewData = {};
    ds.getPeopleByNum(req.params.pepNum)
    .then((data) => { 
        if (data){
            viewData.person =data;
        }
        else{
            viewData.person =null;
        }
    })
    .catch(() => {
        viewData.person =null;
    }).then(()=>{
        if(viewData.person==null){
            res.status(404).send("Person Not Found");
        }else{
            res.render("person", {viewData: viewData});
        }
    });
});

app.post("/person/update", ensureLogin, (req, res) => {
    ds.updatePeople(req.body)
    .then((data) => { 
        res.redirect("/people");
    })
    .catch((rejectMsg) => {
        res.status(500).send("Unable to update people"); //check
    }); 
});
  
app.get("/people/delete/:pepNum", ensureLogin, (req, res) =>{
    ds.deletePeopleByNum(req.params.pepNum).then(()=>{
        res.redirect("/people");
    }).catch((rejectMsg)=>{
        res.status(500).send("Unable to Remove Person / Person not found");
    });
});

app.get("/stores",ensureLogin, (req, res)=> {
    if(req.query.storeName){
        ds.getStoreByName(req.query.storeName)
        .then((data) => {
            if (data.length > 0)
                res.render('stores',{stores: data.map(value => value.dataValues)});
            else
                res.render('stores',{ message: "No results" });
        })
        .catch((rejectMsg) => {
            res.status(500).send("No results");
         });
    }
    else {
        ds.getStores()
        .then((data) => {
            if (data.length > 0){
                console.log("here");
                res.render('stores',{stores: data});
            }
            else {
                res.render('stores',{ message: "No results" });
            }
        })
        .catch((rejectMsg) => {
            res.status(500).send("No results");
        });
    }
});

app.get("/stores/add",ensureLogin, (req, res) => {
    ds.getStores().then((data) => {
        res.render("addStore", {stores: data});
    }).catch((err)=>{
        res.render("addStore", {stores: []});
    });
});

app.post("/stores/add", ensureLogin, (req, res) => {
    ds.addStore(req.body).then(()=>{
        res.redirect("/stores");
    }).catch((rejectMsg) => {
        res.status(500).send("Unable to add store");
    });
});

app.post("/store/update", ensureLogin, (req, res) => {
    ds.updateStore(req.body)
    .then(() => { 
        res.redirect("/stores");
    })
    .catch((rejectMsg) => {
        res.status(500).send("No results");
    }); 
});

app.get("/stores/delete/:strId", ensureLogin, (req, res) =>{
    ds.deleteStoreById(req.params.strId).then(()=>{
        res.redirect("/stores");
    }).catch((rejectMsg)=>{
        res.status(500).send("Unable to Remove Store / Store not found");
    });
});

app.get("/store/:storeId", ensureLogin, (req, res) =>{
    let viewData = {};
    ds.getStoreById(req.params.storeId)
    .then((data) => { 
        if (data){
            viewData.store =data;
        }
        else{
            viewData.store =null;
        }
    })
    .catch(() => {
        viewData.store =null;
    }).then(()=>{
        if(viewData.store==null){
            res.status(404).send("Store Not Found");
        }else{
            res.render("store", {viewData: viewData});
        }
    });
});


app.get("/cars", ensureLogin, (req, res)=> {
    if(req.query.carMake){
        ds.getCarByMake(req.query.carMake)
        .then((data) => {
            if (data.length > 0)
                res.render('cars',{cars: data.map(value => value.dataValues)});
            else
                res.render('cars',{ message: "No results" });
        })
        .catch((rejectMsg) => {
            res.status(500).send("No results");
         });
    }
    else if(req.query.carModel){
        ds.getCarByModel(req.query.carModel)
        .then((data) => {
            if (data.length > 0)
                res.render('cars',{cars: data.map(value => value.dataValues)});
            else
                res.render('cars',{ message: "No results" });
        })
        .catch((rejectMsg) => {
            res.status(500).send("No results");
         });
    }
    else if(req.query.carYear){
        ds.getCarByYear(req.query.carYear)
        .then((data) => {
            if (data.length > 0)
                res.render('cars',{cars: data.map(value => value.dataValues)});
            else
                res.render('cars',{ message: "No results" });
        })
        .catch((rejectMsg) => {
            res.status(500).send("No results");
         });
    }
    else if(req.query.vin){
        ds.getCarByVin(req.query.vin)
        .then((data) => {
            if (data.length > 0)
                res.render('cars',{cars: data.map(value => value.dataValues)});
            else
                res.render('cars',{ message: "No results" });
        })
        .catch((rejectMsg) => {
            res.status(500).send("No results");
         });
    }
    else {
        console.log("here");
        ds.getCars()
        .then((data) => {
            if (data.length > 0){
                console.log("here");
                res.render('cars',{cars: data});
            }
            else {
                res.render('cars',{ message: "No results" });
            }
        })
        .catch((rejectMsg) => {
            res.status(500).send("No results");
        });
    }
});


app.get("/cars/add",ensureLogin, (req, res) => {
    ds.getCars().then((data) => {
        res.render("addCar", {cars: data});
    }).catch((err)=>{
        res.render("addCar", {cars: []});
    });
});

app.post("/cars/add", ensureLogin, (req, res) => {
    ds.addCar(req.body).then(()=>{
        res.redirect("/cars");
    }).catch((rejectMsg) => {
        res.status(500).send("Unable to add car");
    });
});

app.post("/car/update", ensureLogin, (req, res) => {
    ds.updateCar(req.body)
    .then(() => { 
        res.redirect("/cars");
    })
    .catch((rejectMsg) => {
        res.status(500).send("No results");
    }); 
});

app.get("/cars/delete/:crId", ensureLogin, (req, res) =>{
    ds.deleteCarById(req.params.crId).then(()=>{
        res.redirect("/cars");
    }).catch((rejectMsg)=>{
        res.status(500).send("Unable to Remove Car / Car not found");
    });
});

app.get("/car/:carId", ensureLogin, (req, res) =>{
    let viewData = {};
    ds.getCarById(req.params.carId)
    .then((data) => { 
        if (data){
            viewData.car =data;
        }
        else{
            viewData.car =null;
        }
    })
    .catch(() => {
        viewData.car =null;
    }).then(()=>{
        if(viewData.car==null){
            res.status(404).send("Car Not Found");
        }else{
            res.render("car", {viewData: viewData});
        }
    });
});


app.get("/login", (req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post('/register', (req,res)=>{
    dataServiceAuth.registerUser(req.body).then(()=>{
        res.render("register",{successMessage: "User created"});
    }).catch((err)=>{
        res.render("register",{errorMessage: err, userName: req.body.userName});
    });
});

app.post("/login", (req, res)=>{
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body).then((user)=>{
        req.session.user ={
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
        res.redirect('/people');
    }).catch((err)=>{
        res.render("login",{errorMessage: err, userName: req.body.userName});
    });
});

app.get("/logout",(req,res)=>{
    req.session.reset();
    res.redirect('/');
});

app.get("/userHistory", ensureLogin, (req, res)=>{
    res.render("userHistory");
})

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

ds.initialize()
.then(dataServiceAuth.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});
