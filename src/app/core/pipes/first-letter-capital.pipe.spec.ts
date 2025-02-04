import { FirstLetterCapitalPipe } from './first-letter-capital.pipe';

describe('FirstLetterCapitalPipe', () => {
  it('create an instance', () => {
    const pipe = new FirstLetterCapitalPipe();
    expect(pipe).toBeTruthy();
  });
});
