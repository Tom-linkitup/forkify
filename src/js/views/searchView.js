import { elements } from "./base"

export const getInput = () => elements.searchInput.value

export const clearInput = () => {
    elements.searchInput.value = ""
}

export const clearResults = () => {
    elements.searchResList.textContent = ""
    elements.searchResPages.textContent = ""
}

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll(".results__link"))
    resultsArr.forEach(el => {
        el.classList.remove("results__link--active")
    })
    document.querySelector(`.results__link[href*="#${id}"]`).classList.add("results__link--active")
}

export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = []
    if(title.length > limit){
        title.split(" ").reduce((acc, cur) => {
            if(acc + cur.length <= 17){
                newTitle.push(cur)
            }
            return acc + cur.length
        }, 0)
        return `${newTitle.join(" ")} ...`
    }
    return title
}

const renderRecipe = (recipe) => {
    const html = `
                <li>
                    <a class="results__link " href="#${recipe.recipe_id}">
                        <figure class="results__fig">
                            <img src=${recipe.image_url} alt="${recipe.title}">
                        </figure>
                        <div class="results__data">
                            <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                            <p class="results__author">${recipe.publisher}</p>
                        </div>
                    </a>
                </li>
                `;
    elements.searchResList.insertAdjacentHTML("beforeend", html)
}
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === "prev" ? page - 1 : page + 1}>
        <span>Page ${type === "prev" ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === "prev" ? "left" : "right"}"></use>
        </svg>
    </button>
`;

const renderButton = (page, numOfResults, resPerPage) => {
    const pages = Math.ceil(numOfResults / resPerPage)
    let button
    if(page === 1 && page >= 1){
    //first page button
    button = createButton(page, "next")
    }else if(page < pages){
    //middle page button: both button
    button = `
        ${button = createButton(page, "prev")}
        ${button = createButton(page, "next")}
    `
    }else if(page === pages && pages > 1){
    //last page button
    button = createButton(page, "prev")
    }
    elements.searchResPages.insertAdjacentHTML("afterbegin", button)
}

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    //render results of current pages
    const start = (page - 1) * resPerPage
    const end = page * resPerPage
    recipes.slice(start, end).forEach(renderRecipe)
    //render pagination button
    renderButton(page, recipes.length, resPerPage)
}