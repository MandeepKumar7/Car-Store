const Sequelize = require('sequelize');

//mine
var sequelize = new Sequelize('dth8cq9m85m6u', 'huzmvqxytnkwud', 'f5ddc83217073baf469532078ef4bdcb9b32a574eb3ffa0abbb3ea6ca8420f8f', {
    host: 'ec2-52-21-153-207.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
          }
    }
});

// People table
var People = sequelize.define('People', {
    peopleNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    phone: Sequelize.INTEGER,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    vin: Sequelize.STRING
});

// Store table
var Store = sequelize.define('Store', {
    storeId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    storeName: Sequelize.STRING,
    storePhone: Sequelize.INTEGER,
    storeAddress: Sequelize.STRING,
    storeCity: Sequelize.STRING
});

// Car table
var Car = sequelize.define('Car', {
    carId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    carMake: Sequelize.STRING,
    carModel: Sequelize.STRING,
    carYear: Sequelize.INTEGER,
    vin: Sequelize.STRING
});

module.exports.initialize = function(){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(() => {
            resolve();   
        }).catch((err)=>{   
            reject("Unable to sync the database");
        });       
    });
}

module.exports.getAllPeople = function(){
    return new Promise(function(resolve, reject) {
        People.findAll().then(function(data){
            resolve(data);
        }).catch((err) => {
            reject("No results returned");
        });
    });
}

module.exports.getPeopleByPhone = function(phone){
    return new Promise(function (resolve, reject) {
        People.findAll({
            where: {
                phone:phone
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No results returned");
        });
    });
}

module.exports.getPeopleByVin = function(vin){
    return new Promise(function (resolve, reject) {
        People.findAll({
            where: {
                vin:vin
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No results returned");
        });
    });
}

module.exports.getPeopleByNum = function(num){
    return new Promise(function (resolve, reject) {
        People.findAll({
            where: {
                peopleNum: num
            }
        }).then(function(data){
            resolve(data[0].dataValues);
        }).catch((err)=> {
            reject("No results returned");
        });
    });
}

module.exports.addPeople = function(peopleData){
    return new Promise(function (resolve, reject) {
        for (const field in peopleData) {
            if (peopleData[field] == "") {
                peopleData[field] = null;
            } 
        }
        People.create(peopleData)
        .then(()=>{
            resolve();
        }).catch((err)=> {
            reject("Unable to create people");
        });
    });
}

module.exports.updatePeople = function(peopleData){
    return new Promise(function (resolve, reject) {
        for (const field in peopleData) {
            if (peopleData[field] == "") {
                peopleData[field] = null;
            } 
        }

        People.update(
            peopleData
        ,{
            where: { peopleNum: peopleData.peopleNum }
        }).then(()=>{
            resolve();
        }).catch((err)=> {
            reject("Unable to update people");
        });
    });
}

module.exports.deletePeopleByNum = function(pepNum){
    return new Promise(function (resolve, reject) {  
        People.destroy({
            where: { peopleNum: pepNum } 
        }).then(() => { 
            resolve();
        }).catch((err) => {
            reject("Unable to delete people");
        });
    });
}

module.exports.getStores = function(){
    return new Promise(function (resolve, reject) {
        Store.findAll().then(function(data){
            var fixed=[];
            for(var i =0; i < data.length; i++){
                fixed.push(data[i].dataValues);
            }
            resolve(fixed);
        }).catch((err)=> {
            reject("No results returned");
        });
    });
}

module.exports.getStoreById = function(id){
    return new Promise(function (resolve, reject) {
        Store.findAll({
            where: {
                storeId: id
            }
        }).then(function(data){
            resolve(data[0].dataValues);
        }).catch((err)=> {
            reject("No results returned");
        });
    });
}

module.exports.getStoreByName = function(name){
    return new Promise(function (resolve, reject) {
        Store.findAll({
            where: {
                storeName: name
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No results returned");
        });
    });
}

module.exports.getStoreByPhone = function(phone){
    return new Promise(function (resolve, reject) {
        Store.findAll({
            where: {
                storePhone:phone
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No results returned");
        });
    });
}

module.exports.addStore = function(storeData){
    return new Promise(function (resolve, reject) {
        for (const field in storeData) {
            if (storeData[field] == "") {
                storeData[field] = null;
            } 
        }

        Store.create(storeData)
        .then(()=>{
            resolve();
        }).catch((err)=> {
            reject("Unable to create store");
        });
    });
}

module.exports.updateStore = function(storeData){
    return new Promise(function (resolve, reject) {
        for (const field in storeData) {
            if (storeData[field] == "") {
                storeData[field] = null;
            } 
        }
        Store.update(storeData, {
            where: { storeId: storeData.storeId },
          })
            .then(() => {
              resolve();
            })
            .catch((err) => {
              reject("Unable to update store");
            });
        });
      }


module.exports.deleteStoreById = function(strId){
    return new Promise(function (resolve, reject) {  
        Store.destroy({
            where: { storeId: strId } 
        }).then(() => { 
            resolve();
        }).catch((err) => {
            reject("Unable to delete store");
        });
    });
}

module.exports.getCars = function(){
    return new Promise(function (resolve, reject) {
        Car.findAll().then(function(data){
            var fixed=[];
            for(var i =0; i < data.length; i++){
                fixed.push(data[i].dataValues);
            }
            resolve(fixed);
        }).catch((err)=> {
            reject("No results returned");
        });
    });
}

module.exports.getCarById = function(id){
    return new Promise(function (resolve, reject) {
        Car.findAll({
            where: {
                carId: id
            }
        }).then(function(data){
            resolve(data[0].dataValues);
        }).catch((err)=> {
            reject("No results returned");
        });
    });
}

module.exports.getCarByMake = function(make){
    return new Promise(function (resolve, reject) {
        Car.findAll({
            where: {
                carMake: make
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No results returned");
        });
    });
}


module.exports.getCarByModel = function(model){
    return new Promise(function (resolve, reject) {
        Car.findAll({
            where: {
                carModel: model
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No results returned");
        });
    });
}


module.exports.getCarByYear = function(year){
    return new Promise(function (resolve, reject) {
        Car.findAll({
            where: {
                carYear:year
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No results returned");
        });
    });
}

module.exports.getCarByVin = function(vn){
    return new Promise(function (resolve, reject) {
        Car.findAll({
            where: {
                vin: vn
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No results returned");
        });
    });
}

module.exports.addCar = function(carData){
    return new Promise(function (resolve, reject) {
        for (const field in carData) {
            if (carData[field] == "") {
                carData[field] = null;
            } 
        }

        Car.create(carData)
        .then(()=>{
            resolve();
        }).catch((err)=> {
            reject("Unable to create car");
        });
    });
}

module.exports.updateCar = function(carData){
    return new Promise(function (resolve, reject) {
        for (const field in carData) {
            if (carData[field] == "") {
                carData[field] = null;
            } 
        }
        Car.update(carData, {
          where: { carId: carData.carId },
        })
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject("Unable to update car");
          });
      });
    };

module.exports.deleteCarById = function(crId){
    return new Promise(function (resolve, reject) {  
        Car.destroy({
            where: { carId: crId } 
        }).then(() => { 
            resolve();
        }).catch((err) => {
            reject("Unable to delete car");
        });
    });
}