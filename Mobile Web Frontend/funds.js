function addFunds(amt){
    var fundAmt = parseFloat(amt)
    submitQuery(`/create-checkout-session?amt=${fundAmt}`);
}

function withdrawFunds(){
    // Must Check Again
    submitQuery('/withdraw')
}


function submitQuery(query){
    var form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', query);
    form.style.display = 'hidden';
    document.body.appendChild(form)
    form.submit();
}