class Layers {
  mask: any;

  constructor() {
    this.mask = 1 | 0;
  }

  set(channel: any) {
    this.mask = (1 << channel) | 0;
  }

  enable(channel: any) {
    this.mask |= (1 << channel) | 0;
  }

  enableAll() {
    this.mask = 0xffffffff | 0;
  }

  toggle(channel: any) {
    this.mask ^= (1 << channel) | 0;
  }

  disable(channel: any) {
    this.mask &= ~((1 << channel) | 0);
  }

  disableAll() {
    this.mask = 0;
  }

  test(layers: Layers) {
    return (this.mask & layers.mask) !== 0;
  }
}

export { Layers };
