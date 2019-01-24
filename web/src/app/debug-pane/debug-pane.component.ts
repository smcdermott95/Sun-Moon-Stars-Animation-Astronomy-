import { Component, OnInit } from '@angular/core';
import { DateTimeService } from './../date-time.service';
import { LocationService } from './../location.service';

@Component({
  selector: 'app-debug-pane',
  templateUrl: './debug-pane.component.html',
  styleUrls: ['./debug-pane.component.css']
})
export class DebugPaneComponent implements OnInit {

  constructor(private dateTimeService: DateTimeService, private locationService: LocationService) { }

  ngOnInit() {
  }

}