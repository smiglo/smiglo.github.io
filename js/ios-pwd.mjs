import { createSeededRandomFromString } from "./prng.mjs";

function getRangeRandom(len) {
  return Math.floor(prng.next() * len);
}

function getItem(list) {
  return list[getRangeRandom(list.length)];
}

function getPwd(segments, seglen) {
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
  let idxDigit = getRangeRandom(len);
  let idxUpper = (idxDigit + 1 + getRangeRandom(len - 1)) % len;
  let idx = 0;
  let out = "";

  for (let s = 0; s < segments; s++) {
    let next = States.Letter;
    for (let l = 0; l < seglen; l++, idx++) {
      if (idx === idxDigit) next = States.Digit;
      let c;
      switch (next) {
        case States.Letter:
          c = getItem(Vovels + Consonants);
          if (Vovels.includes(c)) next = States.Conso;
          else next = States.Vovel;
          break;
        case States.Conso:
          c = getItem(Consonants);
          next = States.Letter;
          break;
        case States.Vovel:
          c = getItem(Vovels);
          next = States.Conso;
          break;
        case States.Digit:
          c = getItem(Digits);
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
let pwdCount = 5;
let idx = undefined;
let phrase = "default-seed";
let base = Math.floor(Math.random() * 10000);

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
  pwdCount =
    (urlParams.has("count") && urlParams.get("count")) ||
    (urlParams.has("c") && urlParams.get("c")) ||
    pwdCount;
  phrase =
    (urlParams.has("phrase") && urlParams.get("phrase")) ||
    (urlParams.has("p") && urlParams.get("p")) ||
    phrase;
  base =
    (urlParams.has("base") && urlParams.get("base")) ||
    (urlParams.has("b") && urlParams.get("b")) ||
    base;
  idx =
    (urlParams.has("idx") && urlParams.get("idx")) ||
    (urlParams.has("i") && urlParams.get("i")) ||
    idx;
} else {
  for (let i = 0; i < process.argv.length; i++) {
    switch (process.argv[i]) {
      case "-s": segments = process.argv[++i]; break;
      case "-l": seglen = process.argv[++i]; break;
      case "-c": pwdCount = process.argv[++i]; break;
      case "-p":
      case "--phrase": phrase = process.argv[++i]; break;
      case "-b":
      case "--base": base = process.argv[++i]; break;
      case "-i":
      case "--idx": idx = process.argv[++i]; break;
      default:
        break;
    }
  }
}

segments = parseInt(segments);
seglen = parseInt(seglen);
pwdCount = parseInt(pwdCount);
base = parseInt(base);

if (idx !== undefined) {
  idx = parseInt(idx);
  if (idx < 0) idx = undefined;
  else if (idx >= pwdCount) pwdCount = idx + 1;
}

const prng = createSeededRandomFromString(phrase, base);

const passwords = Array.from({ length: pwdCount }, () => getPwd(segments, seglen));

if (idx !== undefined) {
  passwords.splice(0, passwords.length, passwords[idx]);
}

if (!inCLI) {
  const prngInfo = document.getElementById("prng-info");
  prngInfo.textContent = "?phrase=" + phrase + "&base=" + base;
  if (idx !== undefined) prngInfo.textContent += "&idx=" + idx;
  idx = idx || 0;
  const pwdList = document.getElementById("pwd-list");
  passwords.forEach((pwd, i) => appendItem(pwdList, pwd, idx+i));
} else {
  idx = idx || 0;
  console.log(`${phrase} :: ${base}`);
  passwords.forEach((pwd, i) => console.log(`${idx+i}: ${pwd}`))
}
