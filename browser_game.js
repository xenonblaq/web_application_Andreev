import {Model} from './model.js';

class Browser_game {
    constructor(days, n, k, buy, r, news, vol, ret) {
        this.simulation = new Model(days, n, k, buy, r, news, vol, ret);
        this.handleEvent = function (event) {
            this.player_click(event);  
        }
        this.canvas.addEventListener('click',  this); 
    }
}




