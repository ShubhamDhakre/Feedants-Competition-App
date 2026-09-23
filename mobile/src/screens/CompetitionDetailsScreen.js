import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { AuthContext } from '../hooks/useAuth';
import competitionService from '../services/competitionService';
import Colors from '../constants/colors';

// Components
import Header from '../components/Header';
import CompetitionHero from '../components/CompetitionHero';
import CompetitionStats from '../components/CompetitionStats';
import CountdownCard from '../components/CountdownCard';
import ImportantDates from '../components/ImportantDates';
import JudgingSection from '../components/JudgingSection';
import RulesSection from '../components/RulesSection';
import RewardsSection from '../components/RewardsSection';
import WinnersSection from '../components/WinnersSection';
import BottomAction from '../components/BottomAction';

// Hardcoded competition ID for now — in a real app, this would come from navigation params
// This will be replaced with the actual seeded competition ID
const COMPETITION_ID = null; // Will be set after seeding

const CompetitionDetailsScreen = ({ navigation, route }) => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitDescription, setSubmitDescription] = useState('');
  const [submitLink, setSubmitLink] = useState('');

  // Get competition ID from route params or use default
  const competitionId = route?.params?.competitionId || COMPETITION_ID;

  // Fetch competition data
  const fetchCompetition = useCallback(async () => {
    try {
      setError(null);
      let targetId = competitionId;

      if (!targetId) {
        // Auto-discover the active competition from the backend
        const listRes = await competitionService.getCompetitions();
        const competitions = listRes.data?.competitions || [];
        if (competitions.length === 0) {
          setError('No competitions found. Please seed the database first (node seed.js in server directory).');
          setLoading(false);
          setRefreshing(false);
          return;
        }
        targetId = competitions[0]._id;
      }

      const response = await competitionService.getCompetition(targetId);
      setCompetition(response.data.competition);
    } catch (err) {
      setError(err.message || 'Failed to load competition');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [competitionId, isAuthenticated]);

  useEffect(() => {
    fetchCompetition();
  }, [fetchCompetition]);

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCompetition();
  }, [fetchCompetition]);

  // Handle registration
  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }

    Alert.alert(
      'Register for Competition',
      `Are you sure you want to register for "${competition.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: async () => {
            setActionLoading(true);
            try {
              await competitionService.register(competition._id);
              Alert.alert('Success', 'You have been registered successfully!');
              fetchCompetition(); // Refresh data
            } catch (err) {
              Alert.alert('Registration Failed', err.message || 'Could not register');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle submission
  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  const handleSubmitEntry = async () => {
    if (!submitTitle.trim()) {
      Alert.alert('Error', 'Please enter a submission title');
      return;
    }

    setActionLoading(true);
    setShowSubmitModal(false);

    try {
      await competitionService.submitEntry(competition._id, {
        title: submitTitle.trim(),
        description: submitDescription.trim(),
        linkUrl: submitLink.trim() || undefined,
      });
      Alert.alert('Success', 'Your entry has been submitted!');
      setSubmitTitle('');
      setSubmitDescription('');
      setSubmitLink('');
      fetchCompetition(); // Refresh data
    } catch (err) {
      Alert.alert('Submission Failed', err.message || 'Could not submit entry');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle countdown expiration — refresh to get new state
  const handleCountdownExpired = () => {
    fetchCompetition();
  };

  // Determine which countdown to show
  const getCountdownInfo = () => {
    if (!competition) return null;

    switch (competition.computedStatus) {
      case 'UPCOMING':
        return { targetDate: competition.registrationStart, label: 'Registration opens in' };
      case 'REGISTRATION_OPEN':
        return { targetDate: competition.registrationEnd, label: 'Registration closes in' };
      case 'REGISTRATION_CLOSED':
        return { targetDate: competition.submissionStart, label: 'Submissions open in' };
      case 'SUBMISSION_OPEN':
        return { targetDate: competition.submissionEnd, label: 'Submission deadline in' };
      case 'SUBMISSION_CLOSED':
        return { targetDate: competition.resultDate, label: 'Results in' };
      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading competition...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCompetition}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const countdownInfo = getCountdownInfo();

  return (
    <View style={styles.container}>
      <Header
        title="Competition Details"
        onBack={() => navigation.canGoBack() && navigation.goBack()}
        onLogout={isAuthenticated ? logout : undefined}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Hero section */}
        <CompetitionHero competition={competition} />

        {/* Stats card */}
        <CompetitionStats competition={competition} />

        {/* Countdown */}
        {countdownInfo && (
          <CountdownCard
            targetDate={countdownInfo.targetDate}
            label={countdownInfo.label}
            onExpired={handleCountdownExpired}
          />
        )}

        {/* Status badge */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, getStatusStyle(competition.computedStatus)]}>
            <Text style={[styles.statusText, getStatusTextStyle(competition.computedStatus)]}>
              {formatStatus(competition.computedStatus)}
            </Text>
          </View>
        </View>

        {/* Important dates */}
        <ImportantDates competition={competition} />

        {/* Judging */}
        <JudgingSection
          parameters={competition.judgingParameters}
          judge={competition.judge}
        />

        {/* Rules and eligibility */}
        <RulesSection rules={competition.rules} eligibility={competition.eligibility} />

        {/* Rewards */}
        <RewardsSection rewards={competition.rewards} />

        {/* Previous winners */}
        <WinnersSection winners={competition.previousWinners} />

        {/* Spacer for bottom action bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom action */}
      <BottomAction
        computedStatus={competition.computedStatus}
        userParticipation={competition.userParticipation}
        remainingSpots={competition.remainingSpots}
        isAuthenticated={isAuthenticated}
        onRegister={handleRegister}
        onSubmit={handleSubmit}
        onLogin={() => navigation.navigate('Login')}
        loading={actionLoading}
      />

      {/* Submission modal */}
      <Modal
        visible={showSubmitModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSubmitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submit Your Entry</Text>

            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.modalInput}
              value={submitTitle}
              onChangeText={setSubmitTitle}
              placeholder="Enter submission title"
              placeholderTextColor={Colors.textLight}
              maxLength={200}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              value={submitDescription}
              onChangeText={setSubmitDescription}
              placeholder="Describe your submission"
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={4}
              maxLength={2000}
            />

            <Text style={styles.inputLabel}>Link (optional)</Text>
            <TextInput
              style={styles.modalInput}
              value={submitLink}
              onChangeText={setSubmitLink}
              placeholder="https://..."
              placeholderTextColor={Colors.textLight}
              autoCapitalize="none"
              keyboardType="url"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowSubmitModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitEntry}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Helper: format status text for display
const formatStatus = (status) => {
  switch (status) {
    case 'UPCOMING': return 'Upcoming';
    case 'REGISTRATION_OPEN': return 'Registration Open';
    case 'REGISTRATION_CLOSED': return 'Registration Closed';
    case 'SUBMISSION_OPEN': return 'Submissions Open';
    case 'SUBMISSION_CLOSED': return 'Submissions Closed';
    case 'RESULT_DECLARED': return 'Results Declared';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
};

// Helper: get status badge background color
const getStatusStyle = (status) => {
  switch (status) {
    case 'REGISTRATION_OPEN':
    case 'SUBMISSION_OPEN':
      return { backgroundColor: Colors.success + '20' };
    case 'CANCELLED':
      return { backgroundColor: Colors.error + '20' };
    case 'RESULT_DECLARED':
      return { backgroundColor: Colors.primary + '20' };
    default:
      return { backgroundColor: Colors.warning + '20' };
  }
};

// Helper: get status badge text color
const getStatusTextStyle = (status) => {
  switch (status) {
    case 'REGISTRATION_OPEN':
    case 'SUBMISSION_OPEN':
      return { color: Colors.success };
    case 'CANCELLED':
      return { color: Colors.error };
    case 'RESULT_DECLARED':
      return { color: Colors.primary };
    default:
      return { color: '#B8860B' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  statusContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default CompetitionDetailsScreen;
