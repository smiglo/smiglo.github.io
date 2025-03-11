function stringToSeed(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  
  return Math.abs(hash);
}

class SeededPRNG {
  constructor(seed) {
    this.seed = Math.abs(seed);
    this.childSeed = Math.abs(( this.seed << 8 ) | (this.seed & 0x00FF00 >>8));
  }

  newPrng() {
    const m = Math.pow(2, 32);
    this.next();
    return new SeededPRNG((this.seed + this.childSeed) % m);
  }

  next() {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);

    this.seed = (a * this.seed + c) % m;

    return this.seed / m;
  }
}

export function createPRNG(str) {
  return new SeededPRNG(stringToSeed(str));
}
