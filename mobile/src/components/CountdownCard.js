import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import { getTimeRemaining } from '../utils/dateUtils';

/**
 * Countdown card that shows time remaining until a target date.
 * Updates every second. Calls onExpired when countdown reaches zero.
 */
const CountdownCard = ({ targetDate, label, onExpired }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeRemaining(targetDate);
      setTimeLeft(remaining);

      if (remaining.isExpired) {
        clearInterval(timer);
        if (onExpired) onExpired();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return null; // Don't show expired countdown
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.timerRow}>
        <TimeBlock value={timeLeft.days} unit="Days" />
        <Text style={styles.separator}>:</Text>
        <TimeBlock value={timeLeft.hours} unit="Hrs" />
        <Text style={styles.separator}>:</Text>
        <TimeBlock value={timeLeft.minutes} unit="Min" />
        <Text style={styles.separator}>:</Text>
        <TimeBlock value={timeLeft.seconds} unit="Sec" />
      </View>
    </View>
  );
};

// Individual time block (e.g., "05" / "Days")
const TimeBlock = ({ value, unit }) => (
  <View style={styles.timeBlock}>
    <Text style={styles.timeValue}>{String(value).padStart(2, '0')}</Text>
    <Text style={styles.timeUnit}>{unit}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 10,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 50,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  timeUnit: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  separator: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textLight,
    marginHorizontal: 4,
    marginBottom: 14,
  },
});

export default CountdownCard;
