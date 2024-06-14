// Импорт класса Model для инициализации модели
import {Model} from './model.js';

// Постоянная глобальная структура preset для запуска обучающей модели.
// Обучающая модель содержит в себе по сути три режима: базовый, начиная со спада,
// базовый, начиная с роста, и режим скорости забывания (низкая и высокая). 
//  Preset хранит в себе параметры для запуска Model и соответствующие режиму
// кнопки, поля для текста и канвасы для графиков.

const preset = {
    bad: {
        players: [0.1, 0.6, 0.2, 0.4, 0.8, 0.3, 0.15, 0.9, 0.25, 0.7],
        weights: [[0.7, 0.2, 0.1], [0.1, 0.2, 0.7]],
        news: [0.1, 0.3, 0.25, 0.15, 0.3, 0.2, 0.3, 0.8, 0.7, 0.9, 0.65, 0.73, 0.97, 0.1,
             0.05, 0.3, 0.01, 0.9, 0.95, 0.9, 0.2, 0.1, 0.2, 0.1, 0.01],
        days: 25,
        n: 10,
        k: 100,
        buy: 300,
        r: 0.1,
        vol: 0.35,
        ret: -0.1,
        canvas: ['price_chart_ins', 'news_chart_ins', 'return_chart_ins', 'vol_chart_ins'],
        button: 'next',
        text: 'inst_text'
    },
    good: {
        players: [0.1, 0.6, 0.2, 0.4, 0.8, 0.3, 0.15, 0.9, 0.25, 0.7],
        weights: [[0.7, 0.2, 0.1], [0.1, 0.2, 0.7]],
        news: [0.95, 0.65, 0.7, 0.8, 0.7, 0.8, 0.67, 0.78, 0.94, 0.73, 0.2, 0.1, 0.3, 0.25,
            0.01, 0.05, 0.1, 0.83, 0.7, 0.34, 0.6, 0.76, 0.82, 0.9, 0.98],
        days: 25,
        n: 10,
        k: 100,
        buy: 300,
        r: 0.9,
        vol: 0.02,
        ret: 0.3,
        canvas: ['price_chart_ins', 'news_chart_ins', 'return_chart_ins', 'vol_chart_ins'],
        button: 'next',
        text: 'inst_text'
    },
    speed: {
        players: [0.1, 0.6, 0.2, 0.4, 0.8, 0.3, 0.15, 0.9, 0.25, 0.7],
        weights: [[0.7, 0.2, 0.1], [0.1, 0.2, 0.7]],
        news: [0.1, 0.3, 0.25, 0.15, 0.3, 0.2, 0.3, 0.8, 0.7, 0.9, 0.65, 0.73, 0.97, 0.1,
             0.05, 0.3, 0.01, 0.9, 0.95, 0.9, 0.2, 0.1, 0.2, 0.1, 0.01],
        days: 25,
        n: 10,
        k: 100,
        buy: 300,
        r: 0.1,
        vol: 0.35,
        ret: -0.1,
        canvas: ['price_chart_ins_1', 'news_chart_ins_1', 'return_chart_ins_1', 'vol_chart_ins_1'],
        button: 'next_1',
        text: 'inst_text_1'
    }
}

// Постоянная глобальная структура preset_game для запуска обучающей модели.
// Хранит информацию для построения графиков: график (объект класса Chart),
// массивы осей абсциссы и ординаты, названия осей и графиков, текущий шаг построения.

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

// Постоянная глобальная структура games для запуска пользовательской модели.
// Хранит информацию для построения графиков: кнопки начала, паузы и результата, график (объект класса Chart),
// массивы осей абсциссы и ординаты, названия осей и графиков, текущий шаг построения,
// интервал для построения с задержкой, булевую переменную пауза. 
// Кнопки начала, паузы и результата могут относится к двум графикам одновременно.

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
            }
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

// Класс Browser_game для запуска модели и построения графиков.

class Browser_game {
    
    constructor(days, n, k, buy, r, news, vol, ret, news_p, news_speed, preset) {
        //Инициализация класса Model с введенными параметрами и объектом preset, пустым или нет в зависимости от режима.
        this.simulation = new Model(days, n, k, buy, r, news, vol, ret, news_p, news_speed, preset);
        this.days = [...Array(days).keys()].map(x => x + 1); // Массив дней для оси абсцисс
        this.simulation.run(); // Запуск модели
        if (Object.keys(preset).length != 0) { // Обучающая
            this.preset_game = preset_game;
            this.preset_game_data(preset); // Функция заполнения данных для построения графика 
            document.getElementById(preset.button).addEventListener('click', () => {
                this.preset_game_build(preset);}); // По нажатии кнопки "далее" обновление графиков
        } else { // Пользовательская
            this.games = games;
            this.data(); // Функция заполнения данных для построения графика 
            this.games.forEach(chart => {
                document.getElementById(chart.start).addEventListener('click', () => this.graph_start(chart)); // Начало построения
                document.getElementById(chart.pause).addEventListener('click', () => this.pause(chart)); // Приостановка построения графиков
                document.getElementById(chart.result).addEventListener('click', () => this.result(chart)); // Построение графиков без задержки
            });
        }
    }

    // Функция уничтожения графиков и обнуления всей информации обучающего режима
    // для устранения конфликтов с последующими инициализациями Browser_game
    reset_preset() {
        // Уничтожение объектов Chart
        this.preset_game.forEach(game =>{
            if (game.chart) {
                game.chart.destroy();
                game.chart = null;
            }
            // Обнуление массивов и индекса построения
            game.X = [];
            game.Y = [];
            game.index = 1;
        });
    }

    // Заполнение данных для построения графиков обучающей модели
    preset_game_data(preset) {
        this.reset_preset(); // Если графики существуют, их следует убрать
        this.preset_game.forEach(game =>{
            game.X = this.days; // Для каждого графика ось абсцисс - дни
        });
        // Заполнение осей ординат каждого графика соответствующим массивом
        this.preset_game[0].Y = this.simulation.company.graph_prices;
        this.preset_game[1].Y = this.simulation.company.news;
        this.preset_game[2].Y = this.simulation.company.ret;
        this.preset_game[3].Y = this.simulation.company.vol;

        // Поиск canvas для построения каждого графика
        const price_canvas = document.getElementById(preset.canvas[0]);
        const news_canvas = document.getElementById((preset.canvas[1]));
        const return_canvas = document.getElementById((preset.canvas[2]));
        const vol_canvas = document.getElementById((preset.canvas[3]));

        // Создание графиков - объектов Chart. Атрибуты: canvas, названия графика и осей, ось абсцисс, ось ординат
        this.preset_game[0].chart = this.scatter_chart(price_canvas, this.preset_game[0].label, this.days, this.preset_game[0].Y);
        this.preset_game[1].chart = this.scatter_chart(news_canvas, this.preset_game[1].label, this.days, this.preset_game[1].Y);
        this.preset_game[2].chart = this.scatter_chart(return_canvas, this.preset_game[2].label, this.days, this.preset_game[2].Y);
        this.preset_game[3].chart = this.scatter_chart(vol_canvas, this.preset_game[3].label, this.days, this.preset_game[3].Y);

        // У обоих режимов обучающей модели есть свои поля для текста. Поиск и начальное заполнение данных полей
        let text = document.getElementById(preset.text);
        text.innerHTML = 'Модель готова к работе. Нажмите кнопку "далее".' + '<br>';
        text.innerHTML += "Текущая цена акции: " + String(this.preset_game[0].Y[this.preset_game[0].index - 1].toFixed(2)) + '<br>';
        text.innerHTML += "Новость сегодняшнего дня: " + String(this.preset_game[1].Y[this.preset_game[1].index - 1]) + '<br>';
        text.innerHTML += "Текущая доходность: " + String(this.preset_game[2].Y[this.preset_game[2].index - 1].toFixed(2)) + '<br>';
        text.innerHTML += "Текущая волатильность: " + String(this.preset_game[3].Y[this.preset_game[3].index - 1].toFixed(2)) + '<br>';
    }

    // Функция обновления графиков по нажатии кнопки "далее"
    preset_game_build(preset) {
        let text = document.getElementById(preset.text); // Поиск поля для текста
        text.innerHTML = '';
        if (this.preset_game[0].index < this.days.length) { // Пока дни симуляции не прошли
            this.preset_game.forEach(game => {
                game.chart.data.datasets[0].data.push({ x: this.days[game.index], y: game.Y[game.index] }); // Добавление точек в в массивы
                game.chart.update(); // Обновление графика
                game.index += 1; // Увеличение индекса
            });
            // Заполнение поля для текста текущими данными
            text.innerHTML += "Текущая цена акции: " + String(this.preset_game[0].Y[this.preset_game[0].index - 1].toFixed(2)) + '<br>';
            text.innerHTML += "Новость сегодняшнего дня : " + String(this.preset_game[1].Y[this.preset_game[1].index - 1]) + '<br>';
            text.innerHTML += "Текущая доходность: " + String(this.preset_game[2].Y[this.preset_game[2].index - 1].toFixed(2)) + '<br>';
            text.innerHTML += "Текущая волатильность :" + String(this.preset_game[3].Y[this.preset_game[3].index - 1].toFixed(2)) + '<br>';
        } else {
            // Все точки были добавлены. Конец
            text.innerHTML = 'Обучающая симуляция завершена. Перезагрузите страницу для начала новой или снова используйте кнопки "начать" для ускорения темпа.';
        }
    }

    // Заполнение данных для построения графиков обучающей модели
    data() {
        this.games.forEach(game => {
            game.charts.forEach(chart => {
                chart.X = this.days; // Так же заполнение массива абсцисс днями
            });
        });
        // Заполнение осей ординат каждого графика соответствующим массивом
        this.games[0].charts[0].Y = this.simulation.company.graph_prices;
        this.games[0].charts[1].Y = this.simulation.company.news;
        this.games[1].charts[0].Y = this.simulation.company.liquidity;
        this.games[2].charts[0].Y = this.simulation.company.ret;
        this.games[2].charts[1].Y = this.simulation.company.vol;
    }

    // Функция построения графика. По сути создание объекта класса Chart из импортированной библиотеки Chart.js
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

    // Функция начала построения, обновления данных и графиков
    graph_start(game) {
        // Стирание прдыдущих данных
        this.reset(game);
        game.charts.forEach (settings => { // Итерирование по каждому графику
            const canvas = document.getElementById(settings.canvas); // Поиск соответствующего canvas
            // Поиск соответствующего поля для текста и его первоначальное заполнение
            const text = document.getElementById(settings.text);
            text.innerText = settings.label[0] + ':\n';
            // Создание графиков и их последующее обновление
            settings.chart = this.scatter_chart(canvas, settings.label, settings.X, settings.Y);
            settings.interval = setInterval(() => { // Создание задержки построения
                if (!settings.pause) { // Если построение не стоит на паузе
                    if (settings.index < this.days.length - 1) { // Пока не закончились дни
                        settings.index++;
                        // Добавление новых точек на графики и их обновление
                        settings.chart.data.datasets[0].data = settings.X.slice(0, settings.index + 1).map((x, index) => ({ x, y: settings.Y[index] }));
                        settings.chart.update();
                        // Добавление текста в отведенное поле
                        if (settings.index > 0) {
                            // В текст добавляется изменение соответствующего параметра за один шаг. Если модуль разницы больше 0.4,
                            // текст заполняется зеленым или красным цветом в соответствии со стороной перегиба. Текст графика цены не окрашивается
                            if (settings.Y[settings.index] - settings.Y[settings.index - 1] < -0.4 && settings.canvas != 'price_chart' ) {
                                let value = String((settings.Y[settings.index] - settings.Y[settings.index - 1]).toFixed(2)) + ' ';
                                let string = `<span style="color: red;">${value}</span> `;
                                text.innerHTML += string;
                            } else if (settings.Y[settings.index] - settings.Y[settings.index - 1] > 0.4 && settings.canvas != 'price_chart') {
                                let value = String((settings.Y[settings.index] - settings.Y[settings.index - 1]).toFixed(2)) + ' ';
                                let string = `<span style="color: green;">${value}</span> `;
                                text.innerHTML += string;
                            // Если изменений не произошло, то они не выводятся. Например, чтобы изменения волатильности выводились каждые семь дней
                            } else if (settings.Y[settings.index] != settings.Y[settings.index - 1]) {
                                let value = String((settings.Y[settings.index] - settings.Y[settings.index - 1]).toFixed(2)) + ' ';
                                text.innerHTML += value;
                            }
                        } else { // Если изменений еще не произошло (первый день), просто выводим текущий параметр
                            text.innerHTML += settings.Y[settings.index].toFixed(2);
                        }
                    } else { // Симуляция закончилась, уничтожаем задержку
                        clearInterval(settings.interval);
                        settings.interval = null;
                    }
                }
            }, 500); // Задержка - 500ms
        });
    }

    // Функция приостановки построения по нажатии кнопки паузы
    pause(game) {
        game.charts.forEach(chart => {
            chart.pause = !chart.pause;
        });
    }

    // Функция построения графика без задержки
    result(game) {
        this.reset(game); // Уничтожаем текущий график
        // Создаем и строим графики полностью без задержки 
        game.charts.forEach(chart => {
            const canvas = document.getElementById(chart.canvas);
            const text = document.getElementById(chart.text);
            chart.chart = this.scatter_chart(canvas, chart.label, chart.X, chart.Y);
            chart.chart.data.datasets[0].data = chart.X.map((x, index) => ({ x, y: chart.Y[index] }));
            chart.chart.update();
            // Заполнение полей для текста
            if (chart.Y[0] < chart.Y[chart.Y.length - 1]) {
                text.innerHTML = "По результатам симуляции параметр '" + chart.label[0] + "' вырос." + '<br>';
            } else {
                text.innerHTML = "По результатам симуляции параметр " + chart.label[0] + " упал." + '<br>';
            }
            for (let i = 0; i < chart.Y.length; i++) { 
                if (chart.Y[i] != 0) {
                    text.innerHTML += String(chart.Y[i].toFixed(2)) + ' ';
                }
            }
        });
    }

    // Уничтожение графиков
    reset(game) {
        game.charts.forEach(chart => {
            // Обнуление задержки
            if (chart.interval) {
                clearInterval(chart.interval);
                chart.interval = null;
            }
            chart.index = 0; // Нулевой шаг
            if (chart.chart) {
                chart.chart.destroy(); // уничтожение графиков
                chart.chart = null;
            }
            // Если игра стояла на паузе, то убираем ее
            chart.pause = false;
        });
    }
}

var game; // Создание переменной для класса Browser_game

document.addEventListener('DOMContentLoaded', () => {
    // Класс toogle в model.html означает выпадающий список, contents - его содержимое
    const toggles = document.querySelectorAll('.toggle');
    const contents = document.querySelectorAll('.content');

    // Содержимое выпадающего списка не отображается
    contents.forEach(content => {
        content.style.display = 'none';
    });

    // Копирование текста из кнопок в массив text
    let text = [];
    toggles.forEach((button) => {
        text.push(button.textContent.substring(1));
    });

    // Проходимся по всем выпадающим спискам. По клику на на список_index его содержимое отображается,
    // в тексте кнопки меняется ▼. Повторное нажатие возвращает предыдущий вид
    toggles.forEach((button, index) => {
        button.addEventListener('click', () => {
            const content = contents[index];
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
            button.textContent = content.style.display === 'none' ? '▼' + text[index] : '▲' + text[index];
        });
    });

    // Поиск введенных параметров и остановка с выводом уведомления, если они не подходят
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
        } if (ret > 1 || ret < -1) {
            alert("Недопустимые параметры: доходность - число от минус единицы до единицы");
            return;
        } if (news_p > 1 || news_p < 0) {
            alert("Недопустимые параметры: вероятность скачка - число от нуля до единицы");
            return;
        } if (news_speed > 1 || news_speed < 0) {
            alert("Недопустимые параметры: скорость забывания - число от нуля до единицы");
            return;
        } if (vol > 1 || vol < 0) {
            alert("Недопустимые параметры: волатильность - число от нуля до единицы");
            return;
        }
        // Инициализация класса Browser_game и вывод сообщения об ее успешности
        let text = document.getElementById('starting_text');
        game = new Browser_game(days, n, k, buy, r, news, vol, ret, news_p, news_speed, {});
        text.innerHTML = "модель успешно запущена!";

    });

    // Инициализация режимов обучающей модели
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

    document.getElementById('start_high_speed').addEventListener('click', () => {
        if (game) {
            game.reset_preset();
        }
        game = new Browser_game(preset.speed.days, preset.speed.n, preset.speed.k, preset.speed.buy, 
            preset.speed.r, preset.speed.news[0], preset.speed.vol, preset.speed.ret, 0.1, 0.9, preset.speed);
    });

    document.getElementById('start_low_speed').addEventListener('click', () => {
        if (game) {
            game.reset_preset();
        }
        game = new Browser_game(preset.speed.days, preset.speed.n, preset.speed.k, preset.speed.buy, 
            preset.speed.r, preset.speed.news[0], preset.speed.vol, preset.speed.ret, 0.1, 0.1, preset.speed);
    });
});