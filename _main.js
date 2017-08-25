import React, { Component } from 'react';
import { Platform } from 'react-native';
import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStream,
    MediaStreamTrack,
    getUserMedia,
} from 'react-native-webrtc';

class Main extends Component {
    // initial state
    state = {
        videoURL: null,
        isFront: true
    }

    componentDidMount() {
        // Do something here
        const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
        const pc = new RTCPeerConnection(configuration);
        const { isFront } = this.state;

        MediaStreamTrack.getSources(sourceInfos => {
            console.log('MediaStreamTrack.getSources', sourceInfos);
            let videoSourceId;
            for (let i = 0; i < sourceInfos.length; i++) {
                const sourceInfo = sourceInfos[i];
                if (sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
                    videoSourceId = sourceInfo.id;
                }
            }
            getUserMedia({
                audio: true,
                // If platform is IOS
                video: Platform.Os === 'ios' ? false : {
                    mandatory: {
                        minWidth: 500, // Provide your own width, height and frame rate here
                        minHeight: 300,
                        minFrameRate: 30
                    },
                    facingMode: (isFront ? "user" : "environment"),
                    optional: (videoSourceId ? [{ sourceId: videoSourceId }] : [])
                }
            }, (stream) => {
                // use arrow function :)
                // (stream) or stream are fine
                console.log('Streaming Ok', stream);
                this.setState({
                    videoURL: steam.toURL()
                })
                //console.log('dddd', stream);
                //callback(stream);
                pc.addStream(stream);
            }, error => {
                console.log('Oops, we geting error', error.message);
                throw error;
            });
        });

        pc.createOffer( (desc) => {
            pc.setLocalDescription(desc,  () => {
                // Send pc.localDescription to peer
                console.log('pc. setLocalDescription');
            },  (e) =>  { throw e;  });
        },  (e) => { throw e; });

        pc.onicecandidate =  (event) => {
            // send event.candidate to peer
            console.log('onceCandidate event', event);
        };
    }

    render() {
        return (
            <RTCView streamURL={this.state.videoURL} style={styles.container} />
        );
    }
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#ccc',
        borderWidth: 1,
        borderColor: '#000'
    }
};

export default Main;