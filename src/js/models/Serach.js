import axios from 'axios';
import {key3 , proxy } from "../config"
export default class Search {
    constructor(query){
        this.query = query;
        this.result = "null";
    }
   
async getResults() {
    try{
      
        const res = await axios(`${proxy}https://www.food2fork.com/api/search?key=${key3}&q=${this.query}`);
         this.result = res.data.recipes;
        console.log(this.result);
        }  
    catch (error){
        alert(error);
    }
    }
}

