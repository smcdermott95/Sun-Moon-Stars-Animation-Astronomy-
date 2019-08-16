import { Component, OnInit } from '@angular/core';
import { AnimatorService } from './../animator.service';
import { AppService } from './../app.service';

@Component({
  selector: 'app-animation',
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.css']
})
export class AnimationComponent implements OnInit {
  private buttonText: string;
  private isStart: boolean = true;

  constructor(private animationService: AnimatorService, private appService: AppService) { 
    this.setButtonText();
  }

  ngOnInit() {
  }

  private playButtonPressed()
  {
    this.appService.playButtonPressed(this.isStart);
    this.isStart = !this.isStart;
    this.setButtonText();
  }

  private setButtonText()
  {
    this.buttonText = this.isStart ? "Play" : "Stop";
  }

}
