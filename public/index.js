var app;
var db;
var myid;

var readyAll = ()=>{
        // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
    // // The Firebase SDK is initialized and available here!
    //
    // firebase.auth().onAuthStateChanged(user => { });
    // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
    // firebase.messaging().requestPermission().then(() => { });
    // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
    //
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

    // LOGIN STUFF //
    app = firebase.app();
    db = firebase.database();

    var username = "";
    firebase.auth().onAuthStateChanged((user) => {
        myid = user["uid"];
        db.ref("gedders/" + myid).once("value", (snapshot) => {
            if (snapshot) username = snapshot.child("name").val();

            else {
                username = user["name"].split('@')[0]
                db.ref().child("gedders/" + myid).set({ name: username });
            }
            $("#settingsmsg").text("logged in as: " + username);
            $("#usernamein").val(username);
            $("#userbutton").text("Settings");
            $("#userbutton").unbind();
            $("#userbutton").click(() => $(".usersettings").toggle());
        });

    });

    $("#editname").click(() => {

        let namein = $("#usernamein").val();
        if (namein) db.ref("gedders").child(myid).update({ name: namein });
        $("#settingsmsg").text("logged in as: " + namein);
    });

    $("#logout").click(() => {
        firebase.auth().signOut().then(()=>document.location.reload(true))
    });

    var googleLogin = () => {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function (result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            myid = user["uid"];


        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
        });
    }
    $("#userbutton").click(() => googleLogin());

    // Scroll Button Stuff //
    window.onscroll = function() {scrollFunction()};
    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            document.getElementById("scrollButton").style.display = "block";
        } else {
            document.getElementById("scrollButton").style.display = "none";
        }
    }
    $("#scrollButton").click(() => {
        //document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    });
}

// HOME PAGE //
var readyHome = () => {
    $("#createGoGeddit").click(() => firebase.auth().currentUser ? $("#goGedditStuffStuff").toggle() : googleLogin());

    $("#postGoGeddit").click(function () { //UPDATE
        var top = $("#goGedditName").val();
        var desc = $("#goGedditDesc").val();
        if (top && desc) {
            db.ref().child("goGeddits/" + top).set({ desc: desc, owner: myid });
            $("#goGedditStuffStuff").toggle();
            window.location.replace(window.location.href+"/go/"+top);
        }
        else {
            alert("Please fill in all fields.")
        }

    });

    var deleteGoGeddit = ()=> {
        db.ref().child("goGeddits").once('value', (snapshot) => snapshot.forEach((child) => {

        }));
    }

    // 
    db.ref().child("goGeddits").once('value', (snapshot) => snapshot.forEach((child) => {
        db.ref('gedders/' + child.val().owner).once('value', (snapshot) => {
            $(".gogeddits").append(`<div class="card text-center">
            <div class="card-body">
            <h5 class="card-title">${child.key}</h5>
            <p class="card-text">${child.val().desc}</p>
            <a href="/go/${child.key}" class="btn btn-primary">Go</a>
            </div>
            <div class="card-footer text-muted">
            created by ${snapshot.val().name}
            </div>
        </div>`
            )
        });
    }));
}

var readyGo = () => {
    var gogeddit = decodeURI(window.location.href.split('/').pop())
    let goref = db.ref("goGeddits/"+gogeddit);
    $(".header").prepend(gogeddit);
    $("#postbutton").click(()=>$(".createPost").toggle());
    $('#submitPost').click(()=>{
        let title = $('#postTitle').val()
        let bod = $('#postBody').val()
        if(title && bod){
            goref.child("posts/").push({creator: myid, title: title, body:bod});
            $(".createPost").toggle();
            document.location.reload();
        }
        else alert("Invalid Post");
    });
    goref.child("posts").once('value', (snapshot) => snapshot.forEach((child) => {
        db.ref('gedders/' + child.val().creator).once('value', (snapshot) => {
            $(".posts").append(`<div class="card text-center">
            <div class="card-body">
            <h5 class="card-title">${child.val().title}</h5>
            <p class="card-text">${child.val().body.length<1000?child.val().body:child.val().body.slice(0,1000)+'...'}</p>
            <a href="/go/${gogeddit}/post/${child.key}" class="btn btn-primary">GoGettem</a>
            <p></p>
            <button type = "button" class = "btn btn-success" id = "U${child.key}">GoUp</button>
            <button type = "button" class = "btn btn-danger" id = "D${child.key}">GoDown</button>
            <p></p>
            <div class="badge badge-pill badge-dark" style = "font-size:16px;" id = "NV${child.key}">0</div>
            </div>
            <div class="card-footer text-muted">
            post by ${snapshot.val().name}
            </div>
        </div>`
            )
            //"#U"+key is the id for upvote button for post with that key
            //D is downvote button
            //NV is number of votes

            //loop through voters for post and adds up vals, then sets sum in html
            
            goref.child("posts/"+child.key+"/voters").once("value",(snapshot)=>
                snapshot.forEach((voter)=>{$("#NV"+child.key).text(parseInt($("#NV"+child.key).text()) + voter.val());})
            );
            
            
            $("#U"+child.key).click(()=>{
                
                goref.child("posts/"+child.key+"/voters/"+myid).once("value",(snapshot)=>{
                    let v = snapshot.val()?snapshot.val():0;
                    switch(v){
                        case -1:
                            goref.child("posts/"+child.key+"/voters/"+myid).set(1);
                            $("#NV"+child.key).text(parseInt($("#NV"+child.key).text()) + 2);
                            break;
                        case 0:
                            goref.child("posts/"+child.key+"/voters/"+myid).set(1);
                            $("#NV"+child.key).text(parseInt($("#NV"+child.key).text()) + 1);
                            break;
                        case 1:
                            goref.child("posts/"+child.key+"/voters/"+myid).set(0);
                            $("#NV"+child.key).text(parseInt($("#NV"+child.key).text()) - 1);
                            break;    
                    }
                })
            });

            $("#D"+child.key).click(()=>{
                goref.child("posts/"+child.key+"/voters/"+myid).once("value",(snapshot)=>{
                    let v = snapshot.val()?snapshot.val():0;
                    console.log(v);
                    switch(v){
                        case -1:
                            goref.child("posts/"+child.key+"/voters/"+myid).set(0);
                            $("#NV"+child.key).text(parseInt($("#NV"+child.key).text()) + 1);
                            break;
                        case 0:
                            goref.child("posts/"+child.key+"/voters/"+myid).set(-1);
                            $("#NV"+child.key).text(parseInt($("#NV"+child.key).text()) - 1);
                            break;
                        case 1:
                            goref.child("posts/"+child.key+"/voters/"+myid).set(-1);
                            $("#NV"+child.key).text(parseInt($("#NV"+child.key).text()) - 2);
                            break;    
                    }
                })
            });



        });
    }));
}

var readyPost = () => {
    var post = decodeURI(window.location.href.split('/').pop());
    var gogeddit = decodeURI(window.location.href.split('/')[4]);
    let postref = db.ref("goGeddits/"+gogeddit+"/posts/"+post);
    $(".header").prepend(gogeddit);
    $("#commentbutton").click(()=>$(".createComment").toggle());
    $('#submitComment').click(()=>{
        let bod = $('#commentBody').val()
        if(bod){
            postref.child("comments").push({body:bod,commentor: myid});
            $(".createComment").toggle();
            document.location.reload();
        }
        else alert("Invalid Comment");
    });
    postref.once('value',(snapshot)=>$(".post").append(`
    <div class="jumbotron jumbotron-fluid">
  <div class="container">
    <h1 class="display-4">${snapshot.val().title}</h1>
    <p class="lead">${snapshot.val().body}</p>
  </div>
</div>`));
    
    postref.child("comments").once('value', (snapshot) => snapshot.forEach((child) => {
        db.ref('gedders/' + child.val().commentor).once('value', (snapshot) => {
            $(".comments").append(`<div class="card text-center">
            <div class="card-body">
            <p class="card-text">${child.val().body}</p>
            <p></p>
            <button type = "button" class = "btn btn-success" id = "U${child.key}">GoUp</button>
            <button type = "button" class = "btn btn-danger" id = "D${child.key}">GoDown</button>
            <p></p>
            <div class="badge badge-pill badge-dark" style = "font-size:16px;" id = "NV${child.key}">0</div>
            </div>
            <div class="card-footer text-muted">
            post by ${snapshot.val().name}
            </div>
        </div>`
            )
            //"#U"+key is the id for upvote button for post with that key
            //D is downvote button
            //NV is number of votes

            //loop through voters for post and adds up vals, then sets sum in html
            
            postref.child("comments/"+child.key+"/voters").once("value",(snapshot)=>
                snapshot.forEach((voter)=>{$("#NV"+child.key).text(parseInt($("#NV"+child.key).text()) + voter.val());})
            );
            
            
            $("#U"+child.key).click(()=>{
                postref.child("comments/"+child.key+"/voters/"+myid).once("value",(snapshot)=>{
                    let v = snapshot.val()?snapshot.val():0;
                    switch(v){
                        case -1:
                            postref.child("comments/"+child.key+"/voters/"+myid).set(1);
                            $("#NV"+child.key).text(parseInt($("#NV"+child.key).text()) + 2);
                            break;
                        case 0:
                            postref.child("comments/"+child.key+"/voters/"+myid).set(1);
                            $("#NV"+child.key).text(parseInt($("#NV"+child.key).text()) + 1);
                            break;
                        case 1:
                            postref.child("comments/"+child.key+"/voters/"+myid).set(0);
                            $("#NV"+child.key).text(parseInt($("#NV"+child.key).text()) - 1);
                            break;    
                    }
                })
            });

            $("#D"+child.key).click(()=>{
                postref.child("comments/"+child.key+"/voters/"+myid).once("value",(snapshot)=>{
                    let v = snapshot.val()?snapshot.val():0;
                    switch(v){
                        case -1:
                            postref.child("comments/"+child.key+"/voters/"+myid).set(0);
                            $("#NV"+child.key).text(parseInt($("#NV"+child.key).text()) + 1);
                            break;
                        case 0:
                            postref.child("comments/"+child.key+"/voters/"+myid).set(-1);
                            $("#NV"+child.key).text(parseInt($("#NV"+child.key).text()) - 1);
                            break;
                        case 1:
                            postref.child("comments/"+child.key+"/voters/"+myid).set(-1);
                            $("#NV"+child.key).text(parseInt($("#NV"+child.key).text()) - 2);
                            break;    
                    }
                })
            });



        });
    }));
}