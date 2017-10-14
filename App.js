/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight
} from 'react-native';
import signalr from 'react-native-signalr';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
  'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
  'Shake or press menu button for dev menu',
});
// var proxy;
// var connection;
const signalrUrl = 'http://localhost:8888/';
export default class App extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      text: "",
      proxy: null,
      conn: null
    };
  }
  componentDidMount() {
    //This is the server under /example/server published on azure.
    connection = signalr.hubConnection(signalrUrl);
    connection.logging = true;

    var proxyconn = connection.createHubProxy('DeviceAdpterHub');
    //receives broadcast messages from a hub function, called "helloApp"
    proxyconn.on('AddMessage', (argOne, argTwo, argThree, argFour) => {
      console.log('message-from-server', argOne, argTwo, argThree, argFour);
      this.setState({
        message: argTwo
      });
      //Here I could response by calling something else on the server...
    });

    // atempt connection, and handle errors
    connection.start().done(() => {
      console.log('Now connected, connection ID=' + connection.id);
      this.setState({
        conn: connection,
        proxy: proxyconn
      })
      this.sendMsg('Send', 'Hello Server, how are you?')

    }).fail(() => {
      console.log('Failed');
    });

    //connection-handling
    connection.connectionSlow(() => {
      console.log('We are currently experiencing difficulties with the connection.')
    });

    connection.error((error) => {
      const errorMessage = error.message;
      let detailedError = '';
      if (error.source && error.source._response) {
        detailedError = error.source._response;
      }
      if (detailedError === 'An SSL error has occurred and a secure connection to the server cannot be made.') {
        console.log('When using react-native-signalr on ios with http remember to enable http in App Transport Security https://github.com/olofd/react-native-signalr/issues/14')
      }
      console.log('SignalR error: ' + errorMessage, detailedError)
    });
  }

  sendMsg(method, msg) {
    this.state.proxy.invoke('Send', msg)
      .done((directResponse) => {
        console.log('direct-response-from-server', directResponse);
      }).fail(() => {
        console.warn('Something went wrong when calling server, it might not be up and running?')
      });
  }

  _onPressButton() {
    this.sendMsg('Send', this.state.text);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          {this.state.message}
        </Text>
        <TextInput
          style={{ height: 40, width: 200, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={(text) => { this.setState({ text }) }}
          value={this.state.text}
        />
        <TouchableHighlight onPress={this._onPressButton.bind(this)} 
        style={{height:40, width:200, borderColor: 'blue', borderWidth: 1}}>
          <Text>Send</Text>
        </TouchableHighlight>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 40,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
