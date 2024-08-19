document.getElementById('csvForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    console.log("Form submitted!");

    // Gather form data
    const formData = new FormData(event.target);

    var dataToSend = {title: "", content: "", placeholder: "", date: ""};
    // Log form data to verify its contents
    for (const [key, value] of formData.entries()) {
        console.log(key, value); // Log each key and value
        dataToSend[key] = value;
    }
    console.log(dataToSend)
    // Make the AJAX request using fetch
    fetch('/addNewStory', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Set the correct content type
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Parsed response:", data);
        console.log("with:", data.success)
        if (data.success) {
            const successToast = new bootstrap.Toast(document.getElementById('successToast'));
            successToast.show();
            document.getElementById('csvForm').reset();
        } else {
            console.error('Failed to add to CSV:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
