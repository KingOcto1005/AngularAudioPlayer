import { Injectable } from '@angular/core';
//event emitter/subscription services
import { Observable, BehaviorSubject, Subject } from 'rxjs';
//rxjs operator
import { takeUntil } from 'rxjs/operators';
//???????
import * as moment from 'moment';

//"StreamState" interface
import { StreamState } from '../interfaces/stream-state';
import { HttpClient } from '@angular/common/http';

import { TrackList, Track } from '../interfaces/track'

import { publishReplay, refCount } from 'rxjs/operators';



@Injectable({
  providedIn: 'root',
})
export class AudioService {

  //completes subscription function
  private stop$ = new Subject();

  //HTMLAudioElement that emits media events to listen to
  private audioObj = new Audio();

  itunesUrl = 'https://itunes.apple.com/search';


  trackList = new Observable<TrackList[]>();

  audioEvents = [
    'ended',

    'error',

    'play',

    'playing',

    'pause',

    'timeupdate',

    'canplay',

    'loadmetadata',

    'loadstart',
  ];

  private streamObservable(url: string) {

    return new Observable((observer) => {

      //Play Audio
      this.audioObj.src = url;

      this.audioObj.load();

      this.audioObj.play();

      const handler = (event: Event) => {

        //notify app of event
        observer.next(event);

      };

      this.addEvents(this.audioObj, this.audioEvents, handler);

      return () => {

        //Stop Playing
        this.audioObj.pause();

        this.audioObj.currentTime = 0;

        //remove event listeners
        this.removeEvents(this.audioObj, this.audioEvents, handler);

        //reset state
        this.resetState();

      };

    });

  }

  private addEvents(obj: any, events: any, handler: any) {

    events.forEach((event: Event) => {

      obj.addEventListener(event, handler);

    });

  }

  private removeEvents(obj: any, events: any, handler: any) {

    events.forEach((event: Event) => {

      obj.removeEventListener(event, handler);

    });

  }

  //create observable to subscribe to, which contains media events to listen to
  playStream(url: string) {

    return this.streamObservable(url).pipe(takeUntil(this.stop$));

  }

  constructor(private httpClient: HttpClient) { }

  getTrackList(queryString: string): Observable<TrackList[]> {

    if (!this.trackList) {

      this.trackList = this.httpClient.get<TrackList[]>(`${this.itunesUrl}?term=${queryString}`).pipe(publishReplay(1),
      refCount()
      );
    }
    return this.trackList;
    
  }



  //PLAYBACK CONTROLS SECTION

  //play
  play() {
    this.audioObj.play();
    this.state.playing = true;
  }

  //pause
  pause() {
    this.audioObj.pause();
    this.state.playing = false;
  }

  //stop
  stop() {
    this.stop$.next();
  }

  //go to specific point in track
  seekTo(seconds: number) {
    this.audioObj.currentTime = seconds;
  }

  //format time to make it human-readable
  formatTime(time: number, format: string = 'HH:mm:ss') {

    const momentTime = time * 1000;

    return moment.utc(momentTime).format(format);
  }

  //"state" MANAGEMENT SECTION

  //default value / initial "state"
  private state: StreamState = {
    playing: false,

    readableCurrentTime: '',

    readableDuration: '',

    duration: undefined,

    currentTime: undefined,

    canplay: false,

    error: false,
  };

  //↓↓↓↓ EMITTING "state" CHANGES ↓↓↓↓

  //create BehaviorSubject named "stateChange"
  private stateChange: BehaviorSubject<StreamState> = new BehaviorSubject(

    this.state

  );

  //update "state" to react to event
  private updateStateEvents(event: Event): void {

    //determine which reactions take place based on "state"
    switch (event.type) {

      case 'canplay':
        this.state.duration = this.audioObj.duration;

        this.state.readableDuration = this.formatTime(this.state.duration);

        this.state.canplay = true;

        break;

      case 'playing':
        this.state.playing = true;

        break;

      case 'pause':
        this.state.playing = false;

        break;

      case 'timeupdate':
        this.state.currentTime = this.audioObj.currentTime;

        this.state.readableCurrentTime = this.formatTime(
          this.state.currentTime
        );

        this.state.currentTime;

        break;

      case 'error':
        this.resetState();

        this.state.error = true;

        break;
    }

    //notify app of latest state
    this.stateChange.next(this.state);
  }

  //function to reset the "state"
  private resetState() {

    this.state = {

      playing: false,

      readableCurrentTime: '',

      readableDuration: '',

      duration: undefined,

      currentTime: undefined,

      canplay: false,

      error: false

    }
  }


  //function to "share" the 'stateChange' subject to the rest of the application as an Observable (to conceal the rest of the code that shouldn't be made available outside the service)
  getState() {

    return this.stateChange.asObservable(); 

  }

  clearCache() {

    this.trackList = null as any;
    
  }
}
