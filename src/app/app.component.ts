import {Component} from '@angular/core';
import {Teams} from './teams';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'daily';

  persons: string[] = [];
  teams: Teams[] = [];
  timePerPerson = 120;
  timeRemaining = -1;

  currentRandom = -1;
  alreadyShownElements: number[] = [];
  iteration = -1;
  iterationAmount = -1;
  interval;
  intervalTimeToSpeak;
  mutex = false;

  constructor() {
    this.getValues();
  }

  private getValues(): void {
    const request = new XMLHttpRequest();
    request.open('GET', './assets/names.json', false);
    request.send(null);
    if (request.status === 200 || request.status === 0) {
      const data = JSON.parse(request.responseText);
      this.teams = data;
      this.persons = this.teams[0].persons;
    }
  }

  getPersonList(): string {
    let v = '';
    this.persons.forEach(p => {
      if (v === '') {
        v = p;
      } else {
        v = v + '\r\n' + p;
      }
    });
    return v;
  }

  changePersons(event): void {
    this.persons = event.target.value.split('\n');
  }

  startRandom(): void {
    if (this.mutex){
      return;
    }
    this.timeRemaining = -1;
    if (this.persons.length === this.alreadyShownElements.length) {
      this.clearRandom();
    }
    this.mutex = true;
    this.iterationAmount = Math.abs((Math.random() * 20) + 30);
    this.iteration = -1;
    this.startTimer();
  }

  startTimer(): void {
    this.interval = setInterval(() => {
      do {
        this.currentRandom++;
        if (this.currentRandom >= this.persons.length) {
          this.currentRandom = 0;
        }
      } while (this.alreadyShownElements.includes(this.currentRandom));
      this.iteration++;
      if (this.iteration > this.iterationAmount && !this.alreadyShownElements.includes(this.currentRandom)) {
        this.pauseTimer();
        this.startRestTime();
        this.alreadyShownElements.push(this.currentRandom);
      }
    }, 80);
  }

  startRestTime(): void {
    this.timeRemaining = this.timePerPerson;
    this.intervalTimeToSpeak = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining < 0) {
        clearInterval(this.intervalTimeToSpeak);
      }
    }, 1000);
  }

  pauseTimer(): void {
    this.mutex = false;
    clearInterval(this.interval);
  }

  clearRandom(): void {
    this.timeRemaining = -1;
    this.currentRandom = -1;
    this.alreadyShownElements = [];
  }

  changeTeam(teamname: string): void {
    this.clearRandom();
    this.persons = this.teams.filter(t => t.title === teamname)[0].persons;
  }
}
