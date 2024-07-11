var container = document.querySelector("body > main > div.first-screen-container.border-box.flex-center.fade-in-down-animation");

if (container) {
    var cloudDiv = document.createElement('div');
    cloudDiv.className = 'bg-cloud';
    container.appendChild(cloudDiv);
}