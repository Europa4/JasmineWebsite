document.getElementById('csvForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    console.log("Form submitted!");

    // Gather form data, including the file
    const formData = new FormData(event.target);

    // Log form data to verify its contents
    for (const [key, value] of formData.entries()) {
        console.log(key, value); // Log each key and value
    }

    // Make the AJAX request using fetch (no headers set because FormData is being sent)
    fetch('/addNewStory', {
        method: 'POST',
        body: formData // FormData includes the file automatically
    })
    .then(response => response.json())
    .then(data => {
        console.log("Parsed response:", data);
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
