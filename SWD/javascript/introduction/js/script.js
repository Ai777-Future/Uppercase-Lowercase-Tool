document.getElementById("Alert").onclick = function(){
    alert("hi i am a alert")
}

document.getElementById("Console").onclick = function(){
    console.log("hi i am a console ")
}

document.getElementById("age").onclick = function(){ 
    var a = prompt("Enter Your Age")

    console.log("Your Age is " + a)
}

document.getElementById("exit").onclick = function()
{
    var isTrue = confirm("are you share you want to leave this page when you confim then i will blast your computer after push the ohk button")

    if(isTrue){
        console.log("your pc will be blast in 5 seconds...")

    }else{

        console.log("ohk your pc is safe now!!!1")

    }
}


document.title = "this is a javascript full course"


document.getElementById("one").onclick = function(){
    document.body.style.backgroundColor = "blue"
}
document.getElementById("two").onclick = function(){
    document.body.style.backgroundColor = "red"
}
document.getElementById("three").onclick = function(){
    document.body.style.backgroundColor = "green"
}
document.getElementById("four").onclick = function(){
    document.body.style.backgroundColor = "purple"
}