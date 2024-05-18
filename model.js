class Company {
    constructor(k, buy, sell, r, news, ret, vol) {
        this.graph_prices = [buy];
        this.ret = [ret];
        this.stock_number = k;
        this.buy_price = buy;
        this.sell_price = sell;
        this.liquidity = r;
        this.vol = vol;
        this.spread = buy - sell;
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
        this.news.push(news);
        this.news_background = 0
        for (let i = 0; i < this.news.length(); i++) {
            this.news_background += slice[i] * Math.exp(0.9(i - this.news.length() + 1));
        }
    }

    change_parametrs(buy_counter, sell_counter, deal_counter, step) {
        if (buy_counter > sell_counter) {
            this.buy_price += Math.exp(buy_counter / (2 * sell_counter + 0.001));
        } else {
            this.buy_price -= Math.exp(sell_counter / (2 * buy_counter + 0.001));
        }
        this.graph_prices.push[this.buy_price];
        this.ret.push(Math.LN2(this.graph_prices[-1] / this.graph_prices[-2]));
        if (step % 7 == 0) {
            this.volatility();
        }
        let r = deal_counter / this.stock_number;
        if (r > this.liquidity) {
            this.liquidity = r;
            this.spread -= Math.pow(0.5, 50 * r);
        } else {
            this.liquidity = r;
            this.spread += Math.pow(0.5, 50 * r);
        }
        this.sell_price = this.buy_price - this.spread;
        this.news_maker();
    }
}

class Player {
    constructor(k, n, buy) {
        this.parametrs = this.subjective_parametrs();
        this.profit = - k * buy / n;
        this.capital = k / n;
        this.graph_profits = [this.profit];
        this.weights = []
    }

    subjective_parametrs() {
       let weights;
       let parametrs = new Array(5);
       parametrs[0] = Math.random(); // Риск
       parametrs[1] = this.profit; // Текущая прибыль
       parametrs[2] = Math.random() * 9.8 + 0.2; // Опыт в годах
       parametrs[3] = Math.random(); // отношение к сектору
       parametrs[4] = Math.random(); // иное
       return parametrs;
    }

    changing_parametrs() {

    }

    scoring(factors, ret, vol, liq, news) {
        let score = 0.2 * (ret + vol + liq) + 0.3 * news; // нужно нормализовать волатильность и ликвидность
        for (let i = 0; i != 5; i++) {
            score += 0.5 * parseFloat(factors[i]);
        }
        return score;
    }

}

export class Model {
    constructor(days, n, k, buy, sell, r, news, ret, vol) {
        this.steps = days;
        this.company = new Company(k, buy, sell, r, news, ret, vol);
        this.players_number = n;
        this.players = this.create_players()
        this.factors = [[0.1, 0.9], [-2 * k * buy / n, 2 * k * sell / n], [0.3, 9], [0.8, 0.3], [0.15, 0.97]]
    }

    create_players() {
        var players = new Array(this.players_number);
        for (let i = 0; i != this.players_number; i++) {
            players[i] = new Player(this.company.stock_number, this.company.players_number, this.company.buy_price);
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
        const m = (this.players_number * sumXY - sumX * sumY) / (this.players_number * sumXX - sumX * sumX);
        const b = (sumY - m * sumX) / this.players_number;
        for (let i = 0; i != this.players_number; i++) {
            desire[i] = (m * indexes[i] + b).toFixed(2);
        }
        return desire
    }

    scoring() {
        var final_recomend = new Array(this.players_number);
        var scoring_matrix = new Array(5);
        for (let i = 0; i != 5; i++) {
            scoring_matrix[i] = new Array(this.players_number);
            for (let j = 0; j != this.players_number; j++) {
                scoring_matrix[i][j] = this.players[j].parametrs[i];
            }
        }
        for (let i = 0; i != 5; i++) {
            scoring_matrix[i] = this.desirability_regres_func(scoring_matrix[i], this.factors[i][0], this.factors[i][1], this.factors[i][2]);
        }
        for (let i = 0; i != this.players_number; i++) {
            final_recomend[i] = [this.players[i].scoring(scoring_matrix.map(row => row[i]), this.company.ret[-1],
            this.company.liquidity, this.company.vol, this.company.news_background), i];
        }
        return final_recomend;
    }

    deal(final_recomend) {
        var deque_sell = [];
        var deque_buy = [];
        final_recomend.sort();
        for (let i = 0; i != this.players_number; i++) {
            if (final_recomend[i][0] >= 5.04) {
                deque_buy.push(final_recomend[i][1]);
            } else if (final_recomend[i][0] <= 2.96 && this.players[i].capital > 0) {
                deque_sell.push(final_recomend[i][1]);
            }
        }
        let idx_sell = 0;
        let idx_buy = deque_buy.length();
        while (idx_buy != 0 && idx_sell != deque_sell.length()) {
            this.players[deque_buy(idx_buy)].capital += this.players[deque_sell(idx_sell)].capital;
            this.players[deque_buy(idx_buy)].profit -= this.company.buy_price * this.players[deque_sell(idx_sell)].capital;
            this.players[deque_sell(idx_sell)].profit += this.company.sell_price * this.players[deque_sell(idx_sell)].capital;
            this.players[deque_buy(idx_buy)].graph_profits.push(this.players[deque_buy(idx_buy)].profit);
            this.players[deque_sell(idx_sell)].graph_profits.push(this.players[deque_sell(idx_sell)].profit);
            deal_counter += this.players[deque_sell(idx_sell)].capital;
            this.players[deque_sell(idx_sell)].capital = 0;
            idx_buy -= 1;
            idx_sell = 1;
        }
        return [deal_counter, deque_buy.length(), deque_sell.length()];
    }

    change_price(final_recomend, step) {
        var deal = this.deal(final_recomend);
        let news = this.company.change_parametrs(deal[1], deal[2], deal[0], step);
    }

    run() {
        for (let i = 0; i != this.steps; i++) {
            let final_recomend = this.scoring();
            let changing = this.change_price(final_recomend, i);
        }
    }
}