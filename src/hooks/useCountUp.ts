/**
 * This used to count a number up from 0, which redrew the whole screen about 60 times a second.
 * That made pages like the tour page stutter on phones, so it now returns the final number straight away.
 */
export function useCountUp(target: number, _duration = 1200, _delay = 0) {
  return target;
}
