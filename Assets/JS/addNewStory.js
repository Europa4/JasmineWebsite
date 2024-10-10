document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('csvForm');

    // Check if the form exists
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission behavior

            // Get the Quill editor content
            var content = quill.root.innerHTML;
            
            // Set the hidden textarea with the formatted content
            document.getElementById('Content').value = content;

            // Gather form data, including the file
            const formData = new FormData(event.target);

            // Log form data to verify its contents
            for (const [key, value] of formData.entries()) {
                console.log(key, value); // Log each key and value
            }

            // Make the AJAX request using fetch
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
                    form.reset(); // Reset the form after successful submission
                } else {
                    console.error('Failed to add to CSV:', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    } else {
        console.error("Form not found!");
    }
});
