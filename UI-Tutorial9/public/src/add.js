$(document).ready(function(){
    $("#submit").click(function() {
      const firstname = $('#fname').val();
      const middlename = $('#mname').val();
      const lastname = $('#lname').val();        
      const salary = $('#salary').val();
      const country = $('#country').val();
      const birthdate = $('#birthdate').val();

      if(!firstname  || !middlename || !lastname || !salary || !country || !birthdate){
        return;
      }

      const employeeObj = {firstname,middlename,lastname,salary,country,birthdate};
      console.log(employeeObj)
      
      

      $.ajax({
        type: "POST",
        url: '/employee/new',
        data: employeeObj,
        success: function (data){
          if(data) {
            $('#fname').val("");
            $('#mname').val("");
            $('#lname').val("");        
            $('#salary').val("");
            $('#country').val("");
            $('#birthdate').val("");
            console.log("message from server",data);
            alert(data);
          }
        }
      });
    });
});