$(document).ready(function(){
    var empArray = [];
    $("#search").click(function() {
        const code = $('#departmentCode').val();
        $('#tbody').empty();
        $('#thead').empty();
        empArray = [];
        $.ajax({
        type: "GET",
        url: `/employee/`+`${code}`,
        success: function(data){
            if(data) {
                let index = 0;
                $('#thead').append(`
                      <tr>
                        <th class="text-center">Name</th>
                        <th class="text-center">Department</th>
                        <th class="text-center">Salary</th>
                      </tr>
                `);
                for( let row of data ){
                    $('#tbody').append(
                        `<tr>
                              <td class="text-center">${row.name}</td>
                              <td class="text-center">${row.depname}</td>
                              <td class="text-center">
                                <div class="col-sm-10">
                                    <input type="text"  id=${index} name="salary" placeholder="Enter salary" value=${row.salary} required >
                                </div>
                              </td>
                        </tr>`);
                    empArray.push({id : row.id, salary : row.salary});
                    index+=1;
                  }
                $('#div-btn').css("display","block");
            }
        }
        });
    });
    
    
    $('#update').click(function(){
        if($('#div-btn').css("display") == 'none'){
            return;
        }
        empArray = empArray.map( (embObj,index) => {
            embObj.salary = parseFloat($(`#${index}`).val());
            return embObj 
        });
        console.log("here",empArray)
        const obj = {row : empArray};
        $.ajax({
            type: "PUT",
            url: '/employee/update',
            data: obj,
            success: function(data){
              if(data) {
                console.log(data);
                $('#tbody').empty();
                $('#thead').empty();
                $('#div-btn').css("display","none");
                alert(data);
              }
            }
          });

    });



});