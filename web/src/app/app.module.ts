import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'

import { AppComponent } from './app.component';
import { DateTimeComponent } from './date-time/date-time.component';
import { Date } from './date.pipe';
import { LocationComponent } from './location/location.component';

@NgModule({
  declarations: [
    AppComponent,
    DateTimeComponent,
    Date,
    LocationComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
