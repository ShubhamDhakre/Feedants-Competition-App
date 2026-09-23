import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import { formatDate } from '../utils/dateUtils';

// Shows important competition dates in a timeline-like layout
const ImportantDates = ({ competition }) => {
  const dates = [
    { label: 'Registration Opens', date: competition.registrationStart },
    { label: 'Registration Closes', date: competition.registrationEnd },
    { label: 'Submission Opens', date: competition.submissionStart },
    { label: 'Submission Deadline', date: competition.submissionEnd },
    { label: 'Result Declaration', date: competition.resultDate },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Important Dates</Text>
      {dates.map((item, index) => (
        <View key={index} style={styles.dateRow}>
          <View style={styles.dotContainer}>
            <View style={[styles.dot, isPast(item.date) && styles.dotPast]} />
            {index < dates.length - 1 && (
              <View style={[styles.line, isPast(dates[index + 1].date) && styles.linePast]} />
            )}
          </View>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>{item.label}</Text>
            <Text style={styles.dateValue}>{formatDate(item.date)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// Check if a date is in the past
const isPast = (dateString) => new Date(dateString) < new Date();

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  dotContainer: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  dotPast: {
    backgroundColor: Colors.success,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    minHeight: 30,
  },
  linePast: {
    backgroundColor: Colors.success,
  },
  dateInfo: {
    flex: 1,
    paddingBottom: 20,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});

export default ImportantDates;
