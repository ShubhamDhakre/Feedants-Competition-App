import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

// Shows previous competition winners
const WinnersSection = ({ winners }) => {
  if (!winners || winners.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Previous Winners</Text>
      {winners.map((winner, index) => (
        <View key={index} style={styles.winnerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{winner.name?.charAt(0) || '?'}</Text>
          </View>
          <View style={styles.winnerInfo}>
            <Text style={styles.winnerName}>{winner.name}</Text>
            <Text style={styles.winnerPrize}>
              Rank #{winner.rank} — {winner.prize}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  winnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  winnerInfo: {
    flex: 1,
  },
  winnerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  winnerPrize: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default WinnersSection;
