function getCoords(lat, lon) {
    window.location = `/home?lat=${lat}&lon=${lon}`
}
var url = window.location.href;
if (url.includes('?')) {
}else{
    if('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            getCoords(position.coords.latitude, position.coords.longitude);
        });
    }else{
        console.log('Navigator not supported')
    }
}