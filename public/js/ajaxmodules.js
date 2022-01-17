/* Ajax 모듈 */
function ajaxRequset(type,url,data,callback){
    $.ajax({
        type: type,
        url: url,
        data: data,
        dataType: 'json',
        success:function(success){
            callback(success);
        },
        error:function(error){
            var data = error.responseJSON;
            alert(data.errorMessage);
        }
    });
}