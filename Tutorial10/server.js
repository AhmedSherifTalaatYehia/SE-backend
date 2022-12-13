const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const employeeRouter = require("./routes/employee")
const path = require('path');
const  db = require('./db');


// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(express.static('public'));

// Handle post requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));




app.listen(3000, ()=>{
    console.log("Server is now listening at port 3000 on http://localhost:3000/");

})

// Main Home page
app.get('/' , (req , res) => {    
    return res.render('main');
});


app.get('/employee/:code' , async (req , res) => {
    try{
        console.log(req.params.code);
        const result = await db.raw(
            `select e.* , d.name as depName  from employees e 
            inner join departments d on e.departmentId = d.id where d.name = '${req.params.code}'`);
        //console.log(`result here`,result.rows);
        res.send(result.rows);
    }catch(err){
        console.log("error message",err.message);
        res.send(err.message);
    }
  });
  

  app.put('/employee/update' , async (req , res) => {
    try{
        const empArray = req.body.row;
        console.log(req.body);
        for( let embObj of empArray ){
            const {id,salary} = embObj;
            await db.raw(
                `update employees
                set salary = ${salary}
                where id = ${id}`);
        }
        res.send("updated Successfully");
    }catch(err){
        console.log("error message",err.message);
        res.send(err.message);
    }
  });   
