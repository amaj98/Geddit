var ready = ()=>{
// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
    // // The Firebase SDK is initialized and available here!
    //
    // firebase.auth().onAuthStateChanged(user => { });
    // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
    // firebase.messaging().requestPermission().then(() => { });
    // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
    //
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

    
    let app = firebase.app();
    var db = firebase.database();
    var ref = db.ref("geddittest");
    ref.once("value",function(snapshot){
        console.log(JSON.stringify(snapshot.val()));
    });

    myid = "";
    firebase.auth().onAuthStateChanged((user)=>{
        myid = user["uid"];
        console.log(myid);
    });

    var googleLogin =()=>{
        var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        myid = user["uid"];
        console.log("TOKEN: " + token);
        console.log("User :" + user["uid"]);
        $("#authstuff").html(`<h1>Welcome ${user.displayName}</h1><p><img src="${user.photoURL}"></p>`);
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
    });
    }


    $("#join").click(function(){ //CREATE
        var name = $("#myname").val();

        if (name){
            db.ref().child("people/"+myid).set({name: name, online: true});
            db.ref("people").once("value",(snapshot)=>console.log(JSON.stringify(snapshot)));
        }
    });

    $("#leave").click(function(){ //DESTROY
        db.ref("people/"+myid).remove();
    });

    $("#edit").click(function(){ //UPDATE
        var name = $("#myname").val();

        if (!!name){
            db.ref("people").child(myid).update({name: name});
        }
    });

    $("#postgoGeddit").click(function(){ //UPDATE
        if (firebase.auth().currentUser){
            alert("You're IN");
        }
        else {
            googleLogin();
        }
    });



    db.ref("people").on("value", function(snap){
        $("#people").empty();
        var everyone = snap.val();

        for(var id in everyone){
            if (everyone.hasOwnProperty(id)){
            let yourname = everyone[id].name || "anonymous";
            $("#people").append(`<li>${yourname}</li>`);
            }
        }
    });
            
}