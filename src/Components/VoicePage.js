import React, { Component } from 'react';
import axios from 'axios'


const Twilio = window.Twilio

class VoicePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isOnVoiceCall: false,
        }

        this.outgoing = null;
        this.voiceDevice = null;
        this.activeConnection = null;
    }

    fetchVoiceToken = () => {
        return axios.get('http://dccc359b.ngrok.io/voice/capability/token')
            .then(token => {
                console.log(token.data, '//////////Voice -token ///////')
                return token.data
            })
            .catch(err => console.log(err, 'error'))
    }

    componentDidMount() {
        return this.onVoiceCall()
    }

    onVoiceCall = () => {
        return this.fetchVoiceToken().then((token) => {
            const Twilio = window.Twilio
            Twilio.Device.setup(token, { debug: true, allowIncomingWhileBusy: true, enableRingingState: true });


            //Set listners for device
            Twilio.Device.on("ready", (device) => {
                console.log("device is successfully setup and !!!ready!!! now you are able to make a call")

                this.voiceDevice = device

                const number = '+919671581175';
                const myTwilioNumber = '+1 201 800 6022';

                console.log('Calling from' + myTwilioNumber, 'to' + number + '...');


                Twilio.Device.connect((connection) => {
                    this.activeConnection = connection
                    console.log(this.activeConnection, 'activeConnection')

                    // or handle an incoming connection event
                    connection.on('incoming', (conn) => {
                        console.log(conn, 'connection accept')
                        conn.accept();
                    });

                    connection.on('accept', (conn) => {
                        console.log(conn, 'conn')
                    })

                    connection.on('cancel', (conn) => {
                        console.log('cancel', conn)
                        conn.cancel()
                    })
                    connection.on('error', (err) => console.log(err, 'err'))
                    connection.on('mute', (conn) => console.log('mute: ', conn))
                    connection.on('reject', (conn) => {
                        console.log('reject', conn)
                        conn.reject()
                    })

                    connection.on('ringing', (hasEarlyMedia) => {
                        console.log(hasEarlyMedia, 'hasEarlyMedia')
                    });

                    connection.on('status', (conn) => {
                        console.log("connection status=========", conn)
                    });

                    connection.on('hangup', function (err) {
                        console.log(err, 'hanghup')
                    })

                    connection.on('disconnect', (conn) => {
                        console.log("the call has ended");
                        conn.disconnect()
                    });
                });
            })

            Twilio.Device.on("offline", (device) => {
                console.log("device connection fails", device)
            })

            Twilio.Device.on("error", (device) => {
                console.log("error", device)
            })

            Twilio.Device.status((status) => {
                console.log(status, 'device Status')
            })

            Twilio.Device.disconnect((connection) => {
                console.log('disconnect', connection);
            });

            Twilio.Device.error((error) => {
                console.log('Error: ' + error.message);
            });
            if (this.voiceDevice) {
                this.setState({
                    isOnVoiceCall: true
                })
            }
        })
    }


    onHangup = () => {
        console.log(this.voiceDevice, 'this.voiceDevice')
        const Twilio = window.Twilio

        return <div>
            {Twilio.Device.disconnectAll()}
            {this.updateState()}
        </div>
    }

    updateState = () => {
        return this.setState({
            isOnVoiceCall: false
        })
    }

    showVoiceCallScreen = () => {
        return (
            <div>
                <h2>You are on call</h2>
                <button onClick={this.onHangup}>Hangup call</button>
                <button onClick={this.showActiveConnection}>Active Connection</button>
            </div>
        )
    }

    showActiveConnection = () => {
        console.log(this.voiceDevice.connections, 'this.voiceDevice')

        if (!this.voiceDevice) return null
        return this.voiceDevice.activeConnection()
    }

    connectVoiceCall = () => {
        const Twilio = window.Twilio

        const number = '+919671581175';
        const myTwilioNumber = '+1 201 800 6022';

        if (!this.voiceDevice) return null
        return Twilio.Device.connect(
            {
                From: myTwilioNumber,
                To: number
            }
        );
    }

    startVoiceCall = () => {
        if (this.voiceDevice) {


            this.connectVoiceCall()
            return this.setState({
                isOnVoiceCall: true
            })
        }
    }


    render() {
        const { isOnVoiceCall } = this.state

        return (
            <div>
                {isOnVoiceCall ? this.showVoiceCallScreen()
                    :
                    <button onClick={this.startVoiceCall}
                        ref={(outgoing) => this.outgoing = outgoing}>
                        Voice Call
                    </button>
                }

            </div>
        )
    }
}

export default VoicePage