export const throttle = (fn: (...args: any[]) => void, delayMs: number) => {
  let throttled = false;

  return (...args: any[]) => {
    if (!throttled) {
      throttled = true;

      fn.apply(this, args);

      setTimeout(() => {
        throttled = false;
      }, delayMs);
    }
  };
};
