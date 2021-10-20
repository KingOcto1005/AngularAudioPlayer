export interface StreamState {
    //boolean that indicates if audio is playing
    playing: boolean;

    //string that shows current audio time in human-readable form
    readableCurrentTime: string;

    //human-readable duration of audio
    readableDuration: string;

    //duration of current audio (in milliseconds)
    duration: number | undefined;

    //current time of audio (in milliseconds)
    currentTime: number | undefined;

    //boolean to indicate if selected audio can be played
    canplay: boolean;

    //boolean to indcate if an error occured
    error: boolean;

}
