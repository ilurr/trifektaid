function setCookies(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    // document.cookie = cname + "=" + cvalue + ";" + expires + "; path=/; domain=trifekta.id; SameSite=None; Secure";
    document.cookie = cname + "=" + cvalue + ";" + expires + "; path=/; ";
}
function getCookies(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function checkCookies(cname) {
    var c = getCookies(cname);
    if (c != "") {
        return true
    } else {
        return false
    }
}
