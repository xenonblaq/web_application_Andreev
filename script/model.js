// Класс Company - обновление показателей ценной бумаги данной компании
class Company {
    constructor(k, buy, r, news, ret, vol,  news_p, news_speed, preset, days) {
        this.training_flag = false; // Булевая переменная для обозначения режима модели
        if (Object.keys(preset).length != 0) { // Обучающий режим
            this.preset = preset
            this.training_flag = true;
        }
        this.capital_cost = buy * 0.1; // Стоимость капитала компании, пускай 10% от изначальной цены акции
        this.graph_prices = [buy]; // Массив для графика цены акции
        this.ret = [ret]; // Массив для графика доходности
        this.stock_number = k; // Число акций
        this.buy_price = buy; // Текущая цена покупки
        this.spread = Math.pow(0.5, 50 * r); // Спрэд - разница между ценой продажи и покупки
        this.sell_price = buy - this.spread; // Текущая цена продажи
        this.liquidity = [r]; // Массив для графика ликвидности
        this.vol = [vol]; // Массив для графика волатильности
        this.news_background = news; // Текущий новостной фон
        this.news = [news]; // Массив для графика новостей
        this.news_p = news_p; // Вероятность скачка
        this.news_speed = this.serias_sum(news_speed, days); // Скорость забывания и максимальное значение новостного фона
    }

    // Функция для определения максимального значения новостного фона. Нужно для нормировки
    serias_sum(news_speed, days) {
        // Работает в соответствии с описанием проекта.
        let sum = 0
        for (let i = 0; i < days; i++) {
            sum += Math.exp(news_speed * (i - days + 1));
        }
        return [news_speed, sum];
    }

    // Функция подсчета волатильности
    volatility() {
        var variations = new Array(7);
        let returns = this.ret.slice(-7); // Выборка из последних семи доходностей
        let mean = returns.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / 7; // Среднее по последним семи доходностям
        for (let i = 0; i != 7; i++) {
            variations[i] = Math.pow(returns[i] - mean, 2); // (X - X_ср)^2 - формула для подсчета выборочной дисперсии
        }
        // Корень из суммы дисперсий, деленной на n - 1. Стандартное отклонение и есть волатильность
        this.vol.push(Math.sqrt(variations.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / 6));
    }

    // Функция обновления новостей и новостного фона
    news_maker(step) {
        let news = 0;
        if (this.training_flag) { // Если обучающий режим, новость определена заранее
            news = this.preset.news[step];
        } else { // Иначе в соответствии с вероятностью скачка рандомное число от 0.1 до 0.6 или от 0.4 до 1
            let P = Math.random();
            if (this.news_background > 0.5) {
                if (P > this.news_p) {
                    news = Math.random() * (1 - 0.4) + 0.4;
                } else {
                    news = Math.random() * (0.6 - 0.1) + 0.1;
                }
            } else {
                if (P > this.news_p) {
                    news = Math.random() * (0.4 - 0.1) + 0.1;
                } else {
                    news = Math.random() * (1 - 0.5) + 0.5;
                }
            }
        }
        // Добавляем новую новость в массив и обновляем новостной фон
        this.news.push(news.toFixed(2));
        this.news_background = 0
        for (let i = 0; i < this.news.length; i++) {
            this.news_background += this.news[i] * Math.exp(this.news_speed[0] * (i - this.news.length + 1)); // Формула из описания проекта
        }
        this.news_background = this.news_background / this.news_speed[1]; // Нормировка новостного фона по своему максимальному значению
    }

    // Функция изменения показателей ценной бумаги 
    change_parametrs(deal_counter, step) {
        let r = deal_counter / this.stock_number; // Ликвидность: отношение акций в обороте ко всем
        this.liquidity.push(r); // Добавляем текущую ликвидность в массив
        this.spread = Math.pow(0.5, 50 * r); // Обновляем спрэд
        this.buy_price = this.graph_prices[this.graph_prices.length - 1]; // Обновление цены покупки
        this.sell_price = this.buy_price - this.spread; // Обновление цены продажи
        // Обновление доходности, как натуральный логарифм отношения текущей цены акции к предыдущей. Добавление в массив
        this.ret.push(Math.log(this.graph_prices[this.graph_prices.length - 1] / this.graph_prices[this.graph_prices.length - 2]));
        if ((step + 1) % 7 == 0) { // Если прошла неделя, обновляем волатильность
            this.volatility();
        } else { // Иначе волатильность все та же
            this.vol.push(this.vol[this.vol.length - 1]);
        }
        // Обновляем новость и фон
        this.news_maker(step);
    }
}

// Класс Player - оценка инвестиционной привлекательности ценной бумаги для конкретного игрока
class Player {
    constructor(k, n, buy, preset, step) {
        this.training_flag = false; // Булевая переменная для обозначения режима модели
        if (Object.keys(preset).length != 0) { // Обучающая модель
            this.preset = preset;
            this.training_flag = true;
        }
        this.weights = new Map(); // Словарь весов доходности, ликвидности и волатильности в оценке
        this.risk = this.creating_subjective_parametrs(step); // Создание субъективных факторов
        this.capital = k / n; // Текущий портфель
    }

    // Создание субъективных факторов
    creating_subjective_parametrs(step) {
        if (this.training_flag) { // Обучающий режим
            let risk = this.preset.players[step]; // Толерантность к риску определена заранее для каждого инвестора
            if (risk > 0.5) { // Инвестор более агрессивный
                // Веса агрессивных инвесторов определены заранее
                this.weights.set("return", this.preset.weights[0][0]);
                this.weights.set("liquidity", this.preset.weights[0][1]);
                this.weights.set("volatility", this.preset.weights[0][2]);
            } else { // Инвестор более консервативный
                // Веса консервативных инвесторов определены заранее
                this.weights.set("return", this.preset.weights[1][0]);
                this.weights.set("liquidity", this.preset.weights[1][1]);
                this.weights.set("volatility", this.preset.weights[1][2]);
            }
            return risk; // Возвращаем толерантность к риску
        }
        let risk = Math.random() * (0.9 - 0.1) + 0.1; // Толерантность к риску - случайное число от 0.1 до 0.9
        if (risk > 0.5) { // Инвестор более агрессивный
            this.weights.set("return", Math.random() * (1 - risk) + risk); // Вес доходности - случайное число от risk до 1
            let a = Math.random() * (1 - this.weights.get("return")); // Случайное число от веса доходности до 1
            let b = 1 - this.weights.get("return") - a; // Оставшееся число, чтобы в сумме все веса давали единицу
            this.weights.set("liquidity", Math.max(a, b)); // Ликвидность - максимальное из них
            this.weights.set("volatility", 1 - this.weights.get("return") - this.weights.get("liquidity")); // Волатильность - оставшееся
        } else { // Инвестор более агрессивный
            // По сути то же самое, только волатильность и доходность меняются местами
            this.weights.set("volatility", Math.random() * (1 - (1 - risk)) + 1 - risk);
            let a = Math.random() * (1 - this.weights.get("volatility"));
            let b = 1 - this.weights.get("volatility") - a;
            this.weights.set("liquidity", Math.max(a, b));
            this.weights.set("return", 1 - this.weights.get("volatility") - this.weights.get("liquidity"));
        }
        console.log(risk, this.weights);
        return risk; // Возвращаем толерантность к риску
    }

    // Функция нормировки параметров
    normalize(ret, vol) {
        // Доходность идеальна, если она превышает 30%
        // Доходность плоха, если она меньше -10%
        ret = ret[ret.length - 1];
        vol = vol[vol.length - 1];
        if (ret > 0.3) {
            ret = 1;
        } else if (ret < -0.1) {
            ret = 0
        } else {
            ret = (ret + 0.1) / 0.4;
        }
        // Волатильность идеальна, если она не превышает 2%
        // Волотильность плоха, если она превышает 20%
        if (vol > 0.2) {
            vol = 0;
        } else if (vol < 0.02) {
            vol = 1
        } else {
            vol = (vol - 0.02) / 0.18;
        }
        return [ret, vol]; // Возвращаем нормированные значения
    }

    // Субъективная оценка инвестиционной привлекательности
    scoring(ret, liq, vol, news, buy, capital_cost) {
        // Нормируем доходность и волатильность
        let normal = this.normalize(ret, vol); 
        ret = normal[0];
        vol = normal[1];
        // Формула из описания проекта
        let score = 0.25 * this.risk + 0.15 * (this.weights.get("return") * ret + this.weights.get("volatility") * vol
        + this.weights.get("liquidity") * (liq[liq.length - 1])) + 0.6 * news; // нужно нормализовать волатильность и доходность
        // Если текщая цена акции превышает тридцать цен капитала компании, то есть опасения насчет переоценнености. 
        // Оценка умножается на понижающий коэффициент
        if (buy > 30 * capital_cost) {
            score = score * 0.65;
        // Если же цена упала ниже стоимости капитала (чего не может быть), привлекательность акции резко повышается
        } else if (buy < capital_cost) {
            score = score * 2;
        }
        return score; // Возвращаем оценку
    }

}

// Класс Model - создание симуляции и ее обновление
export class Model {
    constructor(days, n, k, buy, r, news, vol, ret, news_p, news_speed, preset) {
        this.deal_counter = 0; // Подсчет акций в обороте
        this.steps = days; // Количество шагов модели
        this.company = new Company(k, buy, r, news, ret, vol, news_p, news_speed, preset, days); // Создание компании
        this.players_number = n; // Количество инвесторов
        this.players = this.create_players(preset); // Создание инвесторов
    }

    // Функция создания инвесторов - объектов класса Player
    create_players(preset) {
        var players = new Array(this.players_number);
        for (let i = 0; i != this.players_number; i++) {
            players[i] = new Player(this.company.stock_number, this.players_number, this.company.buy_price, preset, i);
        }
        return players; // Возвращаем список созданных инвесторов
    }

    // Функция оценки инвестиционной привлекательности для каждого инвестора из списка
    scoring() {
        var final_recomend = new Map(); 
        for (let i = 0; i < this.players_number; i++) {
            final_recomend.set(i, this.players[i].scoring(this.company.ret,
            this.company.liquidity, this.company.vol, this.company.news_background, this.company.buy_price, this.company.capital_cost));
        }
        return final_recomend; // Возвращаем список всех оценок
    }

    // Функция симуляции сделок
    deal(final_recomend) {
        final_recomend = new Map([...final_recomend.entries()].sort((a, b) => a[1] - b[1])); // Оценки сортируются по возрастанию
        // Создаются две "очереди" из покупателей и продавцов
        var deque_sell = [];
        var deque_buy = [];
        // Если оценка не меньше 0.5, инвестор считается покупателем и добавляется в очередь на покупку.
        // Еслли же оценка ниже 0.5 и портфель не пустой, инвестор считается продавцом и добавляется в очередь на продажу.
        for (let player of final_recomend.keys()) {
            if (final_recomend.get(player) >= 0.50) {
                deque_buy.push(player); // Добавляем номер покупателя
            } else if (final_recomend.get(player) < 0.50 && this.players[player].capital > 0) {
                deque_sell.push(player); // Добавляем номер продавца
            }
        }
        // Так как мы отсортировали final_recomend во возрастанию, то в соответствии с правилами из описания проекта,
        // очередь продавцов итерируется с начала, а очередь покупателей -  с конца
        let idx_sell = 0;
        let idx_buy = deque_buy.length - 1;
        this.deal_counter = 0; // Подсчет акций в обороте
        while (idx_buy >= 0 && idx_sell != deque_sell.length) {
            // Пока не закончились покупатели и продавцы, продавец с наименьшей оценкой сходится с покупателем с наивысшей
            this.deal_counter += this.players[deque_sell[idx_sell]].capital; // Добавление в подсчет акций в обороте портфеля продавца
            this.players[deque_buy[idx_buy]].capital += this.players[deque_sell[idx_sell]].capital; // Портфель продавца становится портфелем покупателя
            this.players[deque_sell[idx_sell]].capital = 0; // Портфель продавца обнуляется
            // Обновление индексов
            idx_buy -= 1;
            idx_sell += 1;
        }
        // Цена акции обновляется в соответствии с правилами описания проекта
        if (deque_buy.length > deque_sell.length) { // Покупателей оказалось больше
            this.company.graph_prices.push(this.company.buy_price * (1 + final_recomend.get(deque_buy[0]) * deque_buy.length / this.players_number));
        } else if (deque_buy.length < deque_sell.length) { // Продавцов оказалось больше
            this.company.graph_prices.push(this.company.sell_price * (1 - final_recomend.get(deque_sell[deque_sell.length - 1]) * deque_sell.length / this.players_number));
        } else { // Покупателей и продавцов поровну - цена не изменилась
            this.company.graph_prices.push(this.company.graph_prices[this.company.graph_prices.length - 1]);
        }
        // Если новая цена ниже стоимости капитала (чего не может быть), новая цена - стоимость капитала - 1
        if (this.company.capital_cost - 1 > this.company.graph_prices[this.company.graph_prices.length - 1]) {
            this.company.graph_prices[this.company.graph_prices.length - 1] = this.company.capital_cost - 1;
        }
    }   

    // Функция изменения показателей компании и запуска сделок
    change_parametrs(final_recomend, step) {
        this.deal(final_recomend); // Симуляция сделок на основании оценок инвесторов
        this.company.change_parametrs(this.deal_counter, step); // Запуск изменения показателей компании
    }

    // Основная функция запуска модели
    run() {
        for (let i = 0; i != this.steps; i++) { // Каждый день запускаем все процессы
            let final_recomend = this.scoring(); // Запуск оценки ценной бумаги
            this.change_parametrs(final_recomend, i); // Запуск сделок и изменения показателей
        }
    }
}