export interface Track {

    trackUrl: string;

    trackName: string;

    trackArtist: string;
}

export interface TrackList {

    resultCount: number;

    results: Track[];

}
