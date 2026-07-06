import type { ThemeSound } from '../themes/types'

/**
 * Procedural Web Audio engine — zero asset files.
 * One shared AudioContext, resumed on the first user gesture.
 * Nothing loops (ADHD-friendly): every sound is a short, responsive event.
 */
class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private volume = 0.75

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      this.ctx = new Ctor()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.volume
      this.master.connect(this.ctx.destination)
    }
    return this.ctx
  }

  /** Call inside a pointer/click handler (iOS unlock). Safe to call repeatedly. */
  unlock() {
    const ctx = this.ensure()
    if (ctx && ctx.state === 'suspended') void ctx.resume()
  }

  setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v))
    if (this.master) this.master.gain.value = this.volume
  }

  private voice(
    freq: number,
    opts: {
      type?: OscillatorType
      dur?: number
      gain?: number
      filterHz?: number
      delay?: number
      detune?: number
    } = {},
  ) {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const { type = 'sine', dur = 0.18, gain = 0.25, filterHz, delay = 0, detune = 0 } = opts
    const t0 = ctx.currentTime + delay

    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    if (detune) osc.detune.value = detune

    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)

    let node: AudioNode = osc
    if (filterHz && filterHz !== Infinity) {
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = filterHz
      osc.connect(filter)
      node = filter
    }
    node.connect(g)
    g.connect(this.master)

    osc.start(t0)
    osc.stop(t0 + dur + 0.05)
  }

  /** Neutral UI tick. */
  tick() {
    this.voice(660, { type: 'square', dur: 0.05, gain: 0.12, filterHz: 2200 })
  }

  /** A note from a theme's scale by degree (wraps + octave-jumps beyond range). */
  note(sound: ThemeSound, degree: number) {
    const scale = sound.scale
    const octave = Math.floor(degree / scale.length)
    const freq = scale[((degree % scale.length) + scale.length) % scale.length] * Math.pow(2, octave)
    this.voice(freq, { type: sound.waveform, dur: 0.22, gain: 0.22, filterHz: sound.filterHz })
  }

  /** Rising two-note confirm when a puzzle element locks in. */
  success(sound: ThemeSound) {
    this.note(sound, 2)
    this.voice(sound.scale[4], {
      type: sound.waveform,
      dur: 0.3,
      gain: 0.24,
      filterHz: sound.filterHz,
      delay: 0.08,
    })
  }

  /** Soft, non-punishing "not yet" cue. */
  error() {
    this.voice(180, { type: 'sine', dur: 0.16, gain: 0.16, filterHz: 500 })
    this.voice(150, { type: 'sine', dur: 0.2, gain: 0.14, filterHz: 500, delay: 0.06 })
  }

  /** Victory arpeggio up the theme scale. */
  victoryStinger(sound: ThemeSound) {
    const degrees = [0, 2, 4, 5, 7]
    degrees.forEach((d, i) => {
      const octave = Math.floor(d / sound.scale.length)
      const freq = sound.scale[d % sound.scale.length] * Math.pow(2, octave)
      this.voice(freq, {
        type: sound.waveform,
        dur: 0.35,
        gain: 0.22,
        filterHz: sound.filterHz,
        delay: i * 0.11,
      })
    })
  }
}

export const audio = new AudioEngine()
