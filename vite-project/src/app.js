import { ref, watchEffect } from "vue";
import { morphdom } from "morphdom";

const cards = ref([
  { r: 255, g: 0, b: 0 },
  { r: 0, g: 255, b: 0 },
  { r: 0, g: 0, b: 255 },
]);

watchEffect(() => {
  const $cardsContainer = document.getElementById("cards");

  function createCard(card, index) {
    const $card = document.createElement("div");
    $card.className = "card";
    $card.id = `card-${card.r}-${card.g}-${card.b}`;
    $card.style.backgroundColor = `rgb(${card.r}, ${card.g}, ${card.b})`;
    $card.style.borderColor = `rgb(${card.r * 0.8}, ${card.g * 0.8}, ${card.b * 0.8})`;
    $card.style.transform = `translateX(${index * 100}px)`;

    return $card;
  }

  cards.value.forEach((card, index) => {
    const $existingCard = document.getElementById(
      `card-${card.r}-${card.g}-${card.b}`,
    );

    if ($existingCard) {
      $existingCard.style.transform = `translateX(${index * 100}px)`;
      return;
    } else {
      const $card = createCard(card, index);
      $cardsContainer.appendChild($card);
      return;
    }
  });

  $cardsContainer.querySelectorAll(".card").forEach(($card) => {
    const [r, g, b] = $card.id.split("-").slice(1).map(Number);

    const exists = cards.value.some(
      (card) => card.r === r && card.g === g && card.b === b,
    );

    if (!exists) {
      $card.remove();
    }
  });
});

const $add = document.getElementById("add");
const $clear = document.getElementById("clear");
const $shuffle = document.getElementById("shuffle");

$clear.addEventListener("click", () => {
  cards.value = [];
});

$add.addEventListener("click", () => {
  cards.value.push({
    r: Math.floor(Math.random() * 255),
    g: Math.floor(Math.random() * 255),
    b: Math.floor(Math.random() * 255),
  });
});

$shuffle.addEventListener("click", () => {
  cards.value = cards.value.sort(() => Math.random() - 0.5);
});
