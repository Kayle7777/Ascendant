$(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
        $('.sidenav>a').click();

        case 38: // up
        $('.sidnav-right>a').click();

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});