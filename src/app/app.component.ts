import {Component, OnInit} from '@angular/core';
import {Teams} from './teams';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('EnterLeave', [
      state('flyIn', style({transform: 'translateY(0)'})),
      transition(':enter', [
        style({transform: 'translateX(-100%)'}),
        animate('0.5s ease-out')
      ]),
      transition(':leave', [
        animate('0.5s ease-out', style({transform: 'translateX(-100%)'}))
      ])
    ]),
    trigger('select', [
      transition(':enter', [
        animate('0.4s'),
        style({backgroundColor: 'grey', transform: 'translateX(-40px)'}),
        animate('1s')
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  title = 'daily';

  persons: string[] = [];
  teams: Teams[] = [];

  storedTeams: Teams[] = [];
  STOREDTEAMKEY = 'storedTeams';
  newTeamName = '';

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

  ngOnInit(): void {
    const storedContent = localStorage.getItem(this.STOREDTEAMKEY);
    if (storedContent && storedContent.length > 0) {
      this.storedTeams = JSON.parse(storedContent);
      this.storedTeams.forEach(t => {
        this.teams.push(t);
      });
    }
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
    this.persons = [];
    const newPersons = event.target.value.split('\n');
    newPersons.forEach(p => {
      if (p.length > 0){
        this.persons.push(p);
      }
    });
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

  getBackgroundProgressImageForRandomElement(): string {
    if (this.timePerPerson <= 0 || this.timeRemaining <= 0) {
      return 'lightgreen';
    }
    const percentage = (((this.timePerPerson - this.timeRemaining) / this.timePerPerson) * 100) + '%';
    return 'linear-gradient(0.25turn, lightgreen, lightgreen ' + percentage + ', white ' + percentage + ', white)';
  }

  saveCurrentTeam(): void {
    if (!this.newTeamName || this.newTeamName.length === 0) {
      alert('Please enter a team name');
      return;
    }
    const alreadySavedTeam = this.storedTeams.filter(t => t.title === this.newTeamName)[0];
    if (alreadySavedTeam) {
      alreadySavedTeam.persons = this.persons;
    } else {
      const newTeam = new Teams();
      newTeam.title = this.newTeamName;
      newTeam.persons = this.persons;
      this.storedTeams.push(newTeam);
      this.teams.push(newTeam);
    }
    localStorage.setItem(this.STOREDTEAMKEY, JSON.stringify(this.storedTeams));
    alert('SAVED');
  }

}
