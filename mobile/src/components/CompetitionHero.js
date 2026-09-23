import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

// Hero section showing competition title, category, type, and cover area
const CompetitionHero = ({ competition }) => {
  return (
    <View style={styles.container}>
      <View style={styles.coverArea}>
        <View style={styles.overlay}>
          <View style={styles.badges}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{competition.category}</Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{competition.type}</Text>
            </View>
          </View>
          <Text style={styles.title}>{competition.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {competition.description}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  coverArea: {
    backgroundColor: Colors.primary,
    minHeight: 180,
    justifyContent: 'flex-end',
  },
  overlay: {
    padding: 20,
    paddingTop: 16,
  },
  badges: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  typeBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
});

export default CompetitionHero;
