//Get the button:
mybutton = document.getElementById("my-btn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function tourneyFetch() {
    const tourneylist_url = "http://localhost:8000/tourneys/";
    fetch(tourneylist_url)
  .then(function (response) {
    console.log(response.json());
  })
  .then(function (data) {
    console.log(appendData(data));
  })
  .catch(function (err) {
    console.log(err);
  });
  
}

setTimeout(tourneyFetch, 5000);
tourneyFetch;