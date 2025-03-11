import { createPRNG } from "./prng.mjs";

function getRangeRandom(prng, len) {
  return Math.floor(prng.next() * len);
}

function getItem(prng, list) {
  return list[getRangeRandom(prng, list.length)];
}

function getPwd(prng, segments, seglen) {
  const Digits = "0123456789";
  const Vovels = "aeiouy";
  const Consonants = "bcdfghjklmnpqrstvwz";

  const States = {
    Letter: "letter",
    Conso: "consonant",
    Vovel: "vovel",
    Digit: "digit",
  };

  let len = segments * seglen;
  let idxDigit = getRangeRandom(prng, len);
  let idxUpper = (idxDigit + 1 + getRangeRandom(prng, len - 1)) % len;
  let idx = 0;
  let out = "";

  for (let s = 0; s < segments; s++) {
    let next = States.Letter;
    for (let l = 0; l < seglen; l++, idx++) {
      if (idx === idxDigit) next = States.Digit;
      let c;
      switch (next) {
        case States.Letter:
          c = getItem(prng, Vovels + Consonants);
          if (Vovels.includes(c)) next = States.Conso;
          else next = States.Vovel;
          break;
        case States.Conso:
          c = getItem(prng, Consonants);
          next = States.Letter;
          break;
        case States.Vovel:
          c = getItem(prng, Vovels);
          next = States.Conso;
          break;
        case States.Digit:
          c = getItem(prng, Digits);
          next = States.Letter;
          break;
        default:
          break;
      }
      if (idx === idxUpper) c = c.toUpperCase();
      out += c;
    }
    if (s < segments - 1) out += "-";
  }
  return out;
}

function appendItem(pwdList, password, index) {
  const listItem = document.createElement("li");
  const info = document.createElement("spam");
  info.textContent = index + ": ";
  const itemContent = document.createElement("span");
  itemContent.textContent = password;

  itemContent.style.padding = "0.2rem";
  itemContent.style.display = "inline-block";
  itemContent.style.transition = "background-color 150ms ease";

  itemContent.addEventListener("click", () => {
    navigator.clipboard
      .writeText(itemContent.textContent)
      .then(() => {
        itemContent.style.backgroundColor = "lightgreen";
        itemContent.style.color = "black";
        setTimeout(() => {
          itemContent.style.transition = "background-color 350ms ease";
          itemContent.style.backgroundColor = "";
          itemContent.style.color = "";
        }, 150);
      })
      .catch((err) => {
        console.error("Failed to copy:", itemContent.textContent, err);
      });
  });

  listItem.appendChild(info);
  listItem.appendChild(itemContent);
  pwdList.appendChild(listItem);
}

let segments = 3;
let seglen = 6;
let idx = undefined;
let phrase = "default-seed";
let min = Math.floor(Math.random() * 1000) * 10;
let max = undefined;

let inCLI = false;
if (typeof process !== "undefined" && process.release.name === "node")
  inCLI = true;

if (!inCLI) {
  const urlParams = new URLSearchParams(window.location.search);
  segments =
    (urlParams.has("segments") && urlParams.get("segments")) ||
    (urlParams.has("s") && urlParams.get("s")) ||
    segments;
  seglen =
    (urlParams.has("len") && urlParams.get("len")) ||
    (urlParams.has("l") && urlParams.get("l")) ||
    seglen;
  phrase =
    (urlParams.has("phrase") && urlParams.get("phrase")) ||
    (urlParams.has("p") && urlParams.get("p")) ||
    phrase;
  min = (urlParams.has("min") && urlParams.get("min")) || min;
  max = (urlParams.has("max") && urlParams.get("max")) || max;
  idx = (urlParams.has("idx") && urlParams.get("idx")) || idx;
} else {
  for (let i = 0; i < process.argv.length; i++) {
    switch (process.argv[i]) {
      case "-s": segments = process.argv[++i]; break;
      case "-l": seglen = process.argv[++i]; break;
      case "-p":
      case "--phrase": phrase = process.argv[++i]; break;
      case "--min": min = process.argv[++i]; break;
      case "--max": max = process.argv[++i]; break;
      case "-i":
      case "-idx": idx = process.argv[++i]; break;
      default:
        break;
    }
  }
}

segments = parseInt(segments);
segments = isNaN(segments) ? 3 : segments;
seglen = parseInt(seglen);
seglen = isNaN(seglen) ? 6 : seglen;
min = parseInt(min);
min = isNaN(min) ? 0 : min;
max = parseInt(max);
max = isNaN(max) ? 10 : max;
if (min === undefined || min < 0) min = 0;
if (max === undefined || max <= min) max = min + 10;
idx = parseInt(idx);
idx = isNaN(idx) ? undefined : idx;
if (idx !== undefined) {
  min = max = idx;
}

const pwdCount = max - min + 1;
const prng = createPRNG(phrase);

for (let i = 0; i < min; i++) prng.next();

const passwords = Array.from({ length: pwdCount }, () => getPwd(prng.newPrng(), segments, seglen));

if (!inCLI) {
  const prngInfo = document.getElementById("prng-info");
  prngInfo.textContent = "?phrase=" + phrase;
  if (idx === undefined) {
    prngInfo.textContent += "&min=" + min + "&max=" + max;
  } else {
    prngInfo.textContent += "&idx=" + idx;
  }

  const pwdList = document.getElementById("pwd-list");
  passwords.forEach((pwd, i) => appendItem(pwdList, pwd, min+i));
} else {
  if (idx === undefined) {
    console.log(`${phrase}, [${min}, ${max}]`);
  } else {
    console.log(`${phrase}, i=${idx}`);
  }
  passwords.forEach((pwd, i) => console.log(`${min+i}: ${pwd}`))
}
