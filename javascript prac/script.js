// VARIABLES AND DATA TYPES


let name = "sandeep singh";
let age = 21;
let IsStudent = true;


console.log(name);
console.log(age);
console.log(IsStudent);

// OPERATORS

num1 = 15;
num2 = 17;

let = num1;
let = num2

console.log(num1+num2);
console.log(num1-num2);
console.log(num1*num2);
console.log(num1/num2);
console.log(num1%num2);



//Conditional Statements

let umar = 12;

if(umar >= 18){
console.log("you are eligible for vote");
}else{
    console.log("you are not eligible for vote");
}



// else if


let marks = 50;

if(marks >= 80){
console.log("GRADE A");
}else if(marks >= 70){
console.log("GRADE B");
}else if(marks >= 60){
console.log("GRADE C");
}else if(marks >= 50){
console.log("SORRY YOU ARE FAIL");
}


// PRACTICE 
let num = 21;

if(num % 2 === 0){
    console.log("even number");
}else{
    console.log("odd numbers");
}


let temp = 30;

if(temp >= 30){
    console.log("its hot");
}else if(temp >= 20){
 console.log("It's Pleasant")
}else if(temp >= 10){
    console.log("its cold");
}else{
    console.log("its freezing");
}




// for loop

for(let i = 1; i<=5; i++){
    console.log(i);
}

// while loop

let i = 1;
while(i <= 5){
    console.log(i);
    i++
}

// do while loop

let i = 1;
do{
    console.log(i);
    i++;

}while(i<=5)


    // pracitce for loops

    for(let i = 1; i<=10; i++){
    console.log(i*2);
    }

// do while loop practice
let i = 2;
do{
console.log(i);
i++;
}while(i<=10);



// ARRAY + LOOPS PRACTICE


let peoples = ["person1","person2","person3","person4","person5","person6"];

for(let i = 0; i<=peoples.length; i++){
console.log(peoples[5]);
}


// PRACTICE 

let num = [1,2,3,4,5,6,7,8,9,10];

for(let i = 0; i<=num.length; i++){
if(num[i] % 2 === 0){
console.log(num[i]+ "even number")
}else{
    console.log(num[i] + "odd number")
}
}
