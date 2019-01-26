import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'

import { AppComponent } from './app.component';
import { DateTimeComponent } from './date-time/date-time.component';
import { Date } from './date.pipe';
import { LocationComponent } from './location/location.component';
import { CanvasComponent } from './canvas/canvas.component';
import { DebugPaneComponent } from './debug-pane/debug-pane.component';
import { MapComponent } from './map/map.component';

@NgModule({
  declarations: [
    AppComponent,
    DateTimeComponent,
    Date,
    LocationComponent,
    CanvasComponent,
    DebugPaneComponent,
    MapComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
