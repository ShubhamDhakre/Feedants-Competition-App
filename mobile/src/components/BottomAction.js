import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/colors';

/**
 * Bottom action bar — changes button text and behavior based on competition state.
 *
 * States:
 * - UPCOMING: "Registration Not Open Yet" (disabled)
 * - REGISTRATION_OPEN + not registered: "Register Now" (active)
 * - REGISTRATION_OPEN + already registered: "Already Registered" (disabled)
 * - REGISTRATION_CLOSED: "Registration Closed" (disabled)
 * - COMPETITION_FULL: "Competition Full" (disabled)
 * - SUBMISSION_OPEN + registered: "Submit Entry" (active)
 * - SUBMISSION_OPEN + not registered: "Not Registered" (disabled)
 * - SUBMISSION_OPEN + already submitted: "Submitted" (disabled)
 * - SUBMISSION_CLOSED: "Submission Closed" (disabled)
 * - RESULT_DECLARED: "Results Declared" (disabled)
 * - CANCELLED: "Competition Cancelled" (disabled)
 */
const BottomAction = ({
  computedStatus,
  userParticipation,
  remainingSpots,
  isAuthenticated,
  onRegister,
  onSubmit,
  onLogin,
  loading,
}) => {
  const insets = useSafeAreaInsets();

  const getButtonConfig = () => {
    // Not logged in — show login prompt
    if (!isAuthenticated && computedStatus === 'REGISTRATION_OPEN') {
      return {
        text: 'Login to Register',
        onPress: onLogin,
        disabled: false,
        style: 'primary',
      };
    }

    switch (computedStatus) {
      case 'UPCOMING':
        return { text: 'Registration Not Open Yet', disabled: true, style: 'disabled' };

      case 'REGISTRATION_OPEN':
        if (userParticipation) {
          return { text: '✓ Already Registered', disabled: true, style: 'success' };
        }
        if (remainingSpots <= 0) {
          return { text: 'Competition Full', disabled: true, style: 'disabled' };
        }
        return {
          text: `Register Now (${remainingSpots} spots left)`,
          onPress: onRegister,
          disabled: false,
          style: 'primary',
        };

      case 'REGISTRATION_CLOSED':
        if (userParticipation) {
          return { text: '✓ Registered — Waiting for Submissions', disabled: true, style: 'success' };
        }
        return { text: 'Registration Closed', disabled: true, style: 'disabled' };

      case 'SUBMISSION_OPEN':
        if (!userParticipation) {
          return { text: 'Not Registered', disabled: true, style: 'disabled' };
        }
        if (userParticipation.hasSubmitted) {
          return { text: '✓ Submitted', disabled: true, style: 'success' };
        }
        return { text: 'Submit Entry', onPress: onSubmit, disabled: false, style: 'primary' };

      case 'SUBMISSION_CLOSED':
        return { text: 'Submission Closed', disabled: true, style: 'disabled' };

      case 'RESULT_DECLARED':
        return { text: 'Results Declared', disabled: true, style: 'disabled' };

      case 'CANCELLED':
        return { text: 'Competition Cancelled', disabled: true, style: 'error' };

      default:
        return { text: 'Unavailable', disabled: true, style: 'disabled' };
    }
  };

  const config = getButtonConfig();

  const getButtonStyle = () => {
    switch (config.style) {
      case 'primary': return styles.buttonPrimary;
      case 'success': return styles.buttonSuccess;
      case 'error': return styles.buttonError;
      default: return styles.buttonDisabled;
    }
  };

  const getTextStyle = () => {
    switch (config.style) {
      case 'primary': return styles.buttonTextPrimary;
      case 'success': return styles.buttonTextSuccess;
      case 'error': return styles.buttonTextError;
      default: return styles.buttonTextDisabled;
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 12 }]}>
      <TouchableOpacity
        style={[styles.button, getButtonStyle()]}
        onPress={config.onPress}
        disabled={config.disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={[styles.buttonText, getTextStyle()]}>{config.text}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSuccess: {
    backgroundColor: Colors.success + '15',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  buttonError: {
    backgroundColor: Colors.error + '15',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  buttonDisabled: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: Colors.white,
  },
  buttonTextSuccess: {
    color: Colors.success,
  },
  buttonTextError: {
    color: Colors.error,
  },
  buttonTextDisabled: {
    color: Colors.textLight,
  },
});

export default BottomAction;
