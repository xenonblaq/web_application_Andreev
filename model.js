class Company {
    constructor(k, buy, r, news, ret, vol, preset) {
        this.preset = preset
        this.training_flag = false;
        if (Object.keys(this.preset).length != 0) {
            this.training_flag = true;
        }
        this.capital_cost = buy * 0.1;
        this.graph_prices = [buy];
        this.ret = [ret];
        this.stock_number = k;
        this.buy_price = buy;
        this.spread = Math.pow(0.5, 50 * r);
        this.sell_price = buy - this.spread;
        this.liquidity = [r];
        this.vol = [vol];
        this.news_background = news;
        this.news = [news];
    }


    volatility() {
        var variations = new Array(7);
        let returns = this.ret.slice(-7);
        let mean = returns.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / 7;
        for (let i = 0; i != 7; i++) {
            variations[i] = Math.pow(returns[i] - mean, 2);
        }
        this.vol.push(Math.sqrt(variations.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / 6));
    }

    news_maker(step) {
        let news = 0;
        if (this.training_flag) {
            news = this.preset.news[step];
        } else {
            let P = Math.random();
            if (this.news_background > 0.6) {
                if (P > 0.1) {
                    news = Math.random() * (1 - 0.4) + 0.4;
                } else {
                    news = Math.random() * (0.6 - 0.1) + 0.1;
                }
            } else {
                if (P > 0.1) {
                    news = Math.random() * (0.4 - 0.1) + 0.1;
                } else {
                    news = Math.random() * (1 - 0.5) + 0.5;
                }
            }
        }
        this.news.push(news.toFixed(2));
        this.news_background = 0
        for (let i = 0; i < this.news.length; i++) {
            this.news_background += this.news[i] * Math.exp(0.9 * (i - this.news.length + 1));
        }
        this.news_background = this.news_background / 1.53;
    }

    change_parametrs(deal_counter, step) {
        let r = deal_counter / this.stock_number;
        this.liquidity.push(r);
        if (r > this.liquidity[this.liquidity.length - 2]) {
            this.spread -= Math.pow(0.5, 50 * r);
        } else {
            this.spread += Math.pow(0.5, 50 * r);
        }
        this.buy_price = this.graph_prices[this.graph_prices.length - 1];
        this.sell_price = this.buy_price - this.spread;
        this.ret.push(Math.log(this.graph_prices[this.graph_prices.length - 1] / this.graph_prices[this.graph_prices.length - 2]));
        if ((step + 1) % 7 == 0) {
            this.volatility();
        } else {
            this.vol.push(this.vol[this.vol.length - 1]);
        }
        this.news_maker(step);
    }
}

class Player {
    constructor(k, n, buy, preset, step) {
        this.preset = preset;
        this.training_flag = false;
        if (Object.keys(this.preset).length != 0) {
            this.training_flag = true;
        }
        this.weights = new Map();
        this.profit = - k * buy / n;
        this.risk = this.creating_subjective_parametrs(step);
        this.capital = k / n;
        this.graph_profits = [this.profit];
    }

    creating_subjective_parametrs(step) {
        if (this.training_flag) {
            let risk = this.preset.players[step];
            if (risk > 0.5) {
                this.weights.set("return", this.preset.weights[0][0]);
                this.weights.set("liquidity", this.preset.weights[0][1]);
                this.weights.set("volatility", this.preset.weights[0][2]);
            } else {
                this.weights.set("return", this.preset.weights[1][0]);
                this.weights.set("liquidity", this.preset.weights[1][1]);
                this.weights.set("volatility", this.preset.weights[1][2]);
            }
            return risk;
        }
        let risk = Math.random() * 0.8 + 0.1; // Риск профиль инвестора
        if (risk > 0.5) {
            this.weights.set("return", Math.random() * (1 - risk) + risk);
            let a = Math.random() * (1 - this.weights.get("return"));
            let b = 1 - this.weights.get("return") - a;
            this.weights.set("liquidity", Math.max(a, b));
            this.weights.set("volatility", 1 - this.weights.get("return") - this.weights.get("liquidity")); 
        } else { 
            this.weights.set("volatility", Math.random() * (1 - (1 - risk)) + 1 - risk);
            let a = Math.random() * (1 - this.weights.get("volatility"));
            let b = 1 - this.weights.get("volatility") - a;
            this.weights.set("liquidity", Math.max(a, b));
            this.weights.set("return", 1 - this.weights.get("volatility") - this.weights.get("liquidity"));
        }
        console.log(this.weights);
        return risk;
    }

    normalize(ret, vol) {
        ret = ret[ret.length - 1];
        vol = vol[vol.length - 1];
        if (ret > 0.3) {
            ret = 1;
        } else if (ret < -0.1) {
            ret = 0
        } else {
            ret = (ret + 0.1) / 0.4;
        }
        if (vol > 0.2) {
            vol = 0;
        } else if (vol < 0.02) {
            vol = 1
        } else {
            vol = (vol - 0.02) / 0.18;
        }
        return [ret, vol];
    }

    scoring(ret, liq, vol, news, buy, capital_cost) {
        let normal = this.normalize(ret, vol);
        ret = normal[0];
        vol = normal[1];
        let score = 0.25 * this.risk + 0.15 * (this.weights.get("return") * ret + this.weights.get("volatility") * vol
        + this.weights.get("liquidity") * (liq[liq.length - 1])) + 0.6 * news; // нужно нормализовать волатильность и доходность
        if (buy > 3 * capital_cost / 0.1) {
            score = score * 0.65;
        } else if (buy < capital_cost) {
            score = score * 2;
        }
        return score;
    }

}

export class Model {
    constructor(days, n, k, buy, r, news, vol, ret, preset) {
        this.preset = preset
        console.log(this.preset)
        this.deal_counter = [];
        this.steps = days;
        this.company = new Company(k, buy, r, news, ret, vol, preset);
        this.players_number = n;
        this.players = this.create_players();
        this.factors = [[0.1, 0.9], [-2 * k * buy / n, 2 * k * this.company.sell_price / n], [0.1, 0.9]]
    }

    create_players() {
        var players = new Array(this.players_number);
        for (let i = 0; i != this.players_number; i++) {
            players[i] = new Player(this.company.stock_number, this.players_number, this.company.buy_price, this.preset, i);
        }
        return players;
    }

    scoring() {
        var final_recomend = new Map();
        for (let i = 0; i < this.players_number; i++) {
            final_recomend.set(i, this.players[i].scoring(this.company.ret,
            this.company.liquidity, this.company.vol, this.company.news_background, this.company.buy_price, this.company.capital_cost));
        }
        return final_recomend;
    }

    deal(final_recomend) {
        var deque_sell = [];
        var deque_buy = [];
        final_recomend = new Map([...final_recomend.entries()].sort((a, b) => a[1] - b[1]));
        for (let player of final_recomend.keys()) {
            if (final_recomend.get(player) >= 0.50) {
                deque_buy.push(player);
            } else if (final_recomend.get(player) < 0.50 && this.players[player].capital > 0) {
                deque_sell.push(player);
            }
        }
        let idx_sell = 0;
        let idx_buy = deque_buy.length - 1;
        let deal_counter = 0;
        while (idx_buy >= 0 && idx_sell != deque_sell.length) {
            // if (deque_buy.length > deque_sell.length) {
            //     let price = this.company.buy_price * (2 - final_recomend.get(deque_buy[idx_buy]));
            // } else {
            //     let price = this.company.sell_price * (1 - final_recomend.get(deque_sell[idx_sell]));
            // }
            deal_counter += this.players[deque_sell[idx_sell]].capital;
            this.players[deque_buy[idx_buy]].capital += this.players[deque_sell[idx_sell]].capital;
            this.players[deque_sell[idx_sell]].capital = 0;
            idx_buy -= 1;
            idx_sell += 1;
        }
        if (deque_buy.length > deque_sell.length) {
            this.company.graph_prices.push(this.company.buy_price * (1 + final_recomend.get(deque_buy[0]) * deque_buy.length / this.players_number));
        } else if (deque_buy.length < deque_sell.length) {
            this.company.graph_prices.push(this.company.sell_price * (1 - final_recomend.get(deque_sell[deque_sell.length - 1]) * deque_sell.length / this.players_number));
        } else {
            this.company.graph_prices.push(this.company.graph_prices[this.company.graph_prices.length - 1]);
        }
        if (this.company.capital_cost - 1 > this.company.graph_prices[this.company.graph_prices.length - 1] * (1 - final_recomend.get(deque_sell[deque_sell.length - 1]) * 
        deque_sell.length / this.players_number)) {
            this.company.graph_prices[this.company.graph_prices.length - 1] = this.company.capital_cost - 1;
        }
        this.deal_counter.push(deal_counter);
        console.log(deque_buy)
        console.log(deque_sell)
    }   

    change_price(final_recomend, step) {
        this.deal(final_recomend);
        let news = this.company.change_parametrs(this.deal_counter[this.deal_counter.length - 1], step);
    }

    run() {
        for (let i = 0; i != this.steps; i++) {
            console.log(i);
            console.log(this.company.liquidity[this.company.liquidity.length - 1], this.company.ret[this.company.ret.length - 1], this.company.vol, this.company.news_background);
            let final_recomend = this.scoring();
            console.log(final_recomend);
            let changing = this.change_price(final_recomend, i);
        }
    }
}