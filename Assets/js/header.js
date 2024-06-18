// Grab elements
const selectElement = selector =>{
    const element = document.querySelector(selector);
    if(element) return element;
    throw new Error('Something went wrong, make sure that the ${selector} exists in the DOM');

};
//Nav styles on scroll
const scrollHeader= () => {
    const headerElement = selectElement('#header');
    if(this.scrollY >= 15)
        {
            headerElement.classList.add('activated');
        }
        else
        {
            headerElement.classList.remove('activated');
        }
};

window.addEventListener('scroll', scrollHeader);
// Open menu & search pop-up
const formOpenBtn = selectElement('#search-icon');
const formCloseBtn = selectElement('#form-close-btn');
const searchContainer = selectElement('#search-form-container');

// Open/Close search form popup
formOpenBtn.addEventListener('click', () => searchContainer.classList.add('activated'));
formCloseBtn.addEventListener('click', () => searchContainer.classList.remove('activated'));
// -- Close the search form popup on ESC keypress
window.addEventListener('keyup', (event) => {
    if(event.key === 'Escape') searchContainer.classList.remove('activated');
});
// Switch theme/add to local storage
const bodyElement = document.body;
const themeToggleBtn = selectElement('#theme-toggle-btn');
const currentTheme = localStorage.getItem('currentTheme');

if(currentTheme)
{
    bodyElement.classList.add('light-theme');
}
themeToggleBtn.addEventListener('click', () =>
    {
        bodyElement.classList.toggle('light-theme');
        if(bodyElement.classList.contains('light-theme'))
        {
            localStorage.setItem('currentTheme', 'themeActive');
        }
        else
        {
            localStorage.removeItem('currentTheme');
        }
    });