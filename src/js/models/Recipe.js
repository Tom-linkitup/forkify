import axios from "axios"

export default class Recipe {
    constructor(id){
        this.id = id
    }

    async getRecipe(){
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title
            this.author = res.data.recipe.publisher
            this.img = res.data.recipe.image_url
            this.source = res.data.recipe.source_url
            this.ingredients = res.data.recipe.ingredients
        }catch(error){
            console.log(error)
        }
    }

    calculateCookTime(){
        const numOfIng = this.ingredients.length
        const periods = numOfIng / 3
        this.time = periods * 15
    }

    calculateServings(){
        this.servings = 4
    }

    parseIngredients(){
        const unitsLong = ["tablespoons", "tablespoon", "ounces", "ounce", "teaspoons", "teaspoon", "cups", "pounds"]
        const unitsShort = ["tbsp", "tbsp", "oz", "oz", "tsp", "tsp", "cup", "pound"]
        const units = [...unitsShort, "kg", "g"]
        const newIngredients = this.ingredients.map(el => {
            //uniform units
            let ingredient = el.toLowerCase()
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i])
            })
            //remove parenthesis : Regular Expression 
            ingredient = ingredient.replace(/ *\([^)]*\) */g, " ")
            //parse ingredient into count, unit and ingredient
            const arrIng = ingredient.split(" ")
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2))

            let objIng
            if(unitIndex > -1){
                const arrCount = arrIng.slice(0, unitIndex)
                let count
                if(arrCount.length === 1){
                    count = eval(arrIng[0].replace("-", "+"))
                }else {
                    count = eval(arrCount.join("+"))
                }
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(" ")
                }

            }else if(parseInt(arrIng[0], 10)){
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: "",
                    ingredient: arrIng.slice(1).join(" ")
                }

            }else if(unitIndex === -1){
                objIng = {
                    count: 1,
                    unit: "",
                    ingredient
                }
            }

            return objIng
        })
        this.ingredients = newIngredients
    }

    updateServings(type){
        // Servings
        const newServings = type === "dec" ? this.servings - 1 : this.servings + 1

        //Ingredients
        this.ingredients.forEach(ing => {
            ing.count = ing.count * (newServings / this.servings)
        })
        this.servings = newServings
    }
}