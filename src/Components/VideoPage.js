import React from 'react'
import axios from 'axios'
// import Video from 'twilio-video'

const Twilio = window.Twilio


class VideoPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isVideoEnabled: false
        };
        this.localTracks = null;
        this.participantsTracks = null;
        this.remoteParticipants = null;
    }

    fetchVideoToken = () => {
        const Email = localStorage.getItem('email')

        return axios.get('http://dccc359b.ngrok.io/video/capability/token?identity=' + Email)
            .then(token => {
                console.log(token.data, '==========video-token====================')
                return token.data
            })
            .catch(err => console.log(err, 'error'))
    }

    componentDidMount() {
        this.fetchVideoToken().then(token => localStorage.setItem('VideoToken', token))
    }

    initialVideo = () => {
        const Token = localStorage.getItem('VideoToken')

        if (Token) {
            console.log(Token, 'Video-Token')

            if (!Twilio && this.videoRoom) return;

            Twilio.Video.connect(Token, { name: 'my-room-name' }).then(room => {

                this.videoRoom = room

                console.log(`Successfully joined a Room:${room.name + room}`);

                // Log your Client's LocalParticipant in the Room
                const localParticipant = room.localParticipant;
                console.log(`Connected to the Room as LocalParticipant "${localParticipant.identity}"`);
                let local = this.localTracks
                attachParticipantTracks(localParticipant, local);


                // Attach the Participant's Media to a <div> element.
                room.on('participantConnected', participant => {
                    console.log(`Participant "${participant.identity}" connected`);

                    if (participant.identity !== localParticipant.identity) {

                        const RemoteParticipant = participant;
                        console.log(RemoteParticipant, 'RemoteParticipantRemoteParticipantRemoteParticipant')
                        let remote = this.participantsTracks
                        attachParticipantTracks(RemoteParticipant, remote);

                        // console.log(RemoteParticipant, '-------------------------------P')
                        // participant.tracks.forEach(track => {
                        //     let remote = this.participantsTracks 
                        //      attachParticipantTracks(track , remote);
                        // });
                    }

                    participant.on('trackAdded', track => {

                        const RemoteParticipant = participant;
                        let remote = this.participantsTracks
                        attachParticipantTracks(RemoteParticipant, remote);
                        console.log(track, 'trackAdded')
                    });
                });


                // Log any Participants already connected to the Room

                room.participants.forEach(participant => {
                    console.log(`Participant "${participant.identity}" is connected to the Room`);
                });

                // Log new Participants as they connect to the Room
                room.once('participantConnected', participant => {
                    console.log(`Participant "${participant.identity}" has connected to the Room`);
                });

                // Log Participants as they disconnect from the Room
                room.once('participantDisconnected', participant => {
                    console.log(`Participant "${participant.identity}" has disconnected from the Room`);
                    detachParticipantTracks(participant);

                });

                //When Participants connect to or disconnect from a Room that you're connected to, you'll be notified via Participant Connection events:

                room.on('participantConnected', participant => {
                    console.log(`Participant connected: ${participant.identity}`);
                });

                room.on('participantDisconnected', participant => {
                    console.log(`Participant disconnected: ${participant.identity}`);

                    detachParticipantTracks(participant);
                });

                room.on('disconnected', room => {
                    // Detach the local media elements
                    room.localParticipant.tracks.forEach(track => {
                        const attachedElements = track.detach();
                        attachedElements.forEach(element => element.remove());
                    });
                });



                function attachTracks(tracks, container) {
                    tracks.forEach(function (track) {
                        container.appendChild(track.attach());
                    });
                }

                // Attach the Participant's Tracks to the DOM.
                function attachParticipantTracks(participant, container) {
                    var tracks = Array.from(participant.tracks.values());
                    attachTracks(tracks, container);
                }

                // Detach the Tracks from the DOM.
                function detachTracks(tracks) {
                    tracks.forEach(function (track) {
                        track.detach().forEach(function (detachedElement) {
                            detachedElement.remove();
                        });
                    });
                }
                // Detach the Participant's Tracks from the DOM.
                function detachParticipantTracks(participant) {
                    var tracks = Array.from(participant.tracks.values());
                    detachTracks(tracks);
                }

                return this.setState({ isVideoEnabled: true })
            }
            )
        }
    }

    onDisconnect = () => {
        if (this.videoRoom)
            return this.videoRoom.disconnect() ? this.setState({ isVideoEnabled: false }) : this.setState({
                isVideoEnabled: true
            })
    }

    onDisconnectScreen = () => {
        this.onDisconnect()
        return this.setState({
            isVideoEnabled: false
        })
    }

    showVideo = () => {
        return (
            <div>
                <button onClick={this.onDisconnect}>disconnect call</button>
            </div>
        )
    }


    render() {
        const { isVideoEnabled } = this.state

        return (
            <div>
                <div style={{ width: 300, float: 'left', border: 'blue', height: 300 }} ref={(localtracks) => this.localTracks = localtracks}> </div>
                {isVideoEnabled ? this.showVideo() : <button onClick={this.initialVideo}> Video Call </button>}
                {isVideoEnabled && this.videoRoom ? (
                    <div>
                        <h2> Remote Participants:</h2>
                        <div style={{ width: 200, backgroundColor: 'grey', border: 'red', height: 300, float: 'right' }}
                            ref={(participants) => this.participantsTracks = participants}>
                        </div>
                        <div ref={remote => this.remoteParticipants = remote} style={{ width: 400, height: 500 }}></div>
                    </div>
                )
                    : null}
            </div>
        )
    }
}

export default VideoPage