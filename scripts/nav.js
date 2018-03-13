var currentElement = document.getElementById("objective");

function hideCurrentElement() {
    currentElement.style.display = "none";
}

function showCurrentElement() {
    currentElement.style.display = "block";
}

function changeElement(newEleID) {
    return function () {
        hideCurrentElement();
        currentElement = document.getElementById(newEleID);
        showCurrentElement();
    }
}

document.getElementById("btnObjective").onclick = changeElement("objective");
document.getElementById("btnEducation").onclick = changeElement("education");
document.getElementById("btnExperience").onclick = changeElement("experience");
document.getElementById("btnCode").onclick = changeElement("code");
document.getElementById("btnLanguage").onclick = changeElement("language");
document.getElementById("btnContact").onclick = changeElement("contact");

