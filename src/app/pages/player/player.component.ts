import { Component, OnInit } from '@angular/core';
import { AudioService } from '../../services/audio.service';
import { CloudService } from '../../services/cloud.service';
import { StreamState } from '../../interfaces/stream-state';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  track: any;

  tracks: Array<any> = [];

  state!: StreamState;

  currentTrack: any = {};

  //checks if it is first track from playlist (used to enable/disable UI buttons)
  isFirstPlaying() {

    return this.currentTrack.index === 0;

  }

  //checks if it is last track of playlist (used to enable/disable UI buttons)
  isLastPlaying() {

    return this.currentTrack.index === this.tracks.length - 1;
    
  }


  constructor(
    public audioService: AudioService,

    public cloudService: CloudService,

    public auth: AuthService

  ) { 

    //get media files
    cloudService.getTracks().subscribe(tracks => {

      this.tracks = tracks;

    })

    //listen to stream state
    this.audioService.getState().subscribe(state => {

      this.state = state;

    });

  }

  ngOnInit(): void {
  }

  searchSong(value: string) {

    this.audioService.getTrackList(value).subscribe(track =>{

      this.track = track;
    })
  }

  //fires playStream() function from AudioService to start observables and audio playback
  playStream(url: string) {

    this.audioService.playStream(url).subscribe(events => {})
  }

  //when user clicks on media file, fires playStream() function with the 'url' of the 'track' chosen
  playTrack(track: any, index: number) {

    this.currentTrack = { index, track };

    this.audioService.stop();

    this.playStream(track.url);

    this.state.playing = true;

  }

  pause() {

    this.audioService.pause();

    this.state.playing = false;

  }

  play() {

    this.audioService.play();

    this.state.playing = true;

  }

  stop() {

    this.audioService.stop();

  }

  previous() {

    const index = this.currentTrack.index - 1;

    const track = this.tracks[index];

    this.playTrack(track, index);

  }

  next() {

    const index = this.currentTrack.index + 1;

    const track = this.tracks[index];

    this.playTrack(track, index);

  }

  onSliderChangeEnd(change: any) {

    this.audioService.seekTo(change.value);
    
  }

}
