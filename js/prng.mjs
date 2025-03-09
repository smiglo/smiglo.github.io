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
  constructor(seed, base) {
    this.seed = seed + base;
    this.originalSeed = this.seed;
  }
  
  reset() {
    this.seed = this.originalSeed;
  }
 
  next() {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    this.seed = (a * this.seed + c) % m;
    
    return this.seed / m;
  }
}

export function createSeededRandomFromString(str, base) {
  const seed = stringToSeed(str);
  return new SeededPRNG(seed, base);
}
