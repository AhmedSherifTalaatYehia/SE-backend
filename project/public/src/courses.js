$(document).ready(function(){
    //console.log("data",{{data}});
      $('.drop').click(function () {
        console.log("removed");
        var id = $(this).attr("id");
        $(this).parent().parent().remove();
        $.ajax({
        type: "PUT",
        url: `/api/v1/courses/${id}/drop`,
        success: function(serverResponse) {
            if(serverResponse) {
              console.log(`course Id ${id} has been dropped \n`);
            }
          },
          error: function(errorResponse) {
            if(errorResponse) {
              alert(`User login error: ${errorResponse.responseText}`);
            }            
          }
      });
      });
      
  });      