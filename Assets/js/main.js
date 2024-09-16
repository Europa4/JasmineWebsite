function loadExtraHTML(file, element) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(element).innerHTML = data;
            const scripts = document.querySelectorAll('#'.concat(element).concat(' script'));
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                newScript.src = script.src;
                document.head.appendChild(newScript);
                });
        });
    }

document.addEventListener("DOMContentLoaded", function() {
    let files = [{
        file: '/header.html',
        element: 'header-placeholder'
    }, 
    {
        file: '/footer.html',
        element: 'footer-placeholder'
    }];
    files.forEach(file => {
        loadExtraHTML(file.file, file.element);
    });
});