import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'date1'})
export class Date implements PipeTransform {
  transform(d: number): string {
    return d.toString().padStart(2, "0");
  }
}