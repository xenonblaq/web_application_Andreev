# Симуляция рынка ценных бумаг
## Описание проекта 

Планируется реализовать web-приложение для визуализации процессов рынка ценных бумаг. Будем рассматривать конкретную компанию и $n$ ее инвесторов. Правила взаимодействия игроков, изменения цены акции - реализация модели описана ниже. Само приложение предлагает пользователю выбрать параметры реализации и отображает графики результатов проведенной симуляции, такие как (пока что):

- График изменения цены акции;
- Гистограмма прибыли, в зависимости от риска - показывает, как влияет степень риска конкретного инвестора на его финальную бухгалтерскую прибыль;
- Дерево выбора фиксированного игрока;
- Количество сделок/оборот во времени - показывает ликвидность ценной бумаги.

1. **Параметры модели:**
    - $n$ - количество игроков;
    - $k$ - количество акций;
    - $buy\_price$ - текущая цена покупки;
    - $sell\_price$ - текущая цена продажи;
    - $buy\_list$ - список игроков, желающих купить на данный шаг;
    - $sell\_list$ - список игроков, желающих продать на данный шаг;
    - $spread = buy\_price - sell\_price$ - спрэд на данный шаг;
    - $count$ - процент акций, в соответсвии с которым были совершены сделки;
    - $r$ - показатель ликвидности ценной бумаги.

1. **Параметры игроков:**
    - $p$ - степень риска;
    - $amount$ - количество акций на данный шаг;
    - $profit$ - общая бухгалтерская прибыль на данный шаг;
    - $buy$ - цена покупки для данного игрока;
    - $sell$ - цена продажи для данного игрока.

## Реализация

1. **Начало.**
    
    Распределение $k$ акций по $n$ игрокам в равном количестве ⇒ $amount_i = amount_j = \frac{k}{n}$. Каждый игрок имеет индивидуальный параметр риска $p_i \in (0; 1)$ - выбирается случайным образом.
    
2. **Запуск $i$-ого шага.**
    - Начало дня. В свет выходит новость, имеющая коэффициент $impact \in [0; 2]$ - степень благоприятности новости для развития компании. Этот коэффициент умножается на степень риска $p_j$ каждого игрока. Если $p_j \times impact \times buy\_price > buy\_price$, то игрок хочет докупить акции. Если $p_j \times impact \times sell\_price > sell\_price$, то игрок хочет продать свой пакет. Если для $j$-ого игрока не удовлетворяются оба условия, то он удерживает свои акции.
    - Взаимодействие участников рынка. Если $j$-ый игрок хочет купить акции, то его цена $buy_j =  p_j \times impact \times buy\_price$. Если $m$-ый игрок хочет продать свой пакет, то его цена $sell_m =  p_m \times impact \times sell\_price$. Совершаются сделки между игроками, для которых $buy_j > sell_m$.
    - Обновление $buy\_price$. Пусть $M$ игроков желают купить, $L$   - продать.
        
        *if* $M > L$:
        
        $\ \ \ \ \ \ \ \  buy\_price\ += е ^ \frac{M}{2L}$
        
        *else:*
        
        $\ \ \ \ \ \ \ \ buy\_price\ -= е^ \frac{L}{2M}$
        
    - Обновление $spread$ и $sell\_price$.
        
        Пусть были совершены сделки с каким-то количеством акций $count$. Если $\frac{count}{k}  \geq r$ - это повышает ликвидность ценной бумаги данной компании ⇒ уменьшается $spread\ -= 0.5 ^ {\frac{50count}{k}}$. Если $\frac{count}{k}$ $\ < r$ ⇒ $spread\ += 0.5 ^ \frac{50count}{k}$. Обновляем $sell\_price = buy\_price - spread$.

## Стек технологий

Пользователь взаимодействует с визуальной составляющей сайта  (фронтэнд) ⇒ используется следующий стек технологий:

- HTML;
- CSS;
- JavaScript.