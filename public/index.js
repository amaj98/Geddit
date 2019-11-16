var ready = () => {
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
    let app = firebase.app();
    var db = firebase.database();


    var myid = "";
    var username = "";
    firebase.auth().onAuthStateChanged((user) => {
        myid = user["uid"];
        console.log("auth change");
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


    $("#createGoGeddit").click(() => firebase.auth().currentUser ? $("#goGedditStuffStuff").toggle() : googleLogin());

    $("#postGoGeddit").click(function () { //UPDATE
        var top = $("#goGedditName").val();
        var desc = $("#goGedditDesc").val();
        if (top && desc) {
            db.ref().child("goGeddits/" + top).set({ desc: desc, owner: myid });
            $("#goGedditStuffStuff").toggle();
        }
        else {
            alert("Please fill in all fields.")
        }

    });



    $("#userbutton").click(() => {
        googleLogin();
    });

    // FUNCTIONS //
    var createGoGeddit = (TOPIC, DESCRIPTION) => {
        db.ref().child("goGeddits/" + TOPIC).push({ name: TOPIC, desc: DESCRIPTION, owner: myid });
        document.getElementById("goGedditStuffStuff").style.display = 'none';
    }

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

var startGo = () => {
    $("body").empty();

    $("body").text("welcome to " + decodeURI(window.location.href.split('/').pop()));
}