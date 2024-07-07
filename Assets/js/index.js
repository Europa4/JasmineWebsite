let numberOfFrontPageStories = 5;

document.addEventListener("DOMContentLoaded", function() {
        loadStories();
});

function loadStories() {
    const file = "./Assets/Data/wishes.csv";
    Papa.parse(file, {
        download: true,
        header: true,
        complete: function(results) {
            processResults(results)
            }
        });
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

function processResults(results) {
    numberOfFrontPageStories = Math.min(results.data.length, numberOfFrontPageStories);
    for(let i = 0; i < numberOfFrontPageStories; i++){
        let divId = 'story-point-'.concat(i + 1);
        let indexNumber = results.data.length - i - 1;
        const mainArea = document.getElementById('main-area');
        if(mainArea) {
            storyPointDiv = document.createElement('div');
            storyPointDiv.id = divId;
            mainArea.appendChild(storyPointDiv);
            if(storyPointDiv) {
                console.log(results.data[indexNumber])
                storyPointDiv.appendChild(createWishGrantedDiv(results.data[indexNumber]['Title'],
                    results.data[indexNumber]['Content'],
                    results.data[indexNumber]['Image'],
                    results.data[indexNumber]['Placeholder']));
                }
            }
        }
}
