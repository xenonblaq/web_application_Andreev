# Симуляция рынка ценных бумаг. Андреев Иван БЭАД223.
## Описание проекта 

Проект представляет собой web-приложение для визуализации процессов рынка ценных бумаг, основной функцией которого является построение графиков-результатов модели по введенным пользователем параметрам. Графики иллюстрируют зависимость энодогенных переменных модели от внешних новостей, связанных с компанией - эмитента ценных бумаг. Задаются экзогенно. 

### Структура проекта.

Web-приложение состоит из двух web-страниц: "главная" и "модель". Подробнее об их структуре:

1. Главная страница представляет собой краткое описание функционала приложения, ссылки на другие страницы и предложение перейти на основную страницу для начала работы с моделью.
2. Страница "Модель" условно делится на два раздела: обучающая модель и пользовательская. 

    По нажатии кнопки старта обучающая модель строит четыре графика по данным из пресета. Два варианта сценария: изначально компания имеет непривлекательные инвестиционные показатели или наоборот. Графики строятся интерактивно по нажатии кнопки "далее". Совместно с добавлением новой точки в отведенное поле для текста выводятся текущие параметры модели и краткое описание ситуации на рынке. Так же помимо базового режима, есть режим высокой и медленной скорости забывания.

    Пользовательская модель начинается с введения параметров: количество дней, игроков и акций, новостной фон, скорость забывания, вероятность скачка, текущие волатильность, доходность, ликвидность и цена акции. Подробнее о каждом параметре будет рассказно позже. По нажатии кнопки старта при удачном запуске пользователь получает сообщение "модель успешно запущена!", иначе - alert с объяснением причины неудачного запуска. Ниже распологаются три выпадающих списка с графиками, соответствующими их названию. Каждый список имеет свои кнопки старта, паузы, результата и поля для текста. Старт - запускает построение графиков с задержкой в 500ms. Пауза - приостанавливает построение до следующего нажатия. Результат - строит графики сразу без задержки. В поля для текста добавляются изменения переменных.

### Модель.

Далее будет представлено полное описание принципов работы модели.

1. **Параметры модели:**

    - $days$ - количество дней симуляции;
    - $n$ - количество игроков;
    - $k$ - количество акций;
    - $buy$ - текущая цена покупки;
    - $sell$ - текущая цена продажи;
    - $spread = buy - sell$ - спрэд на данный шаг;
    - $liq$ - процент акций, в соответствии с которым были совершены сделки;
    - $r$ - показатель ликвидности ценной бумаги.
    - $news_p$ - вероятность скачка.
    - $news_s$ - скорость забывания

1. **Параметры игроков:**
    - $p$ - степень риска;
    - $weights$ - веса компонентов скоринговой модели;
    - $capital$ - текущий портфель;


**Создание инвесторов.**

Перед началом симуляции рынка модель создает инвесторов. Каждому инвестору присваивается толерантность к риску, веса компонентов скоринговой модели и количество акций в текущем портфеле. 

- Толератность к риску - случайное число от нуля до единицы, обозначающее готовность инвестора вкладываться в рискованные проекты. Соответственно, единица - абсолютная толерантность, а ноль - ее отсутствие. Инвестор с высокой готовностью к риску считается агрессивным, а с низкой - консервативным.
- В соответствии с риск-профилем инвестора создаются коэффициенты доходности, ликвидности и волатильности в общей формуле оценки.

    Если инвестор агрессивный, то есть $risk > 0.5$, то:
        $$w_{ret} > w_{liq} > w_{vol}$$
    Иначе инвестор считается консервативным, и выполняется:
        $$w_{vol} > w_{liq} > w_{ret}$$

    Более рискованные проекты всегда предполагают высокую доходность, которая и является премией за риск. Поэтому для агрессивного инвестора доходность является ключевым показателем.

    Волатильность как стандартное отклонение доходности является фактором риска, ведь скачущий актив явно нельзя назвать надежным. Поэтому для консервативного инвестора именно волатильность является главным параметром. 

    Ликвидность - возможность быстрой продажи по адекватной цене - важна и для агрессивного инвестора, и для консервативного.

- Все акции компании изначально делятся поровну между инвесторами.

**Скоринг.**
    
Следующая формула основывается на работе

Каждый день симуляции каждый инвестор дает оценку инвестиционной привлекательности компании. Оценка i-ого инвестора вычисляется по следующей формуле:

$score_i = 0.25 \cdot risk_i + 0.15 \cdot \left(w_{ret_i} \cdot ret + w_{liq_i} \cdot liq + w_{vol_i} \cdot vol\right) + 0.6 \cdot news_{bg}$
    
Как видно из формулы, текущий новостной фон компании является главным параметром для инвестора в оценке привлекательности. Новости о делах компании по сути являются основным фактором движения цены актива, ведь новости о текущем формируют адаптивные ожидания инвесторов о будущем. Динамика изменения перемнных будет описана позже.

На основе полученной рекомендации инвестор решает, покупает он ценную бумагу или же нет.
    
**Сделки.**
    
 После принятия решения каждого инвестора о покупке или продаже своего портфеля, запускается процесс моделирования сделок. Список инвесторов сортируется по возрастанию в соответствии со своими оценками и делится на два массива - продавцы и покупатели.

Инвестор с наименьшей оценкой хочет продать свой портфель сильнее всех и готов произвести сделку по наименьшей цене. Инвестор с наивысшей оценкой хочет приобрести ценные бумаги сильнее всех и готов произвести сделку по наивысшей цене. Покупатели итерируются по убыванию, а продавцы - по возрастанию. Таким образом, пока есть пары покуптель - продавец, продавец с самой высокой текущей ценой сходится с продавцом с самой низкой текущей ценой. Получается легкая реализация стакана.

**Изменение параметров**

- Цена акции.

Если купить акции захотели больше инвесторов, чем продать, то:
        
$$price = price_b \cdot (1 + score_b) \cdot \frac{buyers}{players}$$

где $score_b$ - наименьшая оценка среди покупателей, $price_b$ - текущая цена покупки, $\frac{buyers}{players}$ - отношение числа покупателей ко всем инвесторам. 

Цена акции - это цена последней сделки. В нашей модели последним покупателем станет инвестор с наименьшей оценкой в списке покупателей.

Если же акции захотели больше продать, чем купить, то:

$$price = price_s \cdot (1 + score_s) \cdot \frac{sellers}{players}$$

где $score_s$ - наивысшая оценка среди продавцов, $price_s$ - текущая цена продажи, $\frac{sellers}{players}$ - отношение числа продавцов ко всем инвесторам. 

Цена акции - это цена последней сделки. В нашей модели последним продавцом станет инвестор с наибольшей оценкой в списке продавцов.

- Доходность.

Ежедневная доходность - отношение сегодняшней цены к вчерашней.

$$ret_t = \ln \left(\frac{price_t}{price_{t-1}}\right)$$

- Ликвидность.

Ликвидность - возможность произвести сделку с ценной бумагой быстро и эффективно. Ликвидность является абстрактной величиной. Ее сложно измерить количественно. Попробуем сделать это базово:

$$liq_t = \frac{deal_t}{stock}$$

Отношение количества ценных бумаг, с которыми произошли сделки, ко всем.

- Спрэд.

Спрэд - разница между текущей ценой покупки и продажи. Спрэд имеет зависимость от ликвидности. Чем больше ликвидность, тем меньше спрэд - данный закон обозначает уменьшение разницы в заявках на продажу и покупку, как следствие роста торгов. В модели он вычисляется по следующей формуле:

$$spread = 0.5^{50\cdot liq}$$

- Волатильность.

Волотильность - стандартное отклонение доходности. В модели имеет смысл считать волотильность каждые семь дней.

$$vol = \sqrt\frac{\sum_{i = 1}^{7} \left(ret_i - \overline{ret}\right)^2}{6}$$

Для подсчета волатильности следует использовать именно несмещенную выборочную дисперсию.

- Новостной фон.

Текущая новость - является единственным экзогенным параметром модели. Посмотрим, как она инициализируется:

Модель имеет параметр "вероятность скачка", обозначающий вероятность изменения новостного фона на противоположный.
 Если текущий новостной фон позитивный, то есть, $news_{bg} \geq 0.5$, то c заданной пользователем вероятностью (вероятность скачка):

$$
\begin{equation}
\left\{ \begin{aligned} 
  news_t = random(0.4,\ 1),\ p > p_j\\
  news_t = random(0.1,\ 0.6),\ p < p_j
\end{aligned} \right.
\end{equation}
$$

где $p$ - cлучайное число от нуля до единицы.
Если же текущий новостной фон негативный, то наоборот.

Следующий этап - обновление новостного фона. Текущая новость влияет на инвестиционную привлекательность бумаги, однако никто не забывает про предыдущие новости, связанные с компанией. Для подсчета новостного фона используется следующая формула:

$$news_{bg_t} = \sum_{k = 0}^{t} news_k  \cdot e^{-M(t - k)}$$

где $M$ - скорость забывания. Таким образом, новость, вышедшая в k-тый день с течением времени имеет все меньший вес в оценке новостного фона. Далее новостной фон нормируется по своему максимальному значению - сумме сходящегося ряда $\sum_{k = 0}^{days} e^{-M(t - k)}$.

## Стек технологий

Пользователь взаимодействует с визуальной составляющей сайта  (фронтэнд) ⇒ используется следующий стек технологий:

- HTML;
- CSS;
- JavaScript.

Весь код выполнен в объектно-ориентированном виде.