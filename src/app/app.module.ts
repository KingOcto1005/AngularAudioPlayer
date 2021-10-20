import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { PlayerComponent } from './pages/player/player.component';
import {MatButtonModule} from '@angular/material/button';


import { AuthModule } from '@auth0/auth0-angular';


import { ProfileComponent } from './pages/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    MatButtonModule,


    AuthModule.forRoot({

      domain: 'dev-65ynyim5.us.auth0.com',

      clientId: '9QhgjldLgUWCAt1YnR9p00FyswKbBHGg'

    }),
  ],

  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
