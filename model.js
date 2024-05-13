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
        this.news_background = [news]
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

    news_maker(avg) {
        let P = Math.random();
        if (avg > 0.6) {
            if (P > 0.1) {
                let news = Math.random() * (1 - 0.4) + 0.4;
            } else {
                let news = Math.random() * (0.6 - 0.1) + 0.1;
            }
        } else {
            if (P > 0.1) {
                let news = Math.random() * (0.6 - 0.1) + 0.1;
            } else {
                let news = Math.random() * (1 - 0.4) + 0.4;
            }
        }
        return news
    }

    change_parametrs(buy_counter, sell_counter, deal_counter, step) {
        if (buy_counter > sell_counter) {
            this.buy_price += Math.exp(buy_counter / 2 * sell_counter);
        } else {
            this.buy_price -= Math.exp(sell_counter / 2 * buy_counter);
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
        if (this.news_background.length() < 5) {
            const avg = this.news_background.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / this.news_background.length();
        } else {
            const slice = this.news_background.slice(-5);
            const avg = slice.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / 5;
        }
        let news = this.news_maker(avg);
        this.news_background.push(news);
    }
}

class Player {
    constructor(k, n, buy) {
        this.parametrs = this.creating_parametrs();
        this.profit = - k * buy / n;
        this.capital = k / n;
        this.graph_profits = [this.profit];
    }

    creating_parametrs() {
       var parametrs = new Array(5);
       parametrs[0] = Math.random(); // Риск
       parametrs[1] = this.profit; // Текущая прибыль
       parametrs[2] = Math.random() * (10 - 0.2) + 0.2; // Опыт в годах
       parametrs[3] = Math.random();
       parametrs[4] = Math.random()
       return parametrs;
    }

    scoring(factors, ret, vol, liq, news) {
        let score = 0.2 * (ret + vol + liq) + 0.3 * news; // нужно нормализовать волатильность и ликвидность
        for (let i = 0; i != 5; i++) {
            score += 0.5 * parseFloat(factors[i]);
        }
        let recomend = "";
        if (score >= 5.04) {
            recomend = "buy";
        } else if (score > 2.96 && score < 5.04) {
            recomend = "hold";
        } else {
            recomend = "sell";
        }
        return recomend;
    }

}

export class Model {
    constructor(days, n, k, buy, sell, r, news) {
        this.steps = days;
        this.company = new Company(k, buy, sell, r, news);
        this.players_number = n;
        this.players = this.create_players()
        this.factors = [["up", 0.1, 0.9], ["up", -2 * k * buy / n, 2 * k * sell / n], ["up", 0.3, 9], ["down", 0.8, 0.3], ["up", 0.15, 0.97]]
    }

    create_players() {
        var players = new Array(this.players_number);
        for (let i = 0; i != this.players_number; i++) {
            players[i] = new Player(this.company.stock_number, this.company.players_number, this.company.buy_price);
        }
        return players;
    }

    desirability_regres_func(factor, direction, terrible, ideal) {
        var desire = new Array(this.players_number);
        let minimum = Math.min(...factor);
        let maximum = Math.max(...factor);
        var indexes = new Array(this.players_number);
        for (let i = 0; i != this.players_number; i++) {
            indexes[i] = factor[i];
        }
        if (direction == "up") {
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
        } else {
            factor.sort((a, b) => b - a);
            minimum = Math.max(...factor);
            if (terrible - minimum < 0) {
                minimum = 0;
            } else {
                minimum = ideal / minimum;
            }
            maximum = Math.min(...factor);
            if (maximum - ideal <= 0) {
                maximum = 1;
            } else {
                maximum = ideal / maximum;
            }
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
            final_recomend[i] = this.players[i].scoring(scoring_matrix.map(row => row[i]));
        }
        return final_recomend;
    }

    deal(final_recomend) {
        var deque = new Array(this.players_number).fill(0);
        let deal_counter = 0
        for (let i = 0; i != this.players_number; i++) {
            if (final_recomend[i] == "sell") {
                let b_idx = deque.indexOf("buy");
                if (b_idx != 1) {
                    this.players[b_idx].capital += this.company.stock_number / this.players_number;
                    this.players[b_idx].profit -= this.company.stock_number * this.company.buy_price / this.players_number;
                    this.players[i].capital -= this.company.stock_number / this.players_number;
                    this.players[i].profit += this.company.stock_number * this.company.sell_price / this.players_number;
                    deal_counter += this.company.stock_number;
                    deque[b_idx] = 0;
                } else {
                    deque[i] = "sell";
                }
            } else {
                let s_idx = deque.indexOf("sell");
                if (s_idx != -1) {
                    this.players[s_idx].capital -= this.company.stock_number / this.players_number;
                    this.players[s_idx].profit += this.company.stock_number * this.company.sell_price / this.players_number;
                    this.players[i].capital += this.company.stock_number / this.players_number;
                    this.players[i].profit -= this.company.stock_number * this.company.buy_price / this.players_number;
                    deal_counter += this.company.stock_number;
                    deque[s_idx] = 0;
                } else {
                    deque[i] = "buy";
                }
            }
            this.players[i].graph_profits.push(this.players[i].profit);
        }
        return deal_counter;
    }

    change_price(final_recomend, step) {
        let sell_counter = 0;
        let buy_counter = 0;
        for (let i = 0; i != this.players_number; i++) {
            if (final_recomend[i] == "buy") {
                buy_counter += 1;
            } else if (final_recomend[i] == "sell") {
                sell_counter += 1;
            }
        }
        let news = this.company.change_parametrs(buy_counter, sell_counter, this.deal(final_recomend), step);
    }

    run() {
        for (let i = 0; i != this.steps; i++) {
            let final_recomend = this.scoring();
            let changing = this.change_price(final_recomend, i);
        }
    }
}