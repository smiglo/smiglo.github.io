import { createPRNG } from "./prng.mjs";

function getRangeRandom(prng, len) {
  return Math.floor(prng.next() * len);
}

function getItem(prng, list) {
  return list[getRangeRandom(prng, list.length)];
}

function checkValue(value, defValue) {
  let v = parseInt(value);
  v = isNaN(v) ? defValue : v;
  return v;
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

function createPasswordItem(password, index) {
    const listItem = document.createElement("li");
    const info = document.createElement("span");
    info.textContent = index + ": ";

    const itemContent = document.createElement("span");
    itemContent.textContent = password;
    itemContent.classList.add('pwd-item');

    listItem.appendChild(info);
    listItem.appendChild(itemContent);
    return listItem;
}

function appendItem(pwdList, password, index) {
  const listItem = createPasswordItem(password, index);
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

let segments = 3;
let seglen = 6;
let idx = undefined;
let phrase = "default-seed";
let min = Math.floor(Math.random() * 1000) * 10 + 1;
let count = 10;

const PRNG_MAIN = createPRNG(phrase);
    
function generatePasswords() {
  const phraseInput = document.getElementById("phraseInput");
  const minInput = document.getElementById("minInput");
  const countInput = document.getElementById("countInput");
  const idxInput = document.getElementById("idxInput");
  const segmentsInput = document.getElementById("segmentsInput");
  const seglenInput = document.getElementById("seglenInput");

  if (phraseInput.value == phrase
    && minInput.value == min
    && countInput.value == count
    && ( (idx === undefined && idxInput.value == "" ) || ( idx !== undefined && idxInput.value == idx ) )
    && segmentsInput.value == segments
    && seglenInput.value == seglen) {
      console.log("no change");
    min = Math.floor(Math.random() * 1000) * 10 + 1;
  } else {
    console.log("changed");
    phrase = phraseInput.value;
    min = checkValue(minInput.value, 1);
    count = checkValue(countInput.value, 10);
    idx = checkValue(idxInput.value, undefined);
    segments = checkValue(segmentsInput.value, 3);
    seglen = checkValue(seglenInput.value, 6);
  }
  if (idx !== undefined) {
    idxInput.value = idx;
    min = idx;
    count = 1;
  } else {
    idxInput.value = "";
    if (min < 1) {
      min = 1;
    }
    if (count <= 0) {
      count = 10;
    }
  }
  phraseInput.value = phrase;
  minInput.value = min;
  countInput.value = count;
  segmentsInput.value = segments;
  seglenInput.value = seglen;

  console.log(`init: ${segments}x${seglen}, ${min}, +${count}`);
  console.log(`seed: ${phrase}, 0x${PRNG_MAIN.seed.toString(16)}/0x${PRNG_MAIN.childSeed.toString(16)}`);

  for (let i = 0; i < min; i++) PRNG_MAIN.next();

  const passwords = Array.from({ length: count }, () => getPwd(PRNG_MAIN.newPrng(), segments, seglen));

  const prngInfo = document.getElementById("prng-info");
  prngInfo.textContent = "?phrase=" + phrase + "&min=" + min + "&count=" + count;

  const pwdList = document.getElementById("pwd-list");
  pwdList.innerHTML = "";
  passwords.forEach((pwd, i) => appendItem(pwdList, pwd, min + i));
}

const IN_CLI = typeof process !== 'undefined' && process.versions?.node;

if (!IN_CLI) {
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
  count = (urlParams.has("count") && urlParams.get("count")) || count;
  idx = (urlParams.has("idx") && urlParams.get("idx")) || idx;
  segments = checkValue(segments, 3);
  seglen = checkValue(seglen, 6);
  min = checkValue(min, 1);
  count = checkValue(count, 10);
  if (min < 1) min = 1;
  if (count <= 0) count = 10;
  
  if(idx!==undefined) {
    min=idx;
    count=1;
  }

  window.addEventListener("load", () => {
    document.getElementById("generateButton").addEventListener("click", generatePasswords);
    generatePasswords();
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
      case "-i":
      case "-idx": idx = process.argv[++i]; break;
      default:
        break;
    }
  }

  segments = checkValue(segments, 3);
  seglen = checkValue(seglen, 6);
  min = checkValue(min, 1);
  count = checkValue(count, 10);
  if (min < 1) min = 1;
  if (count <= 0) count = 10;
  idx = checkValue(idx, undefined);
  if (idx !== undefined) {
    min = idx;
    count = 1;
  }

  console.log(`init: ${segments}x${seglen}, ${min}/${idx}, +${count}`);
  console.log(`seed: ${phrase}, 0x${PRNG_MAIN.seed.toString(16)}/0x${PRNG_MAIN.childSeed.toString(16)}`);

  passwords.forEach((pwd, i) => console.log(`${min+i}: ${pwd}`))
}

for (let i = 0; i < min; i++) PRNG_MAIN.next();

const passwords = Array.from({ length: count }, () => getPwd(PRNG_MAIN.newPrng(), segments, seglen));

if (!IN_CLI) {
  const prngInfo = document.getElementById("prng-info");
  prngInfo.textContent = "?phrase=" + phrase;
  if (idx === undefined) {
    prngInfo.textContent += "&min=" + min + "&count=" + count;
  } else {
    prngInfo.textContent += "&idx=" + idx;
  }

  const pwdList = document.getElementById("pwd-list");
  passwords.forEach((pwd, i) => appendItem(pwdList, pwd, min+i));
} else {
  passwords.forEach((pwd, i) => console.log(`${min+i}: ${pwd}`))
}
