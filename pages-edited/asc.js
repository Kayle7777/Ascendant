$(document).keydown(function(e) {
    console.log(e.which);
    switch(e.which) {
        case 37: {
            return $('.sidenav').find('a')[0].click();
        }

        case 39: {
            return $('.sidenav-right').find('a')[0].click();
        }

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});