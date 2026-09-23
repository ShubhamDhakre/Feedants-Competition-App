import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

// Displays judging parameters with name and weightage
const JudgingSection = ({ parameters, judge }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Judging</Text>

      {/* Judge info */}
      {judge && (
        <View style={styles.judgeCard}>
          <View style={styles.judgeAvatar}>
            <Text style={styles.judgeInitial}>{judge.name?.charAt(0) || 'J'}</Text>
          </View>
          <View style={styles.judgeInfo}>
            <Text style={styles.judgeName}>{judge.name}</Text>
            {judge.title && <Text style={styles.judgeTitle}>{judge.title}</Text>}
          </View>
        </View>
      )}

      {/* Judging parameters */}
      {parameters && parameters.length > 0 && (
        <View style={styles.parametersContainer}>
          <Text style={styles.subTitle}>Judging Criteria</Text>
          {parameters.map((param, index) => (
            <View key={index} style={styles.paramRow}>
              <View style={styles.paramInfo}>
                <Text style={styles.paramName}>{param.name}</Text>
                {param.description && (
                  <Text style={styles.paramDesc}>{param.description}</Text>
                )}
              </View>
              {param.weightage != null && (
                <View style={styles.weightBadge}>
                  <Text style={styles.weightText}>{param.weightage}%</Text>
                </View>
              )}
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  judgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  judgeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  judgeInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  judgeInfo: {
    flex: 1,
  },
  judgeName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  judgeTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  parametersContainer: {
    marginTop: 4,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  paramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  paramInfo: {
    flex: 1,
  },
  paramName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  paramDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  weightBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  weightText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});

export default JudgingSection;
