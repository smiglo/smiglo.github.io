function getRangeRandom(len) {
  return Math.floor(Math.random() * len);
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

  for (s = 0; s < segments; s++) {
    let next = States.Letter;
    for (l = 0; l < seglen; l++, idx++) {
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

let segments = 3;
let seglen = 6;
let pwdCount = 5;

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
} else {
  for (i = 0; i < process.argv.length; i++) {
    switch (process.argv[i]) {
      case "--":
        break;
      case "-s":
        segments = process.argv[++i];
        break;
      case "-l":
        seglen = process.argv[++i];
        break;
      case "-c":
        pwdCount = process.argv[++i];
        break;
    }
  }
}

if (!inCLI) {
  document.body.innerHTML += "<ul id='pwd-list'></ul>";
  const pwdList = document.getElementById("pwd-list");

  for (let i = 0; i < pwdCount; i++) {
    const out = getPwd(segments, seglen);
    const listItem = document.createElement("li");
    listItem.textContent = out;

    listItem.style.transition = "background-color 150ms ease";

    listItem.addEventListener("click", () => {
      navigator.clipboard
        .writeText(listItem.textContent)
        .then(() => {
          listItem.style.backgroundColor = "lightgreen";
          listItem.style.color = "black";
          setTimeout(() => {
            listItem.style.transition = "background-color 350ms ease";
            listItem.style.backgroundColor = "";
            listItem.style.color = "";
          }, 150);
        })
        .catch((err) => {
          console.error("Failed to copy:", listItem.textContent, err);
        });
    });
    pwdList.appendChild(listItem);
  }
} else {
  for (i = 0; i < pwdCount; i++) {
    let out = getPwd(segments, seglen)
    console.log(out)
  }
}

