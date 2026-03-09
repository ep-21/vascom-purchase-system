const form = document.getElementById("loginFormElement");

form.addEventListener("submit", async function(e){

    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try{

        const response = await fetch("http://localhost:5000/api/login",{

            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                email:email,
                password:password
            })

        });

        const data = await response.json();

        console.log(data);

        if(data.token){

            localStorage.setItem("token",data.token);
            localStorage.setItem("role",data.role);

            if(data.role === "technical"){
                window.location.href="technical.html";
            }

            if(data.role === "finance"){
                window.location.href="finance.html";
            }

            if(data.role === "manager"){
                window.location.href="manager.html";
            }

        }else{
            alert("Login failed");
        }

    }catch(error){
        console.log(error);
    }

});