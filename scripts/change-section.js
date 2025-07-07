window.onload = function(){
    showSection('Main');
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        window.scrollTo({ top: 0 });
    });
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.add('active');
    }
}