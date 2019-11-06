import axios from "axios";
import {key3 , proxy } from "../config"

export default class Recipe {
    constructor(id){
        this.id = id;
    }
    async getRecipe() {
        try{
            const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${key3}&rId=${this.id}`);
            const model = res.data.recipe;
            this.title = model.title;
            this.author = model.publisher;
            this.img = model.image_url;
            this.url = model.source_url;
            this.ingrediens = model.ingredients;
            console.log(res);
        }
        catch(error) {
            console.log(error);
            alert(`Somthing went wrong... ${error} `);
        }
    }
    calcTime(){
        const numIng = this.ingrediens.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }
    calcServings(){
        this.servings = 4;
    }

    parseIngredints(){
        const unitLong = ["tablespoons", "tablespoon", "ounces", "ounce","teaspoons","teaspoon","cups","pounds"];
        const unitShort = ["tbsp", "tbsp", "oz", "oz","tsp","tsp","cup","pound", "kg", "g"];

        const newIngrendients = this.ingrediens.map(el => {
            // uniform units
            let ingredient = el.toLowerCase();
            unitLong.forEach((unit,i) =>{
                ingredient = ingredient.replace(unit, unitShort[i]);
            });
            // remve pers.
            ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");
            // pasre ingredints into unit, count and ingredint
            const arrIng = ingredient.split(" ");
            const unitIndex = arrIng.findIndex(el2 => unitShort.includes(el2));
            let objIng;
            if ( unitIndex >-1)
            {
                //there is a unit
                const arrCount =  arrIng.slice(0, unitIndex);
                let count;
                if (arrCount.length === 1){
                    count = eval(arrIng[0].replace("-","+"));
                }else{
                    count = eval(arrIng.slice(0, unitIndex).join("+"));
                }
                objIng = {
                    count,
                    unit :arrIng[unitIndex],
                    ingredint: arrIng.slice(unitIndex+1).join(" ")
                }


            }else if(parseInt(arrIng[0],10) ){
                // there is no unit vut first elemnte is number
                objIng = {
                    count: parseInt(arrIng[0],10),
                    unit :"",
                    ingredint: arrIng.slice(1).join(" ")
                }
            }
            else if(unitIndex === -1){
                // there is no unit and no number in first position
                objIng = {
                    count: 1,
                    unit :"",
                    ingredient
                }
            }
            return objIng;
        });
        this.ingrediens = newIngrendients;
    }
    updateServings (type) {
        // servings
        const newServings = type ==="dec" ? this.servings -1 : this.servings +1;

        // ingredints
        this.ingrediens.forEach(ing => {
            ing.count *= (newServings / this.servings);
        })

        this.servings = newServings;
    }
}