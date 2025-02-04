import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstLetterCapital'
})
export class FirstLetterCapitalPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string | null {
    console.log('name in pipe as stirn',value)
    if (typeof value !== 'string' || !value) {
      return value; 
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
