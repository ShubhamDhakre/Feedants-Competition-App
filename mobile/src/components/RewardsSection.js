import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

// Displays the prize/reward tiers
const RewardsSection = ({ rewards }) => {
  if (!rewards || rewards.length === 0) return null;

  // Medal emoji by rank
  const getMedal = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Rewards</Text>
      {rewards.map((reward, index) => (
        <View key={index} style={styles.rewardCard}>
          <Text style={styles.medal}>{getMedal(reward.rank)}</Text>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>{reward.title}</Text>
            <Text style={styles.rewardPrize}>{reward.prize}</Text>
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
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  medal: {
    fontSize: 28,
    marginRight: 14,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  rewardPrize: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
});

export default RewardsSection;
