// ----------------------------
// КОНФІГУРАЦІЯ
// ----------------------------
const KEY = "dd772601ceba2d73e868e22adc6ad814";

// Імпорт Google Generative AI
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// Ініціалізація моделі
const genAI = new GoogleGenerativeAI("AIzaSyDKCOn2IUn8eENj10u4RUZvIPuegmxJvS4");
const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
});

// Функція для отримання поради по одягу
async function getAdvice(prompt) {
    const result = await model.generateContent(prompt);
    return result.response.text();
}

// ----------------------------
// ПОЧАТКОВІ СТИЛІ
// ----------------------------
$('.infoContainer').hide(0);
$('.advice').hide(0);

// ----------------------------
// ФУНКЦІЯ ПОШУКУ ПО МІСТУ
// ----------------------------
function searchBtn(CITY) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${KEY}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);

            // Якщо немає даних про погоду — показати помилку
            if (!data.weather) {
                $('#error').css('display', 'flex');
                return;
            }
            $('#error').hide();

            // ----------------------------
            // ВІДОБРАЖЕННЯ СТАНУ НЕБА
            // ----------------------------
            const id = data.weather[0].id;
            let deg = data.wind.deg;

            $('.infoContainer').slideDown(300);

            if (id === 800) {
                $(`#clouds`).html(`<i class="fa-regular fa-sun"></i>`);
            } else if (id >= 801 && id <= 802) {
                $(`#clouds`).html(`<i class="fa-solid fa-cloud-sun"></i>`);
            } else if (id === 803) {
                $(`#clouds`).html(`<i class="fa-solid fa-cloud"></i>`);
            } else if (id === 804) {
                $(`#clouds`).html(`<i class="fa-solid fa-cloud-meatball"></i>`);
            }

            // ----------------------------
            // ВІДОБРАЖЕННЯ ІНФОРМАЦІЇ ПРО ПОГОДУ
            // ----------------------------
            $(`#cityName`).text(`${data.name}`);
            $(`#flag`).html(`<img src="https://flagsapi.com/${data.sys.country}/flat/64.png">`);
            $(`#pressure`).text(`${data.main.pressure} mbar`);
            $(`#temp`).text(`${(data.main.temp - 273.15).toFixed(0)}°`);
            $(`#humidity`).text(`${data.main.humidity} %`);
            $(`#windSpeed`).text(`${data.wind.speed} M/s`);
            $('.arrowContainer').css('transform', `rotate(${deg}deg)`);

            // ----------------------------
            // ПОРАДА ЩОДО ОДЯГУ
            // ----------------------------
            getAdvice(`Згенеруй **дуже коротку** (1–2 речення) пораду, як одягнутися.
            Врахуй температуру, вологість, вітер та опади.
            Не пояснюй JSON і не згадуй цифри напряму — тільки порада для людини.
            Погодні дані (JSON):
            ${JSON.stringify(data)}`)
                .then(advice => {
                    $(`#advice`).text(advice);
                    $('.advice').show(300);
                });

            // ----------------------------
            // ЗМІНА ФОНУ ЗАЛЕЖНО ВІД ТЕМПЕРАТУРИ
            // ----------------------------
            let temp = (data.main.temp - 273.15).toFixed(0);

            if (temp <= 0) {
                // холодний синій градієнт
                $('.wrap').css('background', 'linear-gradient(90deg, rgb(0,48,255), rgb(60,103,255), rgb(135,168,212))');
                $('.infoContainer, .location, .advice, button').css({
                    'background-color': 'rgba(0,48,255,0.2)',
                    'color': '#fff',
                    'backdrop-filter': 'blur(8px)'
                });
            } else if (temp >= 21) {
                // теплий помаранчевий градієнт
                $('.wrap').css('background', 'linear-gradient(90deg, rgb(255,210,130), rgb(255,170,80), rgb(255,120,50))');
                $('.infoContainer, .location, .advice, button').css({
                    'background-color': 'rgba(255,160,60,0.3)',
                    'color': '#000',
                    'backdrop-filter': 'blur(8px)'
                });
            } else {
                // проміжний зелено-блакитний
                $('.wrap').css('background', 'linear-gradient(90deg, rgb(135,168,212), rgb(147,200,180), rgb(255,223,100))');
                $('.infoContainer, .location, .advice, button').css({
                    'background-color': 'rgba(135,200,180,0.3)',
                    'color': '#000',
                    'backdrop-filter': 'blur(8px)'
                });
            }
        });
}

// ----------------------------
// АВТОМАТИЧНЕ ВИЗНАЧЕННЯ МІСТА ПО IP
// ----------------------------
if ($(`#city`).val().trim() === "") {
    fetch('https://get.geojs.io/v1/ip/geo.json')
        .then(res => res.json())
        .then(data => {
            let CITY = data.city;
            console.log(CITY); // ← ТІЛЬКИ МІСТО
            searchBtn(data.city);
        });
}

// ----------------------------
// Пошук за кнопкою або Enter
// ----------------------------
$('#search').click(function () {
    let CITY = $(`#city`).val().trim();
    searchBtn(CITY);
});

$('#city').on('keydown', function (e) {
    if (e.key === 'Enter') {
        let CITY = $(`#city`).val().trim();
        searchBtn(CITY);
    }
});

// ----------------------------
// ДОДАВАННЯ ЛОКАЦІЇ В ЗБЕРЕЖЕНІ
// ----------------------------
$('#addLocation').click(function () {
    let CITY = $(`#city`).val().trim();
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${KEY}`)
        .then(res => res.json())
        .then(data => {
            $('#savedLocations').append(`
            <div class='location'>
                <div class="cityCountry">${data.name}<img src="https://flagsapi.com/${data.sys.country}/flat/64.png"></div>
                <div class="temp">${(data.main.temp - 273.15).toFixed(0)}°</div>
                <button class="removeBtn"><i class="fa-solid fa-trash"></i></button>
            </div>`);
        });
});

// ----------------------------
// ВИДАЛЕННЯ ЛОКАЦІЇ
// ----------------------------
$(document).on('click', '.removeBtn', function (e) {
    e.stopPropagation(); // щоб клік по кнопці не спрацьовував на батька
    $(this).closest('.location').remove(); // видаляємо батьківський .location
});

// ----------------------------
// КЛІК НА ЛОКАЦІЮ З ЗБЕРЕЖЕНИХ
// ----------------------------
$(document).on('click', '.cityCountry', function (e) {
    e.stopPropagation();
    const city = $(this).clone().children().remove().end().text();
    searchBtn(city);
    if (window.innerWidth < 880) {
        $('.savedLocations').css('display', 'none');
        $('.weatherCard').css('display', 'flex');
    }
});

// ----------------------------
// ПЕРЕКЛЮЧЕННЯ МІЖ СТАРИМИ І НОВИМИ ЛОКАЦІЯМИ
// ----------------------------
$(`#savedBtn`).click(function () {
    $('.savedLocations').css('display', 'flex');
    $('.weatherCard').css('display', 'none');
});

$(`#backBtn`).click(function () {
    $('.savedLocations').css('display', 'none');
    $('.weatherCard').css('display', 'flex');
});
