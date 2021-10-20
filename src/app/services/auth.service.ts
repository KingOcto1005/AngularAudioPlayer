import { Injectable } from '@angular/core';

//npm install --save auth0-js (CLI cmd) (dont use "@types/auth0-js" !!!!!!)
import * as auth0 from 'auth0-js';

//import * as auth0 from '@auth0/auth0-angular';



import { environment } from '../../environments/environment';



import{

  Observable,
  BehaviorSubject,
  bindNodeCallback, 
  of
} from 'rxjs';

import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //instance of auth0-WebAuth that is used for authentication
  auth0 = new auth0.WebAuth({

    clientID: environment.auth0.clientID,

    domain: environment.auth0.domain,

    responseType: 'token id_token',

    scope: 'openid profile email',

    redirectUri: 'http://localhost:4200'

  });

  //'localStorage' keys (for storing authentication and user profile data) that track whether or not to renew token
  private _authFlag = 'isLoggedIn';
  
  private _userProfileFlag = 'userProfile';


  //'Observable' that stores authentication data & emits access token
  token$!: Observable<string>;

  //'BehaviorSubject' that creates stream for user profile data
  userProfile$ = new BehaviorSubject<any>(null);


  //Authentication Navigation
  onAuthSuccessUrl = 'http://localhost:4200';

  onAuthFailureUrl = '/';

  logoutUrl = environment.auth0.logoutUrl;

  /*parseHash$ = 
  After authentication occurs, you can use the parseHash method to parse a URL hash fragment 
  when the user is redirected back to your application in order to extract 
  the result of an Auth0 authentication response*/

  //Create observable of Auth0, then parseHash() function to gather 'auth' results
  parseHash$ = bindNodeCallback(this.auth0.parseHash.bind(this.auth0));

  //Create observable of Auth0 checkSession() function to verify authorization server session and renew tokens
  checkSession$ = bindNodeCallback(this.auth0.checkSession.bind(this.auth0));
  


  constructor(private router: Router) { 

    //'get' user info from 'localStorage'
    const userProfile = localStorage.getItem(this._userProfileFlag);

    //checks if there is any user info stored
    if (userProfile) {

      //if there IS user info stored, emit it via the 'userProfile$' BehaviorSubject
      this.userProfile$.next(JSON.parse(userProfile));

    }
  }

  //authorize user
  login = () => {

    this.auth0.authorize();

  } 

  /*
  uses the parseHash$ 'Observable' to parse the auth result, 
  then sets authentication state using 'this._setAuth()', takes 'authResult' from parsed Auth data, and initializes 'token$', 
  then redirects to 'onAuthSuccessUrl' 
  */
  handleLoginCallback = () => {

    if (window.location.hash && !this.authenticated) {

      //parse authResult from Observable
      this.parseHash$().subscribe({

        next: authResult => {
          //takes authResult from parsed Auth data sets authentication state
          this._setAuth(authResult);

          window.location.hash = '';

          //redirect to 'onAuthSuccessUrl'
          this.router.navigate([this.onAuthSuccessUrl]);

        },

        error: err => this._handleError(err)

      });

    }

  };

  //Save authentication data and update login status subject
  private _setAuth = (authResult: any) => {

    //take authResult from parsed Auth data and initialize 'token$' Observable
    this.token$ = of(authResult.accessToken);


    const userProfile = authResult.idTokenPayload;

    //Emit value for user data subject
    this.userProfile$.next(userProfile);

    //save 'userProfile' in 'localStorage'
    localStorage.setItem(this._userProfileFlag, JSON.stringify(userProfile));

    //Set flag in local storage stating that this app is logged in
    localStorage.setItem(this._authFlag, JSON.stringify(true));

  }

    //checks if user is authenticated or not using 'localStorage' flag
    get authenticated(): boolean {

      return JSON.parse(localStorage.getItem(this._authFlag) || '{}');
  
    }

  renewAuth = () => {

    //checks if user is authenticated or not
    if (this.authenticated) {

      //checkSession to see if 'authResult' is valid
      this.checkSession$({}).subscribe({

        next: authResult => this._setAuth(authResult),

        error: err => {

          localStorage.removeItem(this._authFlag);

          localStorage.removeItem(this._userProfileFlag);

          this.router.navigate([this.onAuthFailureUrl]);

        }

      });

    }

  }

    //logout
    logout = () => {

      //Set authentication status flag in local storage to false
      localStorage.setItem(this._authFlag, JSON.stringify(false));
  
      //remove the userProfile data
      localStorage.removeItem(this._userProfileFlag);
  
      //refresh, then redirect to homepage
      this.auth0.logout({
  
        returnTo: this.logoutUrl,
  
        clientID: environment.auth0.clientID
  
      });
      
    };

  
  //Utility functions
  private _handleError = (err: { error_description: any; }) => {

    if (err.error_description) {

      console.error(`Error: ${err.error_description}`);

    } else {

      console.error(`Error: ${JSON.stringify(err)}`);

    }

  };

}


