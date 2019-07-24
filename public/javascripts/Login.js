var btn = document.querySelector('.Log');

function Log_In() {
    var user = document.querySelector('.js-groupname').value;
    var pass = document.querySelector('.js-password').value;
    if (user == '' | pass == '')
    {
        alertify.notify("Fill all inputs",'error',3);
        return;
    }
    var request = new XMLHttpRequest();
    request.open('POST', '/login');
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({
        groupname: user,
        password: pass
    }))
    request.addEventListener('loadend', function(){
        var f = JSON.parse(request.response);
        alertify.notify(f.message, 'error', 3);
       if(f.go == true) window.open("../htmlfiles/dashboard.html","_self");
    })
}
