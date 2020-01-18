import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const proxy = 'https://cors-anywhere.herokuapp.com/';
            const res = await axios(`${proxy}https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.publisher = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
            console.log(res);
        } catch(e) {
            console.log(e);
        }
    };

    calcTimeCooked() {
        const numIngr = this.ingredients.length;
        const periods = Math.ceil(numIngr / 3);
        this.time = periods * 15;
    };

    calcServings() {
        this.servings = 4;
    };

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'stp', 'cup', 'pound'];
        const units = [...unitsShort, 'g', 'kg'];

        const newIngredients = this.ingredients.map(el => {
            // Uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            // Delete ()
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // Parse ingredients in count, unit, description
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;
            if(unitIndex > -1) {
                // It's a unit
                const arrCount = arrIng.slice(0, unitIndex);

                let count;
                if(arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };
            } else if(parseInt(arrIng[0], 10)) {
                // not a unit but 1st el is number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                };
            } else if(unitIndex === -1) {
                // not a unit and not a number
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                };
            }
            return objIng;
        });
        this.ingredients = newIngredients;
    };

    updateServings(type) {
        const newServing = type === 'dec' ? this.servings - 1 : this.servings + 1;

        this.ingredients.forEach(ing => {
            ing.count *= (newServing / this.servings);
        });

        this.servings = newServing;
    };
};
