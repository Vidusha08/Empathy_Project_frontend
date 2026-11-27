import fs from 'fs';
import path from 'path';

const outDir = path.resolve('src/assets/audio');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate a valid 44.1kHz 16-bit stereo WAV file
function createWavBuffer(numChannels, sampleRate, samplesL, samplesR) {
  const numSamples = samplesL.length;
  const blockAlign = numChannels * 2;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // PCM = 1
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    // Clip to [-1, 1]
    const sL = Math.max(-1, Math.min(1, samplesL[i]));
    const sR = Math.max(-1, Math.min(1, samplesR[i]));
    const intL = sL < 0 ? Math.round(sL * 32768) : Math.round(sL * 32767);
    const intR = sR < 0 ? Math.round(sR * 32768) : Math.round(sR * 32767);
    buffer.writeInt16LE(intL, offset);
    buffer.writeInt16LE(intR, offset + 2);
    offset += 4;
  }

  return buffer;
}

const sampleRate = 44100;
const durationSec = 10; // 10-second seamless looping audio
const totalSamples = sampleRate * durationSec;

// Simple seeded PRNG for reproducible gentle textures
function makeNoiseGen(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return (s / 233280) * 2 - 1;
  };
}

// 1. Rich Town: Soft jazz chords / city night warmth (electric piano / Rhodes warmth + soft trumpet-like tones + gentle city drone)
function genRichTown() {
  const sL = new Float32Array(totalSamples);
  const sR = new Float32Array(totalSamples);
  const chords = [
    // CMaj7 (C3, E3, G3, B3), Am7 (A2, C3, E3, G3), Dm7 (D3, F3, A3, C4), G7sus (G2, F3, A3, D4)
    [130.81, 164.81, 196.00, 246.94],
    [110.00, 130.81, 164.81, 196.00],
    [146.83, 174.61, 220.00, 261.63],
    [98.00, 174.61, 220.00, 293.66],
  ];
  const noise = makeNoiseGen(1234);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Slow chord transition over 10 seconds
    const chordIdx = Math.floor((t / durationSec) * chords.length) % chords.length;
    const currentChord = chords[chordIdx];

    let toneL = 0;
    let toneR = 0;
    currentChord.forEach((freq, idx) => {
      // Soft vibrato / tremolo
      const lfo = 1 + 0.08 * Math.sin(2 * Math.PI * 3.5 * t);
      const amp = (0.05 / (idx + 1)) * lfo;
      toneL += amp * Math.sin(2 * Math.PI * freq * t);
      toneR += amp * Math.sin(2 * Math.PI * (freq * 1.002) * t + idx);
    });

    // Gentle warm vinyl / city distant hum
    const hum = 0.02 * Math.sin(2 * Math.PI * 60 * t) + 0.01 * Math.sin(2 * Math.PI * 120 * t);
    const air = 0.008 * noise();

    // Loop envelope crossfade to prevent click
    const fadeWindow = 0.5 * sampleRate;
    let loopFade = 1;
    if (i < fadeWindow) loopFade = i / fadeWindow;
    if (i > totalSamples - fadeWindow) loopFade = (totalSamples - i) / fadeWindow;

    sL[i] = (toneL + hum + air) * loopFade * 0.7;
    sR[i] = (toneR + hum + air) * loopFade * 0.7;
  }
  return { sL, sR };
}

// 2. Village: Birds / gentle breeze
function genVillage() {
  const sL = new Float32Array(totalSamples);
  const sR = new Float32Array(totalSamples);
  const noise = makeNoiseGen(4321);

  // Generate bird chirp times
  const birdEvents = [
    { t: 1.2, f: 2600 }, { t: 1.6, f: 3100 }, { t: 3.8, f: 2800 },
    { t: 4.1, f: 3300 }, { t: 6.5, f: 2900 }, { t: 8.2, f: 3200 },
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Gentle breeze (lowpass modulated noise)
    const breezeMod = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.2 * t);
    const breezeL = noise() * 0.04 * breezeMod;
    const breezeR = noise() * 0.04 * breezeMod;

    // Bird chirps
    let birdL = 0;
    let birdR = 0;
    for (const b of birdEvents) {
      const dt = t - b.t;
      if (dt >= 0 && dt < 0.12) {
        const chirpEnv = Math.sin((dt / 0.12) * Math.PI);
        const chirpFreq = b.f + 600 * Math.sin((dt / 0.12) * Math.PI);
        const bTone = Math.sin(2 * Math.PI * chirpFreq * dt) * chirpEnv * 0.06;
        birdL += bTone * 0.7;
        birdR += bTone * 0.9;
      }
    }

    const fadeWindow = 0.5 * sampleRate;
    let loopFade = 1;
    if (i < fadeWindow) loopFade = i / fadeWindow;
    if (i > totalSamples - fadeWindow) loopFade = (totalSamples - i) / fadeWindow;

    sL[i] = (breezeL + birdL) * loopFade * 0.8;
    sR[i] = (breezeR + birdR) * loopFade * 0.8;
  }
  return { sL, sR };
}

// 3. Cloudy: Gentle Wind
function genGentleWind() {
  const sL = new Float32Array(totalSamples);
  const sR = new Float32Array(totalSamples);
  const noise = makeNoiseGen(7890);

  let lpL = 0;
  let lpR = 0;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Modulating wind frequency / intensity
    const windSpeed = 0.08 + 0.04 * Math.sin(2 * Math.PI * 0.15 * t) + 0.02 * Math.sin(2 * Math.PI * 0.35 * t);
    const rawL = noise();
    const rawR = noise();
    // Two-pole low pass filter for warm deep wind gust
    lpL += (rawL - lpL) * windSpeed;
    lpR += (rawR - lpR) * windSpeed;

    const fadeWindow = 0.5 * sampleRate;
    let loopFade = 1;
    if (i < fadeWindow) loopFade = i / fadeWindow;
    if (i > totalSamples - fadeWindow) loopFade = (totalSamples - i) / fadeWindow;

    sL[i] = lpL * 0.12 * loopFade;
    sR[i] = lpR * 0.12 * loopFade;
  }
  return { sL, sR };
}

// 4. Rainy: Rainfall with gentle patter
function genRainfall() {
  const sL = new Float32Array(totalSamples);
  const sR = new Float32Array(totalSamples);
  const noise = makeNoiseGen(9911);

  let rainLP_L = 0;
  let rainLP_R = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const nL = noise();
    const nR = noise();

    // Constant soothing rainfall wash
    rainLP_L += (nL - rainLP_L) * 0.25;
    rainLP_R += (nR - rainLP_R) * 0.25;

    // Distinct soft droplet pitter-patters
    let dropL = 0;
    let dropR = 0;
    if (Math.abs(nL) > 0.985) {
      dropL = nL * 0.08;
    }
    if (Math.abs(nR) > 0.985) {
      dropR = nR * 0.08;
    }

    const fadeWindow = 0.5 * sampleRate;
    let loopFade = 1;
    if (i < fadeWindow) loopFade = i / fadeWindow;
    if (i > totalSamples - fadeWindow) loopFade = (totalSamples - i) / fadeWindow;

    sL[i] = (rainLP_L * 0.07 + dropL) * loopFade;
    sR[i] = (rainLP_R * 0.07 + dropR) * loopFade;
  }
  return { sL, sR };
}

// 5. Zen Garden: Peaceful Nature (Tibetan singing bowl resonance + bamboo water drip)
function genPeacefulNature() {
  const sL = new Float32Array(totalSamples);
  const sR = new Float32Array(totalSamples);
  const noise = makeNoiseGen(5544);

  // Resonant singing bowl frequencies (D note harmonics)
  const bowlFreqs = [146.83, 293.66, 440.0, 587.33];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let bowlL = 0;
    let bowlR = 0;
    bowlFreqs.forEach((f, idx) => {
      const beat = Math.sin(2 * Math.PI * 0.1 * t);
      const amp = (0.04 / (idx + 1)) * (0.8 + 0.2 * beat);
      bowlL += amp * Math.sin(2 * Math.PI * f * t);
      bowlR += amp * Math.sin(2 * Math.PI * (f * 1.001) * t);
    });

    // Gentle bamboo water trickles
    let dripL = 0;
    let dripR = 0;
    const dripTimes = [2.0, 4.8, 7.5];
    for (const dt of dripTimes) {
      const diff = t - dt;
      if (diff >= 0 && diff < 0.08) {
        const dEnv = Math.sin((diff / 0.08) * Math.PI);
        dripL += Math.sin(2 * Math.PI * 1800 * diff) * dEnv * 0.05;
        dripR += Math.sin(2 * Math.PI * 1820 * diff) * dEnv * 0.05;
      }
    }

    const softAir = noise() * 0.005;

    const fadeWindow = 0.5 * sampleRate;
    let loopFade = 1;
    if (i < fadeWindow) loopFade = i / fadeWindow;
    if (i > totalSamples - fadeWindow) loopFade = (totalSamples - i) / fadeWindow;

    sL[i] = (bowlL + dripL + softAir) * loopFade * 0.8;
    sR[i] = (bowlR + dripR + softAir) * loopFade * 0.8;
  }
  return { sL, sR };
}

// 6. Dreamy Night: Night Ambience (Crickets / cicadas + deep starry night pad)
function genNightAmbience() {
  const sL = new Float32Array(totalSamples);
  const sR = new Float32Array(totalSamples);
  const noise = makeNoiseGen(8822);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Deep starry night drone / pad
    const padL = 0.04 * Math.sin(2 * Math.PI * 110 * t) + 0.02 * Math.sin(2 * Math.PI * 220 * t);
    const padR = 0.04 * Math.sin(2 * Math.PI * 110.5 * t) + 0.02 * Math.sin(2 * Math.PI * 221 * t);

    // Rhythmic cricket chirping
    const cricketPulse = Math.sin(2 * Math.PI * 6 * t); // 6 chirps per sec
    let cricket = 0;
    if (cricketPulse > 0.4) {
      cricket = (Math.sin(2 * Math.PI * 4500 * t) + Math.sin(2 * Math.PI * 4800 * t)) * 0.015 * cricketPulse;
    }

    const fadeWindow = 0.5 * sampleRate;
    let loopFade = 1;
    if (i < fadeWindow) loopFade = i / fadeWindow;
    if (i > totalSamples - fadeWindow) loopFade = (totalSamples - i) / fadeWindow;

    sL[i] = (padL + cricket) * loopFade * 0.7;
    sR[i] = (padR + cricket * 0.8) * loopFade * 0.7;
  }
  return { sL, sR };
}

// 7. Spring Garden: Birds & Nature
function genSpringGarden() {
  const sL = new Float32Array(totalSamples);
  const sR = new Float32Array(totalSamples);
  const noise = makeNoiseGen(3377);

  const birdMelody = [
    { t: 0.8, f: 3000 }, { t: 1.1, f: 3400 }, { t: 1.4, f: 3800 },
    { t: 3.2, f: 2700 }, { t: 3.5, f: 3200 },
    { t: 5.8, f: 3300 }, { t: 6.2, f: 3900 },
    { t: 8.0, f: 3100 }, { t: 8.3, f: 3600 },
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const breezeMod = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.25 * t);
    const softBreeze = noise() * 0.03 * breezeMod;

    let birdL = 0;
    let birdR = 0;
    for (const b of birdMelody) {
      const dt = t - b.t;
      if (dt >= 0 && dt < 0.15) {
        const env = Math.sin((dt / 0.15) * Math.PI);
        const fMod = b.f + 300 * Math.sin((dt / 0.15) * Math.PI * 2);
        const tone = Math.sin(2 * Math.PI * fMod * dt) * env * 0.055;
        birdL += tone * 0.85;
        birdR += tone * 0.65;
      }
    }

    const fadeWindow = 0.5 * sampleRate;
    let loopFade = 1;
    if (i < fadeWindow) loopFade = i / fadeWindow;
    if (i > totalSamples - fadeWindow) loopFade = (totalSamples - i) / fadeWindow;

    sL[i] = (softBreeze + birdL) * loopFade * 0.8;
    sR[i] = (softBreeze + birdR) * loopFade * 0.8;
  }
  return { sL, sR };
}

const generators = {
  rich_town_sound: genRichTown,
  village_sound: genVillage,
  cloudy_sound: genGentleWind,
  rainy_sound: genRainfall,
  zen_garden_sound: genPeacefulNature,
  winter_sound: genGentleWind, // Reuses gentle wind texture with icy nuance
  dreamy_night_sound: genNightAmbience,
  spring_garden_sound: genSpringGarden,
};

for (const [name, fn] of Object.entries(generators)) {
  const { sL, sR } = fn();
  const buffer = createWavBuffer(2, sampleRate, sL, sR);
  const outPath = path.join(outDir, `${name}.wav`);
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated audio: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

console.log('Audio generation complete!');
