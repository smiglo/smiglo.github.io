import { createPRNG } from "./prng.mjs";

function genStartupPhrase(len, sl) {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let out = [];
  for (let i = 0; i < len; i++) {
    if (i > 0 && i % sl === 0) out.push("-");
    out.push(characters.charAt(Math.floor(Math.random() * characters.length)));
  }
  return out.join("");
}

function getRangeRandom(prng, len) {
  return Math.floor(prng.next() * len);
}

function getItem(prng, list) {
  return list[getRangeRandom(prng, list.length)];
}

function getPwd(prng, segments, seglen) {
  const DIGITS = "0123456789";
  const VOVELS = "aeiouy";
  const CONSONANTS = "bcdfghjklmnpqrstvwz";

  const STATES = {
    Letter: "letter",
    Conso: "consonant",
    Vovel: "vovel",
    Digit: "digit",
  };

  let len = segments * seglen;
  let idxDigit = getRangeRandom(prng, len);
  let idxUpper = (idxDigit + 1 + getRangeRandom(prng, len - 1)) % len;
  let idx = 0;
  let out = [];

  for (let s = 0; s < segments; s++) {
    let next = STATES.Letter;
    for (let l = 0; l < seglen; l++, idx++) {
      if (idx === idxDigit) next = STATES.Digit;
      let c;
      switch (next) {
        case STATES.Letter:
          c = getItem(prng, VOVELS + CONSONANTS);
          if (VOVELS.includes(c)) next = STATES.Conso;
          else next = STATES.Vovel;
          break;
        case STATES.Conso:
          c = getItem(prng, CONSONANTS);
          next = STATES.Letter;
          break;
        case STATES.Vovel:
          c = getItem(prng, VOVELS);
          next = STATES.Conso;
          break;
        case STATES.Digit:
          c = getItem(prng, DIGITS);
          next = STATES.Letter;
          break;
        default:
          break;
      }
      if (idx === idxUpper) c = c.toUpperCase();
      out.push(c);
    }
    if (s < segments - 1) out.push("-");
  }
  return out.join("");
}

function checkValue(value, defValue) {
  let v = parseInt(value);
  v = isNaN(v) ? defValue : v;
  return v;
}

function validate(minV, countV, segmentsV, seglenV) {
  min = checkValue(minV, 1);
  count = checkValue(countV, DEFAULTS.count);
  segments = checkValue(segmentsV, DEFAULTS.segments);
  seglen = checkValue(seglenV, DEFAULTS.seglen);
}

function genPasswords() {
  const PRNG_MAIN = createPRNG(phrase);

  console.log(`init: ${segments}x${seglen}, ${min}, +${count}`);
  console.log(`seed: ${phrase}, 0x${PRNG_MAIN.seed.toString(16)}/0x${PRNG_MAIN.childSeed.toString(16)}`);

  for (let i = 0; i < min; i++) PRNG_MAIN.next();

  const passwords = Array.from({ length: count }, () => getPwd(PRNG_MAIN.newPrng(), segments, seglen));
  return passwords;
}

function createPasswordItem(password) {
    const listItem = document.createElement("li");

    const itemContent = document.createElement("span");
    itemContent.textContent = password;
    itemContent.classList.add('pwd-item');

    listItem.appendChild(itemContent);
    return listItem;
}

function appendItem(pwdList, password) {
  const listItem = createPasswordItem(password);
  const itemContent = listItem.querySelector('span.pwd-item');
  itemContent.addEventListener("click", () => {
    navigator.clipboard
      .writeText(itemContent.textContent)
      .then(() => {
        itemContent.classList.add("copied");
        setTimeout(() => {
          itemContent.classList.remove("copied");
        }, 350);
      })
      .catch((err) => {
        console.error("Failed to copy:", itemContent.textContent, err);
      });
  });
  pwdList.appendChild(listItem);
}

function setFields() {
  document.getElementById("phraseInput").value = phrase;
  document.getElementById("minInput").value = min;
  document.getElementById("countInput").value = count;
  document.getElementById("segmentsInput").value = segments;
  document.getElementById("seglenInput").value = seglen;
}

function fillPasswords() {
  document.getElementById("prng-info").textContent = "?phrase=" + phrase + "&min=" + min + "&count=" + count;

  const pwdList = document.getElementById("pwd-list");
  pwdList.innerHTML = "";
  pwdList.setAttribute("start", min);
  genPasswords().forEach((pwd, i) => appendItem(pwdList, pwd));
}

function regeneratePasswords() {
  const phraseInput = document.getElementById("phraseInput");
  const minInput = document.getElementById("minInput");
  const countInput = document.getElementById("countInput");
  const segmentsInput = document.getElementById("segmentsInput");
  const seglenInput = document.getElementById("seglenInput");

  if (phraseInput.value == phrase
    && minInput.value == min
    && countInput.value == count
    && segmentsInput.value == segments
    && seglenInput.value == seglen) {
    min += count;
  } else {
    phrase = phraseInput.value;
    validate(minInput.value, countInput.value, segmentsInput.value, seglenInput.value);
  }

  setFields();
  fillPasswords();
}

const DEFAULTS = {
  segments: 3,
  seglen: 6,
  count: 10,
  phrase: {
    phrase: "default-phrase",
    rand: {
      cli: false,
      web: true,
      len: 16,
      delim: 4,
    }
  }
};

const IN_CLI = typeof process !== 'undefined' && process.versions?.node;

const USE_RAND_PHRASE = IN_CLI ? DEFAULTS.phrase.rand.cli : DEFAULTS.phrase.rand.web;

let segments = DEFAULTS.segments;
let seglen = DEFAULTS.seglen;
let count = DEFAULTS.count 
let phrase;
let min;
if (USE_RAND_PHRASE) {
  phrase = genStartupPhrase(DEFAULTS.phrase.rand.len, DEFAULTS.phrase.rand.delim);
  min = 1;
} else {
  phrase = DEFAULTS.phrase.phrase;
  min = IN_CLI ? 1 : Math.floor(Math.random() * 10000/count) * count + 1;
}

if (!IN_CLI) {
  const urlParams = new URLSearchParams(window.location.search);
  let anyParam =
    urlParams.has("segments") || urlParams.has("s") ||
    urlParams.has("len") || urlParams.has("l") ||
    urlParams.has("phrase") || urlParams.has("p") ||
    urlParams.has("min") ||
    urlParams.has("count");

  if (anyParam) {
    phrase = undefined;
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
    count = (urlParams.has("count") && urlParams.get("count")) || count;
    if (!phrase) {
      phrase = DEFAULTS.phrase.phrase;
      min = 1;
    }
  }
  validate(min, count, segments, seglen);
  
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("generateButton").addEventListener("click", regeneratePasswords);
    document.querySelectorAll(".input-container input").forEach(input => {
      input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          regeneratePasswords();
        }
      });
    });
    document.getElementById('themeCheckbox').addEventListener('change', () => {
      document.body.classList.toggle('dark-mode');
      document.body.classList.toggle('light-mode');
    });
    setFields();
    fillPasswords();
  });
} else {
  for (let i = 0; i < process.argv.length; i++) {
    switch (process.argv[i]) {
      case "-s": segments = process.argv[++i]; break;
      case "-l": seglen = process.argv[++i]; break;
      case "-p":
      case "--phrase": phrase = process.argv[++i]; break;
      case "-m":
      case "--min": min = process.argv[++i]; break;
      case "-c":
      case "--count": count = process.argv[++i]; break;
      default:
        break;
    }
  }
  validate(min, count, segments, seglen);
  genPasswords().forEach((pwd, i) => console.log(`${min+i}: ${pwd}`))
}
