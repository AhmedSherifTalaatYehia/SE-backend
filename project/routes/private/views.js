const db = require('../../connectors/db');
const roles = require('../../constants/roles');
const { getSessionToken } = require('../../utils/session');

const calculateGPA = (gradeArray) => {

  
  let totalGrade = 0;
  let totalHours = 0;
  for(let gradeObj of gradeArray){
      totalGrade += gradeObj.grade * gradeObj.creditHours
      totalHours += gradeObj.creditHours;
  }
  let gpa = totalGrade / totalHours;
  gpa= parseInt(gpa*100) / 100
  return gpa;

}


const getUser = async function(req) {
  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return res.status(301).redirect('/');
  }
  try {
    const user = await db.select('*')
    .from('se_project.sessions')
    .where('token', sessionToken)
    .innerJoin('se_project.users', 'se_project.sessions.userId', 'se_project.users.id')
    .innerJoin('se_project.roles', 'se_project.users.roleId', 'se_project.roles.id')
    .innerJoin('se_project.faculties', 'se_project.users.facultyId', 'se_project.faculties.id')
    .first();
    console.log('user =>', user)
    user.isStudent = user.roleId === roles.student;
    user.isAdmin = user.roleId === roles.admin;
  
    return user; 
  } catch (error) {
    console.log(error.message);
    return {};
  }
 
  
  
}

module.exports = function(app) {
  // Register HTTP endpoint to render /users page
  app.get('/dashboard', async function(req, res) {
    const user = await getUser(req);
    if(user.roleId == 1){
      return res.render('studentDashboard', user);
    }
    if(user.roleId == 2){
      return res.render('adminDashboard', user);
    }
    return res.render('404');
  });


  // Register HTTP endpoint to render /courses page
  app.get('/manage/grades', async function(req, res) {
    try {
      //const user = await getUser(req);
      const courses = await db.select('*').from('se_project.courses');
      return res.render('manageGrade',{courses});
    }catch (err) {
      console.log("error message manage Grade render page \n",err.message);
      return res.render('404',{ message : err.message});
    } 
    
  });


  app.get('/manage/courses', async function(req, res) {
    try {
      const user = await getUser(req);
      const faculties = await db.select('*').from('se_project.faculties');
      return res.render('manageCourses',{faculties});
    }catch (err) {
      console.log("error message manage course render page \n",err.message);
      return res.render('404',{ message : err.message});
    } 
    
  });

  app.get('/manage/courses/edit/:courseId', async function(req, res) {
    try {
      const courseId = req.params.courseId;
      const course = await db.select('*').from('se_project.courses').where("id" , courseId).first();
      return res.render('courseEdit',course);
    }catch (err) {
      console.log("error message manage course render page \n",err.message);
      return res.render('404',{ message : err.message});
    } 
    
  });


  app.get('/manage/transfers', async function(req, res) {
    try {
      const transfer = await db.raw(`
      select t.id, t."userId",
      curr."faculty" as "currentFaculty", 
      newfaculty."faculty" as "newFaculty" ,
      t."date", t."status"  
      from se_project.transfers t 
      inner join se_project.faculties curr 
      on t."currentFacultyId" = curr.id 
      inner join se_project.faculties newfaculty 
      on t."newFacultyId" = newfaculty.id`);
      //where t."status" = 'pending'`);
      const trans = transfer.rows;
      for(let transObj of trans){
        let date = new Date(transObj.date);
        let formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}`
        let [year , month , day] = formattedDate.split("-");
        month = month.length == 1?"0"+month : month;
        day = day.length == 1?"0"+day : day;
        formattedDate = `${year}-${month}-${day}`;
        transObj.date = formattedDate;
      }
      return res.render('manageTransfer',{requests : trans});
    }catch (err) {
      console.log("error message manage transfer render page \n",err.message);
      return res.render('404',{ message : err.message});
    } 
    
  });



  // Register HTTP endpoint to render /courses page
  app.get('/courses', async function(req, res) {
    try {
      const user = await getUser(req);
      const enrollment = await db.select('*')
      .from('se_project.enrollments')
      .where('userId', user.userId)
      .andWhere('active' , true)
      .andWhere('grade' , 0)
      .innerJoin('se_project.courses', 'se_project.enrollments.courseId', 'se_project.courses.id');
      return res.render('courses',{enrollment});
    }catch (err) {
      console.log("error message courses render page \n",err.message);
      return res.render('404',{ message : err.message});
    } 
    
  });

  // render student enrolled courses
  app.get('/transcripts', async function(req, res) {
    try {
      const user = await getUser(req);
      const completed = await db.select('*')
      .from('se_project.enrollments')
      .where('userId', user.userId)
      .andWhere('active' , true)
      .andWhere('grade' ,"!=", 0)
      .innerJoin('se_project.courses', 'se_project.enrollments.courseId', 'se_project.courses.id');
      const gpaFlag = completed.length > 0;
      const gpa = calculateGPA(completed);
      console.log("gpaflag",gpaFlag)
      let grades = {
        "0.7":"A+","1":"A","1.3":"A-",
        "1.7":"B+","2":"B","2.3":"B-",
        "2.7":"C+","3":"C","3.3":"C-",
        "3.7":"D+","4":"D","5":"F"
      };
      for(let completedObj of completed){
        completedObj.gradeName = grades[completedObj.grade]
      }
      return res.render('transcript', {completed,gpa,gpaFlag});  
    }catch (err) {
      console.log("error message transfer render page \n",err.message);
      return res.render('404',{ message : err.message});
    }  
  });

  // render student enrolled courses
  app.get('/transfer', async function(req, res) {
    try {
      const user = await getUser(req);
      const faculties = await db.select('*').from('se_project.faculties');
      const transfer = await db.raw(`
      select t.id, 
      curr."faculty" as "currentFaculty", 
      newfaculty."faculty" as "newFaculty" ,
      t."date", t."status"  
      from se_project.transfers t 
      inner join se_project.faculties curr 
      on t."currentFacultyId" = curr.id 
      inner join se_project.faculties newfaculty 
      on t."newFacultyId" = newfaculty.id
      where t."userId" = ${user.userId}`);
      const trans = transfer.rows;
      const transFlag = trans.length >0;
      const pendingRequest = await db.select('*').from('se_project.transfers')
      .where('userId', user.userId)
      .andWhere('status','pending');
      
      for(let transObj of trans){
        let date = new Date(transObj.date);
        let formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}`
        let [year , month , day] = formattedDate.split("-");
        month = month.length == 1?"0"+month : month;
        day = day.length == 1?"0"+day : day;
        formattedDate = `${year}-${month}-${day}`;
        transObj.date = formattedDate;
      }

      const nonPendingFlag = pendingRequest == 0;
      return res.render('transfer',{faculties,nonPendingFlag,trans,transFlag});  
    }catch (err) {
      console.log("error message transfer render page \n",err.message);
      return res.render('404',{ message : err.message});
    }
    
  });




};
