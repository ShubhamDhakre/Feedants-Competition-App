import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

// Stats row showing prize pool, entry fee, and spots
const CompetitionStats = ({ competition }) => {
  const remainingSpots = Math.max(0, competition.capacity - competition.registeredCount);

  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Prize Pool</Text>
        <Text style={styles.statValue}>{competition.prizePool}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Entry Fee</Text>
        <Text style={styles.statValue}>
          {competition.entryFee === 0 ? 'Free' : `₹${competition.entryFee}`}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Spots Left</Text>
        <Text style={[styles.statValue, remainingSpots <= 5 && styles.urgentText]}>
          {remainingSpots} / {competition.capacity}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  urgentText: {
    color: Colors.error,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
});

export default CompetitionStats;
