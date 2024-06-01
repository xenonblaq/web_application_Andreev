class Company {
    constructor(k, buy, sell, r, news, ret, vol) {
        this.graph_prices = [buy];
        this.ret = [ret];
        this.stock_number = k;
        this.buy_price = buy;
        this.sell_price = sell;
        this.liquidity = [r];
        this.vol = vol;
        this.spread = buy - sell; // поменять, чтобы не надо было вводить sell
        this.news_background = news
        this.news = [news]
    }


    volatility() {
        var variations = new Array(7);
        let returns = this.ret.slice(-7);
        let mean = returns.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / 7;
        for (let i = 0; i != 7; i++) {
            variations[i] = Math.pow(returns[i] - mean, 2);
        }
        this.vol = Math.sqrt(variations.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / 6);
    }

    news_maker() {
        let news = Math.random();
        this.news.push(news.toFixed(2));
        this.news_background = 0
        for (let i = 0; i < this.news.length; i++) {
            this.news_background += this.news[i] * Math.exp(0.9 * (i - this.news.length + 1));
        }
    }

    change_parametrs(buy_counter, sell_counter, deal_counter, step) {
        if (buy_counter > sell_counter) {
            this.buy_price = Math.min(this.buy_price + Math.exp(buy_counter / (2 * sell_counter + 0.001)), 
            this.buy_price * 2);
        } else {
            this.buy_price = Math.max(this.buy_price - Math.exp(sell_counter / (2 * buy_counter + 0.001)), 
            this.buy_price / 2);
        }
        this.graph_prices.push(this.buy_price);
        let r = deal_counter / this.stock_number;
        this.liquidity.push(r);
        if (r > this.liquidity[this.liquidity.length - 2]) {
            this.spread -= Math.pow(0.5, 50 * r);
        } else {
            this.spread += Math.pow(0.5, 50 * r);
        }
        this.sell_price = this.buy_price - this.spread;
        this.ret.push(Math.log(this.graph_prices[this.graph_prices.length - 1] / this.graph_prices[this.graph_prices.length - 2]));
        if ((step + 1) % 7 == 0) {
            this.volatility();
        }
        this.news_maker();
    }
}

class Player {
    constructor(k, n, buy) {
        this.weights = new Map();
        this.profit = - k * buy / n;
        this.parametrs = this.creating_subjective_parametrs();
        this.capital = k / n;
        this.graph_profits = [this.profit];
    }

    creating_subjective_parametrs() {
        let parametrs = new Array(3);
        let risk = Math.random() * 0.8 + 0.1; // Риск профиль инвестора
        if (risk > 0.5) {
            this.weights.set("return", Math.random() * (1 - risk) + risk);
            let a = Math.random() * (1 - this.weights.get("return"));
            let b = 1 - this.weights.get("return") - a;
            this.weights.set("liquidity",Math.max(a, b));
            this.weights.set("volatility", 1 - this.weights.get("return") - this.weights.get("liquidity")); 
        } else { 
            this.weights.set("volatility", Math.random() * (1 - (1 - risk)) + 1 - risk);
            let a = Math.random() * (1 - this.weights.get("volatility"));
            let b = 1 - this.weights.get("volatility") - a;
            this.weights.set("liquidity", Math.max(a, b));
            this.weights.set("return", 1 - this.weights.get("volatility") - this.weights.get("liquidity"));
        }
        parametrs[0] = risk;
        parametrs[1] = this.profit; // Текущая прибыль
        parametrs[2] = Math.random() * 0.8 + 0.1; // иное
        return parametrs;
    }

    changing_parametrs() {
        this.parametrs[2] = Math.random() * 0.8 + 0.1;
    }

    scoring(factors, ret, liq, vol, news) {
        let score = 0.4 * (0.75 * factors[0] + 0.15 * factors[1] + 0.1 * factors[2])
        + 0.3 * (this.weights.get("return") * ret[ret.length - 1] + this.weights.get("volatility") * vol
        + this.weights.get("liquidity") * liq[liq.length - 1]) + 0.3 * news; // нужно нормализовать волатильность и доходность
        return score;
    }

}

export class Model {
    constructor(days, n, k, buy, sell, r, news, ret, vol) {
        this.deal_counter = [];
        this.steps = days;
        this.company = new Company(k, buy, sell, r, news, ret, vol);
        this.players_number = n;
        this.players = this.create_players()
        this.factors = [[0.1, 0.9], [-2 * k * buy / n, 2 * k * sell / n], [0.1, 0.9]]
    }

    create_players() {
        var players = new Array(this.players_number);
        for (let i = 0; i != this.players_number; i++) {
            players[i] = new Player(this.company.stock_number, this.players_number, this.company.buy_price);
        }
        return players;
    }

    desirability_regres_func(factor, terrible, ideal) {
        var desire = new Array(this.players_number);
        let minimum = Math.min(...factor);
        let maximum = Math.max(...factor);
        var indexes = new Array(this.players_number);
        for (let i = 0; i != this.players_number; i++) {
            indexes[i] = factor[i];
        }
        factor.sort((a, b) => a - b);
        if (maximum - ideal >= 0) {
            maximum = 1;
        } else {
            maximum = maximum / ideal;
        }
        if (minimum - terrible < 0) {
            minimum = 0;
        } else {
            minimum = minimum / ideal;
        }
        var normalized = factor.map((_, index) => (minimum + index * (maximum - minimum) / (this.players_number - 1)));
        const sumX = factor.reduce((acc, val) => acc + val, 0);
        const sumY = normalized.reduce((acc, val) => acc + val, 0);
        const sumXY = factor.reduce((acc, val, i) => acc + val * normalized[i], 0);
        const sumXX = factor.reduce((acc, val) => acc + val * val, 0);
        // Вычисляем наклон (m) и точку пересечения с осью Y (b)
        const m = (this.players_number * sumXY - sumX * sumY) / (this.players_number * sumXX - sumX * sumX + 0.000001);
        const b = (sumY - m * sumX) / this.players_number;
        for (let i = 0; i != this.players_number; i++) {
            desire[i] = (m * indexes[i] + b).toFixed(2);
        }
        return desire
    }

    scoring() {
        var final_recomend = new Map();
        var scoring_matrix = new Array(3);
        for (let i = 0; i != 3; i++) {
            scoring_matrix[i] = new Array(this.players_number);
            for (let j = 0; j != this.players_number; j++) {
                scoring_matrix[i][j] = this.players[j].parametrs[i];
            }
        }
        for (let i = 0; i != 3; i++) {
            scoring_matrix[i] = this.desirability_regres_func(scoring_matrix[i], this.factors[i][0], this.factors[i][1]);
        }
        for (let i = 0; i != this.players_number; i++) {
            final_recomend.set(i, this.players[i].scoring(scoring_matrix.map(row => row[i]), this.company.ret,
            this.company.liquidity, this.company.vol, this.company.news_background));
            this.players[i].changing_parametrs();
        }
        return final_recomend;
    }

    deal(final_recomend) {
        var deque_sell = [];
        var deque_buy = [];
        final_recomend = new Map([...final_recomend.entries()].sort((a, b) => a[1] - b[1]));
        for (let player of final_recomend.keys()) {
            if (final_recomend.get(player) >= 0.6) {
                deque_buy.push(player);
            } else if (final_recomend.get(player) <= 0.4 && this.players[player].capital > 0) {
                deque_sell.push(player);
            }
        }
        let idx_sell = 0;
        let idx_buy = deque_buy.length - 1;
        let deal_counter = 0;
        while (idx_buy >= 0 && idx_sell != deque_sell.length) {
            this.players[deque_buy[idx_buy]].capital += this.players[deque_sell[idx_sell]].capital;
            this.players[deque_buy[idx_buy]].profit -= this.company.buy_price * this.players[deque_sell[idx_sell]].capital;
            this.players[deque_sell[idx_sell]].profit += this.company.sell_price * this.players[deque_sell[idx_sell]].capital;
            this.players[deque_buy[idx_buy]].graph_profits.push(this.players[deque_buy[idx_buy]].profit);
            this.players[deque_sell[idx_sell]].graph_profits.push(this.players[deque_sell[idx_sell]].profit);
            deal_counter += this.players[deque_sell[idx_sell]].capital;
            this.players[deque_sell[idx_sell]].capital = 0;
            idx_buy -= 1;
            idx_sell += 1;
        }
        this.deal_counter.push(deal_counter);
        return [deque_buy.length, deque_sell.length];
    }

    change_price(final_recomend, step) {
        var deal = this.deal(final_recomend);
        let news = this.company.change_parametrs(deal[0], deal[1], this.deal_counter[this.deal_counter.length - 1], step);
    }

    run() {
        for (let i = 0; i != this.steps; i++) {
            let final_recomend = this.scoring();
            let changing = this.change_price(final_recomend, i);
        }
    }
}