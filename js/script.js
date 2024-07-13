//#region declarations
const baseApiUrl = `https://www.themealdb.com/api/json/v1/1`;
const mainContainer = $('#mainContainer');
const nameRegex = /^[a-zA-Z ]+$/;
const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const phoneRegex = /^01[0125][0-9]{8}$/;
const ageRegex = /^(0?[6-9]|[1-9][0-9]|[1][0-1][0-9]|120)$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
let nameInputFocused = false;
let emailInputFocused = false;
let phoneInputFocused = false;
let ageInputFocused = false;
let passwordInputFocused = false;
let confirmPasswordInputFocused = false;
//#endregion declarations

//#region register events
$('#menuToggleBtn').click(function(){
    if ($('.side-nav-menu').css('left') == "0px") {
        closeSideNavMenu()
    } else {
        openSideNavMenu()
    }
});

$('.nav-links li').click(function(){
    closeSideNavMenu();
});

$('.search').click(function(){
    $('.main').hide(500, function(){
        showSearchArea();
    });
});

$('.categories').click(function(){
    getCategories();
});

$('.area').click(function(){
    getAreas();
});

$('.ingredients').click(function(){
    getIngredients();
});

$('.contact').click(function(){
    displayContactInputs();
});

$('.main .meal').click(function(){
    getMealDetails();
})
//#endregion

//do initial stuff
hideLoader(0);
closeSideNavMenu(true);
searchByName("");

//#region functions
function showLoader(timing = 100){
    $('.loading-screen').animate({scale:1},timing);
}

function hideLoader(timing = 100){
    $('.loading-screen').animate({scale:0},timing);
}

function closeSideNavMenu(instant = false){

    $('.nav-links li').attr('style', "");
    $('.nav-links li').animate({ right: 0 }, 0);

    if (instant){
        $('.nav-links li').animate({ right: "100%" }, 0);
    }
    else{
        for (let i = 0; i < 5; i++) {
            $('.nav-links li').eq(4 - i).animate({
                right: "100%"
            }, (i * 50) + 100)
        }
    }

    let navTabWidth = $('.side-nav-menu .nav-tab').outerWidth();
    $(".side-nav-menu")
        .delay((instant ? 0 : 200))
        .animate({left: -navTabWidth}, (instant ? 0 : 500));

    $('#menuToggleBtn').addClass("fa-align-justify");
    $('#menuToggleBtn').removeClass("fa-x");

}

function openSideNavMenu(){

    $(".side-nav-menu").animate({
        left: 0
    }, 300)

    $('#menuToggleBtn').addClass("fa-x");
    $('#menuToggleBtn').removeClass("fa-align-justify");

    $('.nav-links li').attr('style', "");
    $('.nav-links li').animate({ left: "100%" }, 0);
    for (let i = 0; i < 5; i++) {
        $('.nav-links li').eq(i).animate({
            left: 0
        }, (i + 5) * 100)
    }
}

function showSearchArea(){
    $('#searchContainer').html(`
        <div class="row py-4 ">

            <div class="col-md-6 ">
                <input type="text"
                       class="form-control bg-transparent text-white"
                       placeholder="Search By Name"
                       oninput="delayedSearch(this)" />
            </div>

            <div class="col-md-6">
                <input type="text" maxlength="1"
                       class="form-control bg-transparent text-white"
                       placeholder="Search By First Letter"
                       oninput="searchByFirstLetter(this)" />
            </div>
        </div>
    `);
}

function hideSearchArea(){
    $('#searchContainer').html("");
}

//========== searching ==========//
let delayedSearchTimeout = null;

function delayedSearch(input){
    const keyword = input.value;

    if(delayedSearchTimeout != null){
        clearTimeout(delayedSearchTimeout);  
    }

    delayedSearchTimeout = setTimeout(function(){
        searchByName(keyword)
    },600);  

}
function searchByName(keyword){
    closeSideNavMenu();
    $('.main').show(500, async function(){
        let response = await fetch(`${baseApiUrl}/search.php?s=${keyword}`);
        let data = await response.json();

        displayMeals(data.meals);
        hideLoader();
    });
}

function searchByFirstLetter(input){
    let letter =  input.value;

    closeSideNavMenu();
    letter.trim() == "" ? letter = "a" : "";
    $('.main').show(500, async function(){
        //www.themealdb.com/api/json/v1/1/search.php?f=a
        let response = await fetch(`${baseApiUrl}/search.php?f=${letter}`);
        let data = await response.json();

        displayMeals(data.meals);
        hideLoader();
    });
}

//========== categories ==========//
function getCategories(){
    showLoader();
    hideSearchArea();
    
    $('.main').show(500, async function(){
        let response = await fetch(`${baseApiUrl}/categories.php`);
        let data = await response.json();
    
        displayCategories(data.categories);
        hideLoader();
    });
}

function displayCategories(catArray){
    let htmlContent = "";

    catArray.forEach(cat => {
        const descriptionWords = cat.strCategoryDescription.split(" ");
        let ellipses = ""
        if (descriptionWords.length > 20){
            ellipses = `<span title="${cat.strCategoryDescription}">...</span>`;
        }

        htmlContent += `
            <div class="col-md-3">
                <div class="meal position-relative overflow-hidden rounded-2 cursor-pointer"
                     onclick="getCategoryMeals('${cat.strCategory}')">

                    <img class="w-100" src="${cat.strCategoryThumb}" alt="" />
                    <div class="meal-layer position-absolute text-center text-black p-2">
                        <h3>${cat.strCategory}</h3>
                        <p>
                            ${descriptionWords.slice(0,20).join(" ")} ${ellipses}
                        </p>
                    </div>
                </div>
            </div>
        `
    });

    mainContainer.html(htmlContent)
}

function getCategoryMeals(mealCategory){
    showLoader();
    hideSearchArea();

    $('.main').show(500, async function(){
        let response = await fetch(`${baseApiUrl}/filter.php?c=${mealCategory}`);
        let data = await response.json();

        displayMeals(data.meals);
        hideLoader();
    });
}

//========== areas ==========//
function getAreas(){
    showLoader();
    hideSearchArea();
    
    $('.main').show(500, async function(){
        let response = await fetch(`${baseApiUrl}/list.php?a=list`);
        let data = await response.json();
    
        displayAreas(data.meals.slice(0,20));
        hideLoader();
    });
}

function displayAreas(areaArray){
    let htmlContent = "";

    areaArray.forEach((area) => {
        htmlContent += `
            <div class="col-md-3">
                <div class="rounded-2 text-center hand area"
                     onclick="getAreaMeals('${area.strArea}')">
                    <i class="fa-solid fa-house-laptop fa-4x"></i>
                    <h3>${area.strArea}</h3>
                </div>
            </div>
        `;
    });
    mainContainer.html(htmlContent);
}

function getAreaMeals(mealArea){
    showLoader();
    hideSearchArea();

    $('.main').show(500, async function(){
        let response = await fetch(`${baseApiUrl}/filter.php?a=${mealArea}`);
        let data = await response.json();

        displayMeals(data.meals);
        hideLoader();
    });
}

//========== ingredients ==========//
function getIngredients(){
    showLoader();
    hideSearchArea();
    
    $('.main').show(500, async function(){
        let response = await fetch(`${baseApiUrl}/list.php?i=list`);
        let data = await response.json();
    
        displayIngredients(data.meals.slice(0,20));
        hideLoader();
    });
}

function displayIngredients(ingredientsArray){
    
    let htmlContent = "";

    ingredientsArray.forEach((ingredient) => {
        const descriptionWords = ingredient.strDescription.split(" ");
        let ellipses = ""
        if (descriptionWords.length > 20){
            ellipses = `<span title="${ingredient.strDescription}">...</span>`;
        }

        htmlContent += `
            <div class="col-md-3">
                <div class="rounded-2 text-center hand ingredient"
                     onclick="getIngredientsMeals('${ingredient.strIngredient.replaceAll(" ","_")}')">
                        <i class="fa-solid fa-drumstick-bite fa-4x"></i>
                        <h3>${ingredient.strIngredient}</h3>
                        <p>
                            ${descriptionWords.slice(0,20).join(" ")} ${ellipses}
                        </p>
                </div>
            </div>
        `;
    });
    mainContainer.html(htmlContent);
}

function getIngredientsMeals(ingredient){
    showLoader();
    hideSearchArea();

    $('.main').show(500, async function(){
        let response = await fetch(`${baseApiUrl}/filter.php?i=${ingredient}`);
        let data = await response.json();

        displayMeals(data.meals);
        hideLoader();
    });
}

//========== display meals ==========//

function displayMeals(mealArray){
    let htmlContent = "";

    mealArray.slice(0,20).forEach(meal => {
        htmlContent += `
            <div class="col-md-3">
                <div class="meal position-relative overflow-hidden rounded-2 hand"
                     onclick="getMealDetails('${meal.idMeal}')">

                    <img class="w-100" src="${meal.strMealThumb}" alt="food" />
                    <div class="meal-layer position-absolute text-center text-black p-2">
                        <h3 class="h4">${meal.strMeal}</h3>
                    </div>
                </div>
            </div>
        `
    });

    mainContainer.html(htmlContent);
}

async function getMealDetails(mealId){
    let response = await fetch(`${baseApiUrl}/lookup.php?i=${mealId}`);
    let data = await response.json();
    displayMealDetails(data.meals[0]);
}

function displayMealDetails(mealData){
    let htmlContent = "";

    let ingredientsList = "";
    let i = 1;
    while (mealData[`strIngredient${i}`]) {
        const ingredient = mealData[`strIngredient${i}`];
        const measure = mealData[`strMeasure${i}`];

        ingredientsList += `
            <li class="alert alert-info m-1 px-2 py-0">
                <span class="ingredient-measure">${measure}</span> ${ingredient}
            </li>
        `;

        i++;
    }

    let tagsList = "";
    mealData.strTags?.split(',').forEach((tag) => {
        tagsList += `
            <li class="alert alert-danger m-2 px-2 py-0">${tag}</li>
        `
    });

    htmlContent = `
        <div class="col-md-4">
            <img class="w-100 rounded-4" src="${mealData.strMealThumb}" alt="food">
            <h2>${mealData.strMeal}</h2>
        </div>
        <div class="col-md-8">
            <h3>Instructions</h3>
            <p>
                ${mealData.strInstructions}
            </p>

            <h3>
                Area:
                <span class="fw-lighter text-light">${mealData.strArea}</span>
            </h3>

            <h3>
                Category:
                <span class="fw-lighter text-light">${mealData.strCategory}</span>
            </h3>

            <h3>Recipes:</h3>
            <ul class="list-unstyled d-flex g-3 flex-wrap">
                ${ingredientsList}
            </ul>

            <h3>Tags:</h3>
            <ul class="list-unstyled d-flex g-3 flex-wrap">
                ${tagsList}
            </ul>

            <a target="_blank" href="${mealData.strSource}" class="btn btn-success">Source</a>
            <a target="_blank" href="${mealData.strYoutube}" class="btn btn-danger">Youtube</a>
        </div>
    `;

    mainContainer.html(htmlContent);
}

//========== contact us ==========//
function displayContactInputs(){
    hideSearchArea();

    let htmlContent = `
        <div class="contacts d-flex justify-content-center align-items-center">
            <div class="w-75 text-center">

                <div class="row g-4">
                    <div class="col-md-6">
                        <input id="nameInput" type="text"
                               class="form-control"
                               placeholder="Enter Your Name" />
                        
                        <div id="nameAlert" class="alert alert-danger w-100 mt-2 d-none">
                            Special characters and numbers not allowed
                        </div>
                    </div>

                    <div class="col-md-6">
                        <input id="emailInput" type="email"
                               class="form-control"
                               placeholder="Enter Your Email" />

                        <div id="emailAlert" class="alert alert-danger w-100 mt-2 d-none">
                            Email not valid *exemple@yyy.zzz
                        </div>
                    </div>

                    <div class="col-md-6">
                        <input id="phoneInput" type="text"
                               class="form-control"
                               placeholder="Enter Your Phone" />
                        
                        <div id="phoneAlert" class="alert alert-danger w-100 mt-2 d-none">
                            Enter valid Phone Number
                        </div>
                    </div>

                    <div class="col-md-6">
                        <input id="ageInput" type="number" min="6" max="120"
                               class="form-control"
                               placeholder="Enter Your Age" />
                        
                        <div id="ageAlert" class="alert alert-danger w-100 mt-2 d-none">
                            Enter valid age from 6 to 120
                        </div>
                    </div>

                    <div class="col-md-6">
                        <input id="passwordInput" type="password"
                               class="form-control"
                               placeholder="Enter Your Password" />
                        
                        <div id="passwordAlert" class="alert alert-danger w-100 mt-2 d-none">
                            Enter valid password *Minimum eight characters, at least one letter and one number:*
                        </div>
                    </div>

                    <div class="col-md-6">
                        <input id="confirmPasswordInput" type="password"
                               class="form-control"
                               placeholder="Confirm Password" />

                        <div id="confirmPasswordAlert" class="alert alert-danger w-100 mt-2 d-none">
                            Password confirm do not match the password, retry.
                        </div>
                    </div>
                </div>

                <button id="submitBtn" class="btn btn-outline-danger px-2 mt-3" disabled>Submit</button>
            </div>
        </div>
    `;
    mainContainer.html(htmlContent);

    $('#nameInput').on('blur', () => { nameInputFocused = true; })
    $('#emailInput').on('blur', () => { emailInputFocused = true; })
    $('#phoneInput').on('blur', () => { phoneInputFocused = true })
    $('#ageInput').on('blur', () => { ageInputFocused = true })
    $('#passwordInput').on('blur', () => { passwordInputFocused = true })
    $('#confirmPasswordInput').on('blur', () => { confirmPasswordInputFocused = true })

    $('.contact input').on('input', function(){ validateInputs(); });

    $('.main').show(500);
}

function validateInputs(){
    let isAllValid = true;

    if (nameInputFocused){
        if (isValidName()){
            $('#nameAlert').fadeOut(200);
        }
        else{
            $('#nameAlert').removeClass('d-none').fadeIn(200);
            isAllValid = false;
        }
    }

    if (emailInputFocused){
        if (isValidEmail()){
            $('#emailAlert').fadeOut(200);
        }
        else{
            $('#emailAlert').removeClass('d-none').fadeIn(200);
            isAllValid = false;
        }
    }

    if (phoneInputFocused){
        if (isValidPhone()){
            $('#phoneAlert').fadeOut(200);
        }
        else{
            $('#phoneAlert').removeClass('d-none').fadeIn(200);
            isAllValid = false;
        }
    }

    if (ageInputFocused){
        if (isValidAge()){
            $('#ageAlert').fadeOut(200);
        }
        else{
            $('#ageAlert').removeClass('d-none').fadeIn(200);
            isAllValid = false;
        }
    }

    if (passwordInputFocused){
        if (isValidPassword()){
            $('#passwordAlert').fadeOut(200);
        }
        else{
            $('#passwordAlert').removeClass('d-none').fadeIn(200);
            isAllValid = false;
        }
    }
    
    
    if (confirmPasswordInputFocused){
        if ($('#passwordInput').val() == $('#confirmPasswordInput').val()){
            $('#confirmPasswordAlert').fadeOut(200);
        }
        else{
            $('#confirmPasswordAlert').removeClass('d-none').fadeIn(200);
            isAllValid = false;
        }
    }

    $('#submitBtn').prop('disabled', !isAllValid);
}

function isValidName(){
    return nameRegex.test($('#nameInput').val());
}

function isValidEmail(){
    return emailRegex.test($('#emailInput').val());
}

function isValidPhone(){
    return phoneRegex.test($('#phoneInput').val());
}

function isValidAge(){
    return ageRegex.test($('#ageInput').val());
}

function isValidPassword(){
    return passwordRegex.test($('#passwordInput').val());
}
//#endregion