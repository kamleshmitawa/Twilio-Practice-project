import React, { Component } from 'react'
import uuid from 'uuid/v4';

import axios from 'axios';



class ChatPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            email: '',
            isLoggedIn: true,
            messageList: [],
            isSubmitted: false,
            inputMessage: '',
            showMessageInput: false,
            inputChannelName: '',
            defaultChannel: "Genaral Channel",
            PublicChannelList: [],
            UserChannelList: [],
            SubscribedChannelList: [],
            isVideoEnabled: false,
            isShowChatScreen: false
        };
        this.channel = null;
        this.chatClient = null;
        this.videoRoom = null;
    }


    componentDidMount() {
        const chatUserId = localStorage.getItem('chatUserId')

        if (chatUserId) return this.setState({ isLoggedIn: true }, () => this.initialChat())

        let window = window
    }

    onChangeHandler = (e) => {
        const { name, value } = e.target

        this.setState({
            [name]: value
        })
    }

    onFormSubmit = (event) => {
        const { username, email, isSubmitted } = this.state

        if (!isSubmitted && username) {
            return this.setState({
                username: username,
                isSubmitted: true
            }, () => {
                localStorage.setItem('username', username);
                localStorage.setItem('email', email);

                const chatUserId = uuid();
                localStorage.setItem('chatUserId', chatUserId);

                this.initialChat()
            })
        }
        event.preventDefault();
    }


    initialChat = () => {
        this.fetchChatToken().then(token => {

            const Twilio = window.Twilio

            if (!Twilio && this.chatClient) return;

            Twilio.Chat.Client.create(token).then(client => {

                console.log(client, 'clientclientclientclient')
                //chat already initiated
                if (this.chatClient) return;
                this.chatClient = client;



                client.on('channelJoined', channel => {

                    console.log(channel.members, 'channelchannel')

                    if (this.channel && this.channel.uniqueName === channel.uniqueName) {
                        this.channel.removeAllListeners();
                    }

                    channel.on('messageAdded', message => {
                        const { messageList } = this.state;

                        this.setState({ messageList: [...messageList, message] })
                    })

                    channel.on('memberJoined', member => {
                        console.log('member Joined', member.identity)
                    })

                    channel.on('memberLeft', member => {
                        console.log('member Left', member.identity)
                    })

                    channel.on('memberInfoAdded', member => {
                        console.log('member info updated', member.identity)
                    })

                    channel.on('typingStarted', member => {
                        console.log('typing started', member.identity)
                    })
                    channel.on('tytpingEnded', member => {
                        console.log('member Left', member.identity)
                    })
                    channel.invite('elmo').then(function () {
                        console.log('Your friend has been invited!');
                    });


                    return channel.getMessages().then(messageObject => {
                        this.setState({
                            messageList: messageObject.items
                        })
                    })

                })


                client.getPublicChannelDescriptors().then((paginator) => {
                    for (let i = 0; i < paginator.items.length; i++) {
                        const channel = paginator.items[i];
                        const { PublicChannelList } = this.state

                        this.setState({
                            PublicChannelList: [...PublicChannelList, channel.friendlyName]
                        })

                        console.log('Public Channels: ' + channel.friendlyName);
                    }
                });

                client.getSubscribedChannels().then((paginator) => {
                    for (let i = 0; i < paginator.items.length; i++) {
                        const channel = paginator.items[i];

                        const { SubscribedChannelList } = this.state

                        this.setState({
                            SubscribedChannelList: [...SubscribedChannelList, channel.friendlyName]
                        })

                        console.log('Subscribed Channel: ' + channel.friendlyName);
                    }
                });

                client.on('channelAdded', channel => {
                    console.log('Channel added: ' + channel.friendlyName);
                })

                client.on('channelRemoved', channel => {
                    console.log('channel Removed', channel.friendlyName)
                })

                client.on('channelUpdated', channel => {
                    console.log('channel Updated', channel.friendlyName)
                })

                // Listen for new invitations to your channel
                client.on('channelInvited', channel => {
                    console.log('Invited to channel ' + channel.friendlyName)
                    // Join the channel that you were invited to
                    channel.join();
                });


                client.on('tokenExpired', this.HandleRefereshToken)

                this.getChatRoom()

                    .then(() => this.setState({
                        isShowChatScreen: true
                    }, () => this.showChatScreen()))
            })
        })
    }

    getChatRoom = () => {

        console.log(this.chatClient, ' -------chatClient ----------------')

        this.chatClient.getUserChannelDescriptors().then((paginator) => {
            for (let i = 0; i < paginator.items.length; i++) {
                var channel = paginator.items[i];

                const { UserChannelList } = this.state
                this.setState({
                    UserChannelList: [...UserChannelList, channel.friendlyName]
                })

                console.log('================Channel List:===== ', channel.friendlyName);
            }
        });

        const channelUniqueName = localStorage.getItem('channelUniqueName')
        const previousChannel = localStorage.getItem('previousChannel')

        const channelInputName = this.state.inputChannelName

        const { defaultChannel } = this.state

        const createChannel = () => {
            const channelName = channelInputName
                ? channelInputName
                : (channelUniqueName
                    ? channelUniqueName
                    : (previousChannel
                        ? previousChannel
                        : defaultChannel))

            return this.chatClient
                .createChannel({
                    friendlyName: channelName,
                    isPrivate: false,
                    uniqueName: channelName
                }).then(channel => {
                    localStorage.setItem('channelUniqueName', channelName);

                    channel.join();
                    return channel
                })
        }

        return channelUniqueName !== channelInputName
            ?
            createChannel().then(channel => {
                this.channel = channel
            }).catch(err => {
                const { defaultChannel } = this.state

                console.log(defaultChannel, 'defaultChanneldefaultChanneldefaultChannel')

                const channelUniqueName = localStorage.getItem('channelUniqueName')
                const getChannelByName = channelUniqueName ? channelUniqueName : defaultChannel

                this.chatClient.getChannelByUniqueName(getChannelByName)
                    .then(channel => {

                        channel.join();
                        return this.channel = channel
                    })
                    .catch(err => console.log(err, 'error in getting channel'))
            })
            :
            null
    }

    fetchChatToken = () => {
        const chatUserId = localStorage.getItem('chatUserId');

        if (!chatUserId) throw new Error('Cannot find Chat Token');

        return axios.get('http://858732f7.ngrok.io/Chat-Access-token?identity=' + chatUserId)
            .then(({ data }) => {
                console.log("token   == ", data)
                return data
            })
            .catch(err => console.log(err, 'err'))
    };



    fetchVideoToken = () => {
        const chatUserId = localStorage.getItem('chatUserId');

        if (!chatUserId) throw new Error('Cannot find Video Token');

        return axios.get('http://b8970f31.ngrok.io/Video-Access-Token?identity=' + chatUserId)
            .then(token => {
                console.log(token.data, '==========video-token====================')
                return token.data
            })
            .catch(err => console.log(err, 'error'))
    }


    initialVideo = () => {
        this.fetchVideoToken().then(token => {

            localStorage.setItem('VideoToken', token)
            console.log(token, 'Video-Token')

            const Twilio = window.Twilio

            console.log(Twilio.Video, 'Twilio-Video')
            if (!Twilio && this.videoRoom) return;


            //   Twilio.Video.createLocalTracks({
            //         audio: true,
            //         video: { width: 640 }
            //       }).then(localTracks => {
            //         return Twilio.Video.connect(token, {
            //           name: 'my-room-name',
            //           tracks: localTracks
            //         });
            //       }).then(room => {


            Twilio.Video.connect(token,{ name :'my-room-name'}).then(room => {

                this.videoRoom = room

                //    Twilio.Video.createLocalVideoTrack().then(track => {
                //         const localMediaContainer = document.getElementById('local-media');
                //         localMediaContainer.appendChild(track.attach());
                //       });


                room.on('disconnected', room => {
                    // Detach the local media elements
                    room.localParticipant.tracks.forEach(track => {
                        const attachedElements = track.detach();
                        attachedElements.forEach(element => element.remove());
                    });
                });


                console.log(room, 'Room')
                console.log(`Successfully joined a Room:${room.name + room}`);

                // Log your Client's LocalParticipant in the Room
                const localParticipant = room.localParticipant;
                console.log(`Connected to the Room as LocalParticipant "${localParticipant.identity}"`);
                console.log(localParticipant, 'localParticipant')

                // Attach the Participant's Media to a <div> element.
                room.on('participantConnected', participant => {
                    console.log(`Participant "${participant.identity}" connected`);

                    participant.tracks.forEach(track => {
                        console.log(track, 'track')
                        document.getElementById('remote-media-div').appendChild(track.attach());
                    });

                    participant.on('trackAdded', track => {
                        console.log(track, 'trackAdded')
                        document.getElementById('remote-media-div').appendChild(track.attach());
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
                });



                room.on('disconnected', room => {
                    // Detach the local media elements
                    room.localParticipant.tracks.forEach(track => {
                        const attachedElements = track.detach();
                        attachedElements.forEach(element => element.remove());
                    });
                });

                //When Participants connect to or disconnect from a Room that you're connected to, you'll be notified via Participant Connection events:

                room.on('participantConnected', participant => {
                    console.log(`Participant connected: ${participant.identity}`);
                });

                room.on('participantDisconnected', participant => {
                    console.log(`Participant disconnected: ${participant.identity}`);
                });



                return this.setState({ isVideoEnabled: true })
            }
            )

        })
    }


    HandleRefereshToken = () => {
        return this.fetchChatToken().then(token => {
            this.chatClient.updateToken(token);
        })
    }


    fetchChatToken = () => {
        const chatUserId = localStorage.getItem('chatUserId');

        if (!chatUserId) throw new Error('Cannot find Chat Token');

        return axios.get('http://b8970f31.ngrok.io/Chat-Access-token?identity=' + chatUserId)
            .then(({ data }) => {
                console.log("token   == ", data)
                return data
            })
            .catch(err => console.log(err, 'err'))
    };

    fetchVoiceToken = () => {
        return axios.get('http://b8970f31.ngrok.io/Voice-Capability-token')
                .then(token=> {
                    console.log(token.data, '//////////Voice -token ///////')
                return token.data
                })
                .catch(err => console.log(err, 'error'))

    }

    LoginForm = () => {
        return (
            <form>
                <label>
                    username:
          <input type="text" name="username" value={this.state.username} onChange={this.onChangeHandler} required />
                </label>
                <label>
                    email:
          <input type="text" name="email" value={this.state.email} onChange={this.onChangeHandler} required />
                </label>
                <button onClick={this.onFormSubmit}>Submit</button>
            </form>
        )
    }

    showUserChannels = () => {
        const { UserChannelList } = this.state
        const UserChannels = UserChannelList.map((channel, index) => channel ? <ul><li key={index}>{channel}</li></ul> : null)

        return UserChannels
    }

    subscribedChannels = () => {
        const { SubscribedChannelList } = this.state
        const SubscribedChannel = SubscribedChannelList.map((channel, index) => channel ? <ul><li key={index}>{channel}</li></ul> : null)

        return SubscribedChannel
    }

    showPublicChannels = () => {
        const { PublicChannelList } = this.state
        const PublicChannel = PublicChannelList.map((channel, index) => channel ? <ul><li key={index}>{channel}</li></ul> : null)

        return PublicChannel
    }
    onVideoCallDisconnect = () => {
        if (this.videoRoom)
            return this.videoRoom.disconnect()
    }

    goAfterDisconnect = () => {
        this.onVideoCallDisconnect()
        return this.setState({
            isVideoEnabled: false,
            isShowChatScreen: true
        })
    }

    goToVideoPage = (e) => {
        return (
            <div>
                <h2> Video Room</h2>
                <button onClick={this.goAfterDisconnect}>Call disconnect </button>
            </div>
        )
    }

    initialVoice = () => {
        this.fetchVoiceToken().then(token => console.log(token))
    }

    showChatScreen = () => {
        const { messageList, showMessageInput } = this.state
        return (
            <div>
                <div>
                    <h2> Go for Video-Call</h2>
                    <button onClick={this.initialVideo}>VideoCall</button>
                </div><br />
                <div>
                    <h2> Go for Voice-Call</h2>
                    <button onClick={this.initialVoice}>VoiceCall</button>
                </div>
                <div>
                    {messageList.length === 0 && !showMessageInput ? this.blankChatScreen() : this.showMessageList()}
                    {this.channelNameInput()}
                    <h2>Your Channels:</h2>
                    {this.showUserChannels()}
                    <h2>Your Subscribed Channels:</h2>
                    {this.subscribedChannels()}
                    <h2>Your Public Channels:</h2>
                    {this.showPublicChannels()}
                </div>
            </div>
        )
    }

    handleShowMessageInput = event => {
        this.setState({
            showMessageInput: true
        })
    }

    showMessageList = () => {
        const { messageList } = this.state
        const ChatUserId = localStorage.getItem('chatUserId')
        const User = localStorage.getItem('username')
        const { uniqueName } = this.channel.state

        return (
            <div>
                <h2>User: {User}</h2>
                <h4> Your Channel: {this.channel.state.uniqueName ? uniqueName : null} </h4>

                {
                    messageList.map((message, index) => {
                        if (message.state.attributes.ChatUserId === ChatUserId) {
                            return (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end'
                                }}>
                                    <ul>
                                        <li key={index}> {message.state.body} from:  {message.state.attributes.Name}</li>
                                    </ul>
                                </div>
                            )
                        }
                        else {
                            return <div style={{
                                display: 'flex',
                                justifyContent: 'flex-start'
                            }}> <ul>
                                    <li key={index}> {message.state.body} from: {message.state.attributes.Name}</li>
                                </ul>
                            </div>
                        }
                    })
                }
                <br />
                {this.messageInput()}
            </div>
        )
    }

    blankChatScreen = () => {
        return (
            <div>
                <h1> You have no messages</h1>
                <button onClick={this.handleShowMessageInput}>Start Conversation</button>
            </div>
        )
    }

    handleEnterSubmitMessage = event => {
        // If key is not 'enter' key then we return from the function
        if (event.charCode !== 13) return;

        this.sendMessage();
    };



    handleChangeText = fieldName => (event) => {
        if (event.keyCode === 13) {
            this.sendMessage();
        } else {
            // else send the Typing Indicator signal
            console.log(" channel = ", this.channel)
            this.channel && this.channel.typing();
        }
        this.setState({ [fieldName]: event.target.value });
    };


    sendMessage = () => {
        if (this.channel) {

            const { inputMessage } = this.state

            const chatUserId = localStorage.getItem('chatUserId')
            const channelUniqueName = localStorage.getItem('channelUniqueName')
            const username = localStorage.getItem('username')
            const email = localStorage.getItem('email')

            // if(!inputMessage) return;

            const Message = {
                Name: username,
                ChatUserId: chatUserId,
                ChannelName: channelUniqueName,
                Email: email
            }

            // const totalMessage = {
            //     contentType: 'image/gif',
            //     media: 'http://i.imgur.com/1958hGJ.gif',
            //     inputMessage
            // }

            return this.channel.sendMessage(inputMessage, Message).then(() => {
                this.setState({
                    inputMessage: ''
                })
            })
        }
    }

    messageInput = () => {
        return (
            <div>
                <input type="text"
                    value={this.state.inputMessage}
                    onKeyPress={this.handleEnterSubmitMessage}
                    onChange={this.handleChangeText('inputMessage')}
                    placeholder="Type message..."
                    name="inputMessage"
                />
                <button onClick={this.sendMessage}> Send</button>
            </div>
        )
    }


    handleChannelInput = (e) => {
        const { name, value } = e.target

        if (this.chatClient)
            this.setState({
                [name]: value
            })
    }

    deleteChannel = (e) => {
        console.log(this.channel, 'this.channel')
        if (this.channel)
            // Delete a previously created Channel
            return this.channel.delete()
                .then(channel => {
                    localStorage.clear()
                    console.log('Deleted channel: ' + channel.sid);
                })
                .then(() => this.getChatRoom())
    }

    inviteAFriend = (e) => {
        return this.channel.invite('kamlesh').then(function () {
            console.log('Your friend has been invited!');
        });
    }

    sendChannelName = (e) => {
        const { inputChannelName } = this.state

        if (this.chatClient && inputChannelName) {
            this.getChatRoom()

                .then(() => this.setState({
                    isShowChatScreen: true, inputChannelName: ''
                }, () => this.showChatScreen()))
        }
    }

    logout = (e) => {
        const { isLoggedIn } = this.state

        localStorage.clear()
        return this.setState({
            isLoggedIn: false
        }, () => this.LoginForm())
    }

    channelNameInput = () => {
        return (
            <div>
                <input type="text"
                    value={this.state.inputChannelName}
                    // onKeyPress={this.handleEnterSubmitMessage}
                    onChange={this.handleChannelInput}
                    placeholder="Type channel name..."
                    name="inputChannelName"
                />
                <button onClick={this.sendChannelName}> create channel</button> <br />
                {this.chatClient && this.channel ?
                    <button onClick={this.deleteChannel}> delete channel</button>
                    && <button onClick={this.inviteAFriend}> invite</button>
                    && <button onClick={this.logout}> logout</button>
                    : null}
            </div>
        )
    }

    render() {
        const { isLoggedIn, isVideoEnabled, isShowChatScreen } = this.state
        return (
            <div>
                {
                    this.videoRoom && isVideoEnabled ? this.goToVideoPage() : (this.chatClient && isLoggedIn && isShowChatScreen ? this.showChatScreen() : this.LoginForm())
                }

            </div>
        )
    }
}

export default ChatPage