import {Model} from './model.js';

const preset = {
    bad: {
        players: [0.1, 0.6, 0.2, 0.4, 0.8, 0.3, 0.15, 0.9, 0.25, 0.7],
        weights: [[0.7, 0.2, 0.1], [0.1, 0.2, 0.7]],
        news: [0.1, 0.3, 0.25, 0.15, 0.3, 0.2, 0.3, 0.8, 0.7, 0.9, 0.65, 0.3, 0.2, 0.1,
             0.05, 0.3, 0.8, 0.9, 0.95, 0.9, 0.2, 0.1, 0.2, 0.1, 0.01],
        days: 25,
        n: 10,
        k: 100,
        buy: 300,
        r: 0.1,
        vol: 0.35,
        ret: -0.1
    },
    good: {
        players: [0.1, 0.6, 0.2, 0.4, 0.8, 0.3, 0.15, 0.9, 0.25, 0.7],
        weights: [[0.7, 0.2, 0.1], [0.1, 0.2, 0.7]],
        news: [0.95, 0.65, 0.7, 0.8, 0.7, 0.8, 0.67, 0.78, 0.94, 0.73, 0.2, 0.1, 0.3, 0.25,
            0.2, 0.3, 0.25, 0.14, 0.17, 0.34, 0.6, 0.76, 0.82, 0.9, 0.98],
        days: 25,
        n: 10,
        k: 100,
        buy: 300,
        r: 0.9,
        vol: 0.02,
        ret: 0.3
    }
}

const preset_game = [
    {
        chart: null,
        X: [],
        Y: [],
        label: ['Цена акции', 'Рубли', 'Дни'],
        index: 1
    },
    {
        chart: null,
        X: [],
        Y: [],
        label: ['Новостной фон', 'Влияние', 'Дни'],
        index: 1
    },
    {
        chart: null,
        X: [],
        Y: [],
        label: ['Доходность', 'Доходность акции', 'Дни'],
        index: 1
    },
    {
        chart: null,
        X: [],
        Y: [],
        label: ['Волатильность', 'Недельное отклонение', 'Дни'],
        index: 1
    },
]

const games = [
    {
        start: 'start_1',
        pause: 'pause_1',
        result: 'result_1',
        charts: [
            {
                canvas: 'price_chart',
                text: 'price_text',
                label: ['Цена акции', 'Рубли', 'Дни'],
                X: [],
                Y: [],
                index: 0,
                interval: null,
                chart: null,
                pause: false
            },
            {
                canvas: 'news_chart',
                text: 'news_text',
                label: ['Новостной фон', 'Влияние', 'Дни'],
                X: [],
                Y: [],
                index: 0,
                interval: null,
                chart: null,
                pause: false
            }
        ]
    },
    {
        start: 'start_2',
        pause: 'pause_2',
        result: 'result_2',
        charts: [
            {
                canvas: 'liq_chart',
                text: 'liq_text',
                label: ['Ликвидность', 'Акции в обороте ко всем', 'Дни'],
                X: [],
                Y: [],
                index: 0,
                interval: null,
                chart: null,
                pause: false
            },
            // {
            //     canvas: 'deal_chart',
            //     text: 'deal_text',
            //     label: ['Количество акций в обороте', 'Количество акций', 'Дни'],
            //     X: [],
            //     Y: [],
            //     index: 0,
            //     interval: null,
            //     chart: null,
            //     pause: false
            // }
        ]
    },
    {
        start: 'start_3',
        pause: 'pause_3',
        result: 'result_3',
        charts: [
            {
                canvas: 'return_chart',
                text: 'return_text',
                label: ['Доходность', 'Доходность акции', 'Дни'],
                X: [],
                Y: [],
                index: 0,
                interval: null,
                chart: null,
                pause: false
            },
            {
                canvas: 'vol_chart',
                text: 'vol_text',
                label: ['Волатильность', 'Недельное отклонение', 'Дни'],
                X: [],
                Y: [],
                index: 0,
                interval: null,
                chart: null,
                pause: false
            }
        ]
    }
];

class Browser_game {
    
    constructor(days, n, k, buy, r, news, vol, ret, news_p, news_speed, preset) {
        this.simulation = new Model(days, n, k, buy, r, news, vol, ret, news_p, news_speed, preset);
        this.days = [...Array(days).keys()].map(x => x + 1);
        this.games = games;
        this.preset_game = preset_game;
        this.data();
        if (Object.keys(preset).length != 0) {
            this.preset_game_data();
            document.getElementById('next').addEventListener('click', () => {
                this.preset_game_build();});
        } 
        this.games.forEach(chart => {
            document.getElementById(chart.start).addEventListener('click', () => this.graph_start(chart));
            document.getElementById(chart.pause).addEventListener('click', () => this.pause(chart));
            document.getElementById(chart.result).addEventListener('click', () => this.result(chart));
        });
    }

    reset_preset() {
        this.preset_game.forEach(game =>{
            if (game.chart) {
                game.chart.destroy();
                game.chart = null;
            }
            game.X = [];
            game.Y = [];
            game.index = 1;
        });
    }

    preset_game_data() {
        this.reset_preset();
        this.preset_game.forEach(game =>{
            game.X = this.days;
        });
        this.preset_game[0].Y = this.simulation.company.graph_prices;
        this.preset_game[1].Y = this.simulation.company.news;
        this.preset_game[2].Y = this.simulation.company.ret;
        this.preset_game[3].Y = this.simulation.company.vol;

        const price_canvas = document.getElementById('price_chart_ins');
        const news_canvas = document.getElementById('news_chart_ins');
        const return_canvas = document.getElementById('return_chart_ins');
        const vol_canvas = document.getElementById('vol_chart_ins');

        this.preset_game[0].chart = this.scatter_chart(price_canvas, this.preset_game[0].label, this.days, this.preset_game[0].Y);
        this.preset_game[1].chart = this.scatter_chart(news_canvas, this.preset_game[1].label, this.days, this.preset_game[1].Y);
        this.preset_game[2].chart = this.scatter_chart(return_canvas, this.preset_game[2].label, this.days, this.preset_game[2].Y);
        this.preset_game[3].chart = this.scatter_chart(vol_canvas, this.preset_game[3].label, this.days, this.preset_game[3].Y);

        let text = document.getElementById('inst_text');
        text.innerHTML = 'Модель готова к работе. Нажмите кнопку "далее".' + '<br>';
        text.innerHTML += "Текщая цена акции: " + String(this.preset_game[0].Y[this.preset_game[0].index - 1].toFixed(2)) + '<br>';
        text.innerHTML += "Новость сегодняшнего дня : " + String(this.preset_game[1].Y[this.preset_game[1].index - 1]) + '<br>';
        text.innerHTML += "Текщая доходность: " + String(this.preset_game[2].Y[this.preset_game[2].index - 1].toFixed(2)) + '<br>';
        text.innerHTML += "Текщая волотильность :" + String(this.preset_game[3].Y[this.preset_game[3].index - 1].toFixed(2)) + '<br>';
    }

    preset_game_build() {
        let text = document.getElementById('inst_text');
        text.innerHTML = '';
        if (this.preset_game[0].index < this.days.length) {
            this.preset_game.forEach(game => {
                game.chart.data.datasets[0].data.push({ x: this.days[game.index], y: game.Y[game.index] });
                game.chart.update();
                console.log(game.index);
                game.index += 1;
            });
            text.innerHTML += "Текщая цена акции: " + String(this.preset_game[0].Y[this.preset_game[0].index - 1].toFixed(2)) + '<br>';
            text.innerHTML += "Новость сегодняшнего дня : " + String(this.preset_game[1].Y[this.preset_game[1].index - 1]) + '<br>';
            text.innerHTML += "Текщая доходность: " + String(this.preset_game[2].Y[this.preset_game[2].index - 1].toFixed(2)) + '<br>';
            text.innerHTML += "Текщая волотильность :" + String(this.preset_game[3].Y[this.preset_game[3].index - 1].toFixed(2)) + '<br>';

        } else {
            text.innerHTML = 'Обучаяющая симуляция завершена. Перезагрузите страницу для начала новой или снова используйте кнопки "начать" для ускорения темпа.';
        }
    }

    data() {
        this.games.forEach(game => {
            game.charts.forEach(chart => {
                chart.X = this.days;
            });
        });
        this.simulation.run();
        this.games[0].charts[0].Y = this.simulation.company.graph_prices;
        this.games[0].charts[1].Y = this.simulation.company.news;
        this.games[1].charts[0].Y = this.simulation.company.liquidity;
        // this.games[1].charts[1].Y = this.simulation.deal_counter;
        this.games[2].charts[0].Y = this.simulation.company.ret;
        this.games[2].charts[1].Y = this.simulation.company.vol;
    }

    scatter_chart(canvas, label, X, Y) {
        return new Chart(canvas, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: label[0],
                    data: [{ x: X[0], y: Y[0] }],
                    borderColor: '#003C76',
                    backgroundColor: '#003C76',
                    showLine: true,
                    fill: false,
                }]
            },
            options: {
                responsive: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: label[2]
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: label[1]
                        }
                    }
                }
            }
        });
    }

    graph_start(game) {
        this.reset(game);
        game.charts.forEach (settings => {
            const canvas = document.getElementById(settings.canvas);
            canvas.style.backgroundColor = '#B1C2FF';
            console.log(canvas);
            const text = document.getElementById(settings.text);
            text.innerText = settings.label[0] + ':\n'; 
            settings.chart = this.scatter_chart(canvas, settings.label, settings.X, settings.Y);
            settings.interval = setInterval(() => {
                if (!settings.pause) {
                    if (settings.index < this.days.length - 1) {
                        settings.index++;
                        settings.chart.data.datasets[0].data = settings.X.slice(0, settings.index + 1).map((x, index) => ({ x, y: settings.Y[index] }));
                        settings.chart.update();
                        if (settings.index > 0) {
                            if (settings.Y[settings.index] - settings.Y[settings.index - 1] < -0.4 && settings.Y[settings.index] != settings.Y[settings.index - 1] && settings.canvas != 'price_chart' ) {
                                let value = String((settings.Y[settings.index] - settings.Y[settings.index - 1]).toFixed(2)) + ' ';
                                let string = `<span style="color: red;">${value}</span> `;
                                text.innerHTML += string;
                            } else if (settings.Y[settings.index] - settings.Y[settings.index - 1] > 0.4 && settings.Y[settings.index] != settings.Y[settings.index - 1] && settings.canvas != 'price_chart') {
                                let value = String((settings.Y[settings.index] - settings.Y[settings.index - 1]).toFixed(2)) + ' ';
                                let string = `<span style="color: green;">${value}</span> `;
                                text.innerHTML += string;
                            } else if (settings.Y[settings.index] != settings.Y[settings.index - 1]) {
                                let value = String((settings.Y[settings.index] - settings.Y[settings.index - 1]).toFixed(2)) + ' ';
                                text.innerHTML += value;
                            }
                        } else {
                            text.innerHTML += settings.Y[settings.index].toFixed(2);
                        }
                    } else {
                        clearInterval(settings.interval);
                        settings.interval = null;
                    }
                }
            }, 500);
        });
    }

    pause(game) {
        game.charts.forEach(chart => {
            chart.pause = !chart.pause;
        });
    }

    result(game) {
        this.reset(game);
        game.charts.forEach(chart => {
            const canvas = document.getElementById(chart.canvas);
            const text = document.getElementById(chart.text);
            chart.chart = this.scatter_chart(canvas, chart.label, chart.X, chart.Y);
            chart.chart.data.datasets[0].data = chart.X.map((x, index) => ({ x, y: chart.Y[index] }));
            chart.chart.update();
            text.innerText += "Ура!";
        });
    }

    reset(game) {
        game.charts.forEach(chart => {
            if (chart.interval) {
                clearInterval(chart.interval);
                chart.interval = null;
            }
            chart.index = 0;
            if (chart.chart) {
                chart.chart.destroy();
                chart.chart = null;
            }
            chart.pause = false;
        });
    }
}

var game;


document.addEventListener('DOMContentLoaded', () => {
    const toggles = document.querySelectorAll('.toggle');
    const contents = document.querySelectorAll('.content');

    contents.forEach(content => {
        content.style.display = 'none';
    });

    let text = [];
    toggles.forEach((button) => {
        text.push(button.textContent.substring(1));
    });

    toggles.forEach((button, index) => {
        button.addEventListener('click', () => {
            const content = contents[index];
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
            button.textContent = content.style.display === 'none' ? '▼' + text[index] : '▲' + text[index];
        });
    });

    document.getElementById('start_button').addEventListener('click', () => {
        let days = parseInt(document.getElementById('days').value);
        let n = parseInt(document.getElementById('players').value);
        let k = parseInt(document.getElementById('stock').value);
        let buy = parseFloat(document.getElementById('price').value);
        let r = parseFloat(document.getElementById('liquidity').value);
        let news = parseFloat(document.getElementById('news').value);
        let vol = parseFloat(document.getElementById('volatility').value);
        let ret = parseFloat(document.getElementById('return').value);
        let news_p = parseFloat(document.getElementById('news_p').value);
        let news_speed = parseFloat(document.getElementById('news_speed').value);
        if (days > 100) {
            alert("Недопустимые параметры: максимальная длина симуляции - 100 дней");
            return;
        } if (n > 50) {
            alert("Недопустимые параметры: максимальное количество игркоов - 50 дней");
            return;
        } if (k <= 0) {
            alert("Недопустимые параметры: количество акций - положительное число");
            return;
        } if (r > 1 || r < 0) {
            alert("Недопустимые параметры: ликвидность - число от нуля до единицы");
            return;
        } if (news > 1 || news < 0) {
            alert("Недопустимые параметры: новостной фон - число от нуля до единицы");
            return;
        } if (ret > 1 || ret < 0) {
            alert("Недопустимые параметры: доходность - число от нуля до единицы");
            return;
        } if (news_p > 1 || news_p < 0) {
            alert("Недопустимые параметры: вероятность скачка - число от нуля до единицы");
            return;
        } if (news_speed > 1 || news_speed < 0) {
            alert("Недопустимые параметры: скорость забывания - число от нуля до единицы");
            return;
        } if (vol > 1 || vol < 0) {
            alert("Недопустимые параметры: волотильность - число от нуля до единицы");
            return;
        }
        let text = document.getElementById('starting_text');
        game = new Browser_game(days, n, k, buy, r, news, vol, ret, news_p, news_speed, {});
        text.innerHTML = "Модель успешно запущена!";

    });

    document.getElementById('start_training_bad').addEventListener('click', () => {
        if (game) {
            game.reset_preset()
        }
        game = new Browser_game(preset.bad.days, preset.bad.n, preset.bad.k, preset.bad.buy, 
            preset.bad.r, preset.bad.news[0], preset.bad.vol, preset.bad.ret, 0.1, 0.9, preset.bad);
    });

    document.getElementById('start_training_good').addEventListener('click', () => {
        if (game) {
            game.reset_preset();
        }
        game = new Browser_game(preset.good.days, preset.good.n, preset.good.k, preset.good.buy, 
            preset.good.r, preset.good.news[0], preset.good.vol, preset.good.ret, 0.1, 0.9, preset.good);
    });
});