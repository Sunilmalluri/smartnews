function toggleVerticalMenu() {
    const verticalNav = document.getElementById('verticalNav');
    verticalNav.classList.toggle('active');
}

// Add click event to dropdown items in vertical menu
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.vertical-nav .dropdown > a');
    
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdownContent = this.nextElementSibling;
            dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
        });
    });
});
