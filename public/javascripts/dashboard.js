var request = new XMLHttpRequest();
var f;
var channelID;
var Group_name;
var users;
request.open('GET', '/groupinfo');
request.setRequestHeader('Content-Type', 'application/json');
request.send();
request.addEventListener('loadend', async function(){
    f = await JSON.parse(request.response);
    channelID = f.channelID;
    Group_name = f.groupname;
    users = f.members;

    document.getElementById("nemodar1").setAttribute("src","https://thingspeak.com/channels/"+channelID+"/charts/1?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&type=line&update=15");
    document.getElementById("nemodar2").setAttribute("src","https://thingspeak.com/channels/"+channelID+"/charts/2?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&type=line&update=15");
    document.getElementById("nemodar3").setAttribute("src","https://thingspeak.com/channels/"+channelID+"/charts/3?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&type=line&update=15");
    document.getElementById("nemodar4").setAttribute("src","https://thingspeak.com/channels/"+channelID+"/charts/4?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&type=line&update=15");
    document.getElementById("js-username").innerHTML = Group_name;
    
    for (let index = 1; index <= users.length; index++) {
        var id = "user"+index;
        console.log(id);
        document.getElementById(id).innerHTML = users[index-1];   
    }

});


var logoutbtn = document.querySelector('.js-logout');

function logout()
{
    var request = new XMLHttpRequest();
    request.open('GET', '/logout');
    request.setRequestHeader('Content-Type', 'application/json');
    request.send();
    request.addEventListener('loadend', function(){
        var f = JSON.parse(request.response);
        alert(f.message);
    });
    window.open('../htmlfiles/Login.html','_self');
}


logoutbtn.addEventListener('click', async function(){
    logout();
} );