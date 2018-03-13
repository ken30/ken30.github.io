var currentElement = document.getElementById("objective");
var currentButton = document.getElementById("btnObjective");

currentButton.style.color = "#e20f2f";

function changeElement(newEleID, btnName) {
    return function () {
        currentElement.style.display = "none";
        currentButton.style.color = "gray"
        
        currentElement = document.getElementById(newEleID);
        currentButton = document.getElementById(btnName)
        
        currentElement.style.display = "block";
        currentButton.style.color = "#e20f2f";
    }
}

document.getElementById("btnObjective").onclick = changeElement("objective", "btnObjective");
document.getElementById("btnEducation").onclick = changeElement("education", "btnEducation");
document.getElementById("btnExperience").onclick = changeElement("experience", "btnExperience");
document.getElementById("btnCode").onclick = changeElement("code", "btnCode");
document.getElementById("btnLanguage").onclick = changeElement("language", "btnLanguage");
document.getElementById("btnContact").onclick = changeElement("contact", "btnContact");

