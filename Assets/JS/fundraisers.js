document.addEventListener("DOMContentLoaded", function() {
        loadFundraisers();
});

function loadFundraisers() {
    fetch('/api/getFundraisers')
        .then(response => response.json())
        .then(data => {
            processResults(data);
        });
    }

    function createFundraiserDiv(title, description, imgSrc, imgAlt, id) {
        // Create the main container div
        const containerDiv = document.createElement('div');
        containerDiv.className = 'p-4 p-md-4 mb-4 text-black bg-fundraiser rounded';
    
        // Create the row div
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
    
        // Create the first column div
        const colDiv1 = document.createElement('div');
        colDiv1.className = (imgSrc && imgSrc.trim() !== '') ? 'col-md-6 px-0' : 'col-12 px-0'; // Full width if no image
    
        // Create the h1 element
        const h1 = document.createElement('h1');
        h1.className = 'display-4 fst-italic';
        h1.textContent = title;
    
        // Create the first paragraph
        const p1 = document.createElement('p');
        p1.className = 'lead my-3';

        // Check and limit the description length (only applies to the plain text, not HTML tags)
        const tempDiv = document.createElement('div');  // Create a temp div to measure text length
        tempDiv.innerHTML = description;  // Insert the description HTML into the temp div
        let plainText = tempDiv.textContent || tempDiv.innerText || '';  // Get the plain text without HTML tags
        
        if (plainText.length > 503) {
            description = plainText.substring(0, 500) + '...';
        }

        // Now use innerHTML to render HTML content properly
        p1.innerHTML = description;
    
        // Create the second paragraph
        const p2 = document.createElement('p');
        p2.className = 'lead mb-0';
    
        // Create the anchor element
        const anchor = document.createElement('a');
        anchor.href = '/fundraisers/' + id + '_' + title.replace(/\s+/g, '_');
        anchor.className = 'text-black fw-bold';
        anchor.textContent = 'Continue reading...';
    
        // Append the anchor to the second paragraph
        p2.appendChild(anchor);
    
        // Append the h1 and paragraphs to the first column div
        colDiv1.appendChild(h1);
        colDiv1.appendChild(p1);
        colDiv1.appendChild(p2);
    
        // Append the first column div to the row div
        rowDiv.appendChild(colDiv1);
    
        // Conditionally create and append the second column div
        if (imgSrc && imgSrc.trim() !== '') {
            const colDiv2 = document.createElement('div');
            colDiv2.className = 'col-md-6 px-0';
    
            // Create the img element
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = imgAlt;
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
    

function processResults(results) {
    for(let i = 0; i < results.data.length; i++){
        let divId = 'story-point-'.concat(i + 1);
        let indexNumber = results.data.length - i - 1;
        const mainArea = document.getElementById('main-area');
        if(mainArea) {
            storyPointDiv = document.createElement('div');
            storyPointDiv.id = divId;
            mainArea.appendChild(storyPointDiv);
            if(storyPointDiv) {
                console.log(results.data[indexNumber])
                storyPointDiv.appendChild(createFundraiserDiv(results.data[indexNumber].title,
                    results.data[indexNumber].content,
                    results.data[indexNumber].image,
                    results.data[indexNumber].placeholder,
                    results.data[indexNumber].id));
                }
            }
        }
}
