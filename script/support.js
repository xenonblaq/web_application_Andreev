document.getElementById('support').addEventListener('click', () => {
        const email = "ivandreev@edu.hse.ru"; // Адрес
        const subject = "Помогите!"; // Тема письма
        const body = "Привет!\n\nУ меня возникла проблема...\n\n"; // Тело письма
        // Кодирование параметров в URL-формат
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        // Открытие почтового клиента с предварительно заполненным письмом
        window.location.href = mailtoLink;
});
