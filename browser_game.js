import {Model} from './model.js';

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
            {
                canvas: 'deal_chart',
                text: 'deal_text',
                label: ['Количество акций в обороте', 'Количество акций', 'Дни'],
                X: [],
                Y: [],
                index: 0,
                interval: null,
                chart: null,
                pause: false
            }
        ]
    },
    // {
    //     start: 'start_3',
    //     pause: 'pause_3',
    //     result: 'result_3',
    //     charts: [
    //         {
    //             canvas: 'profit_chart',
    //             text: 'profit_text',
    //             label: ['Ликвидность', 'Акции в обороте ко всем', 'Дни'],
    //             X: [],
    //             Y: [],
    //             index: 0,
    //             interval: null,
    //             chart: null,
    //             pause: false
    //         }
    //     ]
    // }
];

class Browser_game {
    
    constructor(days, n, k, buy, r, news, vol, ret) {
        this.simulation = new Model(days, n, k, buy, r, news, vol, ret);
        this.days = [...Array(days).keys()].map(x => x + 1);
        this.games = games;
        this.data();
        this.games.forEach(chart => {
            document.getElementById(chart.start).addEventListener('click', () => this.graph_start(chart));
            document.getElementById(chart.pause).addEventListener('click', () => this.pause(chart));
            document.getElementById(chart.result).addEventListener('click', () => this.result(chart));
        });
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
        this.games[1].charts[1].Y = this.simulation.deal_counter;
        // for (let i = 0; i < this.simulation.players_number; i++) {
        //     this.games[2].charts[0].Y.push(this.simulation.players[i].graph_profits);
        // }
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
            if (settings.canvas == "profit_chart") {
                settings.chart = this.hist_chart(canvas, settings.label, settings.X, settings.Y);
            } else {
                settings.chart = this.scatter_chart(canvas, settings.label, settings.X, settings.Y);
            }
            settings.interval = setInterval(() => {
                if (!settings.pause) {
                    if (settings.index < this.days.length - 1) {
                        settings.index++;
                        settings.chart.data.datasets[0].data = settings.X.slice(0, settings.index + 1).map((x, index) => ({ x, y: settings.Y[index] }));
                        settings.chart.update();
                        if (settings.index > 0) {
                            text.innerText += settings.Y[settings.index] - settings.Y[settings.index - 1] + ' ';
                        } else {
                            text.innerText += settings.Y[settings.index];
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

    training_game() {
        this.simulation = new Model(days, n, k, buy, r, news, vol, ret);
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
        game = new Browser_game(days, n, k, buy, r, news, vol, ret);
    });
});
