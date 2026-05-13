import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true, error, info });
    // Also log to console so Metro shows it
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.message}>{String(this.state.error)}</Text>
            {this.state.info && (
              <Text style={styles.stack}>{String(this.state.info.componentStack)}</Text>
            )}
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#b91c1c', marginBottom: 12 },
  scroll: { flex: 1 },
  message: { color: '#111', marginBottom: 8 },
  stack: { color: '#6b7280' },
});