import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

// Displays competition rules and eligibility as bullet lists
const RulesSection = ({ rules, eligibility }) => {
  return (
    <View style={styles.container}>
      {/* Rules */}
      {rules && rules.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rules</Text>
          {rules.map((rule, index) => (
            <View key={index} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{rule}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Eligibility */}
      {eligibility && eligibility.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eligibility</Text>
          {eligibility.map((item, index) => (
            <View key={index} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 8,
  },
  bullet: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 8,
    marginTop: 1,
    fontWeight: '700',
  },
  bulletText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});

export default RulesSection;
