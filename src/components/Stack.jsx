import React from 'react'
import { View, Animated, Dimensions, Easing } from 'react-native'
import { PanGestureHandler, State } from 'react-native-gesture-handler';

export default class Stack extends React.Component {

  constructor(props) {

    super(props);
    this.state = {
      id: null,
      current: null, 
      bottom: null,
      left: null,
      right: null,
      dictionary: {}, 
      translate: new Animated.Value(0)
    }
    
    if (this.state.current == null && this.props.children.length > 0) {
      this.state.current = this.props.children[0];
      this.state.id = this.state.current.props.id;
    }
    
    this.props.children.forEach((child) => {
      this.state.dictionary[child.props.id] = child;
    });

  }

  onGestureEvent = (event) => {

    // Alias some variables for readability
    const current = this.state.current;
    const dictionary = this.state.dictionary;

    // See if we can move the screen, and how much if we can.
    const { translationX } = event.nativeEvent;
    if (!('left'  in current.props) && translationX > 0) {return;}
    if (!('right' in current.props) && translationX < 0) {return;}
    
    // Set the next screen state.
    if (translationX > 0) {

      const left = dictionary[current.props.left];
      if (left.props.zIndex < current.props.zIndex) {
        this.state.bottom = left;
        this.state.left = null;
        this.state.right = null;
      } else {
        this.state.bottom = null;
        this.state.left = left;
        this.state.right = null;
      }

    } else {

      const right = dictionary[current.props.right];
      if (right.props.zIndex < current.props.zIndex) {
        this.state.bottom = right;
        this.state.left = null;
        this.state.right = null;
      } else {
        this.state.bottom = null;
        this.state.left = null;
        this.state.right = right;
      }

    }
  
    // Move the screen.
    this.forceUpdate();
    this.state.translate.setValue(translationX);

  }
  
  onHandlerStateChange = async (event) => {
  
    // If the user ends the gesture, determine if we can move.
    if (event.nativeEvent.state === State.END) {
      
      // If the user moved far enough to the left.
      var success = event.nativeEvent.translationX > Dimensions.get('window').width / 3 && ('left' in this.state.current.props);
      if (success) {
  
        Animated.timing(this.state.translate, {
          toValue: Dimensions.get('window').width,
          duration: 200,
          useNativeDriver: false,
          easing: Easing.linear,
        }).start(() => {
          if (this.state.left != null) {
            this.state.current = this.state.left;
            this.state.id = this.state.current.props.id;
          } else {
            this.state.current = this.state.bottom;
            this.state.id = this.state.current.props.id;
          }
        });

        return;
        
      } 

      success = event.nativeEvent.translationX < -Dimensions.get('window').width / 3 && ('right' in this.state.current.props);
      if (success) {
  
        Animated.timing(this.state.translate, {
          toValue: -Dimensions.get('window').width,
          duration: 200,
          useNativeDriver: false,
          easing: Easing.linear,
        }).start(() => {
          if (this.state.right != null) {
            this.state.current = this.state.right;
            this.state.id = this.state.current.props.id;
          } else {
            this.state.current = this.state.bottom;
            this.state.id = this.state.current.props.id;
          }
        });

        return;
      } 
      
      // Spring the screen back to its default location.
      if (!success) {
        Animated.spring(this.state.translate, {
          toValue: 0,
          useNativeDriver: false
        }).start();
      }

    }
  
  }

  render() {

    if (this.state.left != null || this.state.right != null) {

      return (
        <PanGestureHandler
          onGestureEvent={(event) => {if (this.state.current != null) {this.onGestureEvent(event);}}}
          onHandlerStateChange={(event) => {if (this.state.current != null) {this.onHandlerStateChange(event);}}}
        >
          <View>
            <Animated.View style={{position: 'absolute', zIndex: 2, elevation: 2, transform: [{ translateX: this.state.translate }], left: -Dimensions.get('window').width}}>{this.state.left}</Animated.View>
            <Animated.View style={{position: 'absolute', zIndex: 2, elevation: 2, transform: [{ translateX: this.state.translate }], left: Dimensions.get('window').width}}>{this.state.right}</Animated.View>
            <Animated.View style={{position: 'absolute', zIndex: 1, elevation: 1}}>{this.state.current}</Animated.View>
            <View style={{position: 'absolute', zIndex: 0, elevation: 0}}>{this.state.bottom}</View>
          </View>
        </PanGestureHandler>
      );

    }

    else {

      return (
        <PanGestureHandler
          onGestureEvent={(event) => {if (this.state.current != null) {this.onGestureEvent(event);}}}
          onHandlerStateChange={(event) => {if (this.state.current != null) {this.onHandlerStateChange(event);}}}
        >
          <View>
            <Animated.View style={{position: 'absolute', zIndex: 2, elevation: 2, transform: [{ translateX: this.state.translate }], left: -Dimensions.get('window').width}}>{this.state.left}</Animated.View>
            <Animated.View style={{position: 'absolute', zIndex: 2, elevation: 2, transform: [{ translateX: this.state.translate }], left: Dimensions.get('window').width}}>{this.state.right}</Animated.View>
            <Animated.View style={{position: 'absolute', zIndex: 1, elevation: 1, transform: [{ translateX: this.state.translate }]}}>{this.state.current}</Animated.View>
            <View style={{position: 'absolute', zIndex: 0, elevation: 0}}>{this.state.bottom}</View>
          </View>
        </PanGestureHandler>
      );

    }
    
  }

}

export {Stack};