import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugPaneComponent } from './debug-pane.component';

describe('DebugPaneComponent', () => {
  let component: DebugPaneComponent;
  let fixture: ComponentFixture<DebugPaneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DebugPaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DebugPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
