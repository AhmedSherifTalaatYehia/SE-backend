const { v4 } = require('uuid');
const db = require('../../connectors/db');
const roles = require('../../constants/roles');
const { getSessionToken } = require('../../utils/session');

const getUser = async function(req) {
  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return res.status(301).redirect('/');
  }

  const user = await db.select('*')
    .from('se_project.sessions')
    .where('token', sessionToken)
    .innerJoin('se_project.users', 'se_project.sessions.userId', 'se_project.users.id')
    .innerJoin('se_project.roles', 'se_project.users.roleId', 'se_project.roles.id')
    .innerJoin('se_project.faculties', 'se_project.users.facultyId', 'se_project.faculties.id')
    .first();
  
  //console.log('user =>', user)
  user.isStudent = user.roleId === roles.student;
  user.isAdmin = user.roleId === roles.admin;

  return user;  
}

module.exports = function(app) {
  
  // student drop course
  app.put('/api/v1/courses/:courseId/drop', async function(req, res) {
    
    try {
      console.log("drop student course")
      const courseId = req.params.courseId;
      const user = await getUser(req);
      await db.raw(`update se_project.enrollments
                    set "active" = false
                    where "courseId" = ${courseId} 
                    and "userId" = ${user.userId}`)
      return res.status(200).send('drop successfully')
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('Could not drop course');
    }
  });

// get courses by facultyId 
app.get('/api/v1/faculties/:facultyId', async function(req, res) {
    
  try {
    console.log("get Course ID")
    const facultyId = req.params.facultyId;
    const result = await db.raw(`select * from se_project.courses where "facultyId" = ${facultyId}`)
    return res.status(200).send(result.rows);
  } catch (e) {
    console.log(e.message);
    return res.status(400).send('Could not drop course');
  }
});

// delete courses by Id 
app.delete('/api/v1/courses/:courseId', async function(req, res) {
    
  try {
    console.log("delete Course ID")
    const courseId = req.params.courseId;
    await db.raw(`delete from se_project.courses where id = ${courseId}`)
    await db.raw(`delete from se_project.enrollments where "courseId" = ${courseId}`)
    return res.status(200).send("deleted Successfully");
  } catch (e) {
    console.log(e.message);
    return res.status(400).send('Could not drop course');
  }
});


// get enrollment by Id 
app.get('/api/v1/enrollment/:courseId', async function(req, res) {
    
  try {
    console.log("get Course Info")
    const courseId = req.params.courseId;
    const result = await db.raw(
    `select en.* , us.* , us.id as "userId"  
    from se_project.enrollments en 
    inner join se_project.users us
    on us.id = en."userId"
    where en."courseId" = ${courseId}`);
    const enrollments = result.rows;
    let grades = {
      "0.7":"A+","1":"A","1.3":"A-",
      "1.7":"B+","2":"B","2.3":"B-",
      "2.7":"C+","3":"C","3.3":"C-",
      "3.7":"D+","4":"D","5":"F","0":""
    };
    for(let enrollObj of enrollments){
        enrollObj.gradeName = grades[enrollObj.grade];
    }

    return res.status(200).send(enrollments);
  } catch (e) {
    console.log(e.message);
    return res.status(400).send('Could not drop course');
  }
});


// update corse grades  
app.put('/api/v1/enrollment/:courseId', async function(req, res) {
    
  try {
    console.log("update Course Info")
    const courseId = req.params.courseId;
    const updatedGradesArray = req.body.row;
    for(let gradeObj of updatedGradesArray){
      //console.log(gradeObj)
      await db.raw(
        `update se_project.enrollments 
        set "grade" = ${gradeObj.grade} 
        where "courseId" = ${courseId}
        and "userId" = ${gradeObj.id}`);
    }

    return res.status(200).send("updated Successfully");
  } catch (e) {
    console.log(e.message);
    return res.status(400).send('Could not drop course');
  }
});



// update courses by Id 
app.put('/api/v1/courses/:courseId', async function(req, res) {
    
  try {
    console.log("update Course ID")
    const courseId = req.params.courseId;
    const {code, course, creditHours} = req.body;
    await db.raw(`update se_project.courses
                  set "code" = '${code}',
                      "course" = '${course}',
                      "creditHours" = '${creditHours}' 
                  where id = ${courseId}`)
    return res.status(200).send("updated Successfully");
  } catch (e) {
    console.log(e.message);
    return res.status(400).send('Could not drop course');
  }
});



  app.get('emptyTemplate', async function(req, res) {
    
    try {
      await db('se_project.sessions').insert(session);
      // In the response, set a cookie on the client with the name "session_cookie"
      // and the value as the UUID we generated. We also set the expiration time.
      return res.status(200).send('Could not register user')
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('Could not register user');
    }
  });

  app.post('/api/v1/faculties/transfer', async function(req, res) {
    
    try {
      const user = await getUser(req);
      const newFacultyId= req.body.newFacultyId;
      let transferObj = {
        userId : user.userId,
        currentFacultyId : user.facultyId,
        newFacultyId : newFacultyId,
        status : 'pending',
        date : new Date()
      };
      await db('se_project.transfers').insert(transferObj);
      return res.status(200).send('completed request')
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('Could not register user');
    }
  });




};
