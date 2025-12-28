// Smooth scroll to next block
function scrollToNextBlock() {
  const carousel = document.querySelector(".carousel");
  const carouselBottom = carousel.offsetTop + carousel.offsetHeight;

  window.scrollTo({
    top: carouselBottom,
    behavior: "smooth",
  });
}

async function getRandomUser() {
  // Вызываем созданный нами маршрут на нашем сервере
  const response = await fetch("/get-user");
  const data = await response.json();

  // Просто выводим в консоль для проверки
  console.log("Данные от нашего сервера:", data);

  // В реальности здесь будет код, который вставляет данные в HTML-карточки [cite: 81]
  document.getElementById(
    "user-info"
  ).innerText = `${data.user.firstName} ${data.user.lastName} из ${data.user.country} ${data.exchange.USD}`;
}
