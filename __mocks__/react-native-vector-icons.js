import React from 'react';
import { Text } from 'react-native';

export default function Icon(props) {
  return React.createElement(Text, props, props.name);
}