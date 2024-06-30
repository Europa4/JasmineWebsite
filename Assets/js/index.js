document.addEventListener("DOMContentLoaded", function() {
        loadStories();
});

function loadStories() {
    const storyPointDiv = document.getElementById('story-point-1');
    if(storyPointDiv) {
        storyPointDiv.appendChild(createWishGrantedDiv('Recent Wish Granted',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus egestas auctor diam, ut ultrices nisi tempor sed. Praesent et quam elit. Etiam vel neque eu magna blandit lacinia. Nulla imperdiet magna non scelerisque interdum. Praesent non diam metus. Cras lorem arcu, venenatis vel commodo et, pretium sit amet dolor. Aliquam ultrices elit at rutrum dictum. Suspendisse vitae posuere orci, quis aliquam mi.',
            './Assets/Images/placeholder.jpg',
            'Placeholder image'));
        }
    }

function createWishGrantedDiv(title, description, imgSrc, imgAlt) {
    // Create the main container div
    const containerDiv = document.createElement('div');
    containerDiv.className = 'p-4 p-md-4 mb-4 text-white bg-dark rounded';

    // Create the row div
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row';

    // Create the first column div
    const colDiv1 = document.createElement('div');
    colDiv1.className = 'col-md-6 px-0';

    // Create the h1 element
    const h1 = document.createElement('h1');
    h1.className = 'display-4 fst-italic';
    h1.textContent = title;

    // Create the first paragraph
    const p1 = document.createElement('p');
    p1.className = 'lead my-3';
    p1.textContent = description;

    // Create the second paragraph
    const p2 = document.createElement('p');
    p2.className = 'lead mb-0';

    // Create the anchor element
    const anchor = document.createElement('a');
    anchor.href = '#';
    anchor.className = 'text-white fw-bold';
    anchor.textContent = 'Continue reading...';

    // Append the anchor to the second paragraph
    p2.appendChild(anchor);

    // Append the h1 and paragraphs to the first column div
    colDiv1.appendChild(h1);
    colDiv1.appendChild(p1);
    colDiv1.appendChild(p2);

    // Create the second column div
    const colDiv2 = document.createElement('div');
    colDiv2.className = 'col-md-6 px-0';

    // Create the img element
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = imgAlt;
    img.className = 'img-fluid rounded';

    // Append the img to the second column div
    colDiv2.appendChild(img);

    // Append the column divs to the row div
    rowDiv.appendChild(colDiv1);
    rowDiv.appendChild(colDiv2);

    // Append the row div to the main container div
    containerDiv.appendChild(rowDiv);

    // Append a line break after the main container div
    const br = document.createElement('br');
    containerDiv.appendChild(br);

    // Return the constructed HTML element
    return containerDiv;
}
