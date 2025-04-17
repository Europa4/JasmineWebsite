document.addEventListener("DOMContentLoaded", function() {
    loadCommittee(); // Fetch and display committee members
});

function loadCommittee() {
    fetch('/api/getComitteMembers') // Fetch data from the API
        .then(response => response.json())
        .then(data => {
            processCommitteeResults(data); // Process and display the data
        })
        .catch(error => {
            console.error('Error fetching committee members:', error);
        });
}

function processCommitteeResults(data) {
    const committeeContainer = document.getElementById('committee-container'); // Assuming you have a div with id 'committee-container'
    committeeContainer.innerHTML = ''; // Clear any existing content

    // Loop through the committee members and create cards for each
    data.forEach(member => {
        const memberCard = createCommitteeMemberCard(member.name, member.position, member.desription, member.image);
        committeeContainer.appendChild(memberCard); // Add the card to the container
    });
}

function createCommitteeMemberCard(name, position, description, imgSrc) {
    // Use the existing createEventDiv function logic but adapted for committee members

    // Create the main container div
    const containerDiv = document.createElement('div');
    containerDiv.className = 'p-4 p-md-4 mb-4 text-black bg-secondary rounded';

    // Create the row div
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row';

    // Create the first column div
    const colDiv1 = document.createElement('div');
    colDiv1.className = imgSrc ? 'col-md-6 px-0' : 'col-12 px-0'; // Full width if no image

    // Create the h1 element for the name
    const h1 = document.createElement('h1');
    h1.className = 'display-6 fst-italic'; // Adjusted class for committee member card
    h1.textContent = name;

    // Create the h2 element for the position, if it exists
    const h2 = document.createElement('h2');
    h2.className = 'lead my-1';
    h2.textContent = position ? position : ''; // Display position only if it's provided

    // Create the first paragraph for description
    const p1 = document.createElement('p');
    p1.className = 'lead my-3';
    p1.textContent = description;

    // Append name, position, and description to the first column div
    colDiv1.appendChild(h1);
    if (position) {
        colDiv1.appendChild(h2); // Only append if position is present
    }
    colDiv1.appendChild(p1);

    // Append the first column div to the row div
    rowDiv.appendChild(colDiv1);

    // Conditionally create and append the second column div for the image
    if (imgSrc && imgSrc.trim() !== '') {
        const colDiv2 = document.createElement('div');
        colDiv2.className = 'col-md-6 px-0';

        // Create the img element
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = name;
        img.className = 'img-fluid rounded';

        // Append the img to the second column div
        colDiv2.appendChild(img);

        // Append the second column div to the row div
        rowDiv.appendChild(colDiv2);
    }

    // Append the row div to the main container div
    containerDiv.appendChild(rowDiv);

    // Append a line break after the main container div
    const br = document.createElement('br');
    containerDiv.appendChild(br);

    // Return the constructed HTML element
    return containerDiv;
}