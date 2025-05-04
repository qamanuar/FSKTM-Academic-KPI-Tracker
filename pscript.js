const profileContainer = document.querySelector('.profile-container');
const editButton = document.getElementById('editProfileBtn');
const saveButton = document.getElementById('saveProfileBtn');
const cancelButton = document.getElementById('cancelEditBtn');
const editProfileLink = document.querySelector('.user-details-right .edit-profile-link'); // Get the link

const viewEmailSpan = document.getElementById('viewEmail');
const editEmailInput = document.getElementById('editEmail');
const viewCountrySpan = document.getElementById('viewCountry');
const editCountryInput = document.getElementById('editCountry');
const viewTimezoneSpan = document.getElementById('viewTimezone');
const editTimezoneInput = document.getElementById('editTimezone');
const viewRegisterationNumSpan = document.getElementById('viewRegisterationNum');
const editRegisterationNumInput = document.getElementById('editRegisterationNum');

const enabledEditMode = () => {
    profileContainer.classList.add('edit-mode');
    editEmailInput.value = viewEmailSpan.textContent.split(' ')[0]; // Extract email
    editCountryInput.value = viewCountrySpan.textContent;
    editTimezoneInput.value = viewTimezoneSpan.textContent;
    editRegisterationNumInput.value = viewRegisterationNumSpan.textContent;
};

editButton.addEventListener('click', enabledEditMode);

editProfileLink.addEventListener('click', (event) =>{
    event.preventDefault(); //prevent the link from navigating
    enabledEditMode(); //call
})

saveButton.addEventListener('click', () => {
    const newEmail = editEmailInput.value;
    const newCountry = editCountryInput.value;
    const newTimezone = editTimezoneInput.value;
    const newRegisterationNum = editRegisterationNumInput.value;

    // In a real application, you would send this data to a server

    // For this example, just update the displayed values
    viewEmailSpan.textContent = `${newEmail} (Visible to other course participants)`;
    viewCountrySpan.textContent = newCountry;
    viewTimezoneSpan.textContent = newTimezone;
    viewRegisterationNumSpan.textContent = newRegisterationNum;

    profileContainer.classList.remove('edit-mode');
});

cancelButton.addEventListener('click', () => {
    profileContainer.classList.remove('edit-mode');
});