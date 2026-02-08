import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MagicColors } from '@/constants/theme';
import { MagicButton } from './MagicButton';

const { width } = Dimensions.get('window');

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  pointsAwarded: number;
  co2Saved: string;
  funFact?: string;
  onClose: () => void;
}

export function SuccessModal({
  visible,
  title,
  message,
  pointsAwarded,
  co2Saved,
  funFact,
  onClose,
}: SuccessModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      sparkleAnim.setValue(0);

      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(sparkleAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    }
  }, [visible, scaleAnim, sparkleAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.content,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Sparkle decoration */}
          <Animated.Text
            style={[
              styles.sparkles,
              { opacity: sparkleAnim },
            ]}
          >
            {'✨ ✨ ✨'}
          </Animated.Text>

          <Text style={styles.successIcon}>{'🎉'}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>+{pointsAwarded}</Text>
              <Text style={styles.statLabel}>GHG Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{co2Saved}</Text>
              <Text style={styles.statLabel}>CO₂ Saved</Text>
            </View>
          </View>

          {funFact && (
            <View style={styles.funFactBox}>
              <Text style={styles.funFactIcon}>{'💡'}</Text>
              <Text style={styles.funFactText}>{funFact}</Text>
            </View>
          )}

          <MagicButton
            title="Continue Casting"
            icon="✨"
            onPress={onClose}
            size="large"
            style={{ marginTop: 20, width: '100%' }}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: MagicColors.darkCard,
    borderRadius: 28,
    padding: 28,
    width: width - 48,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MagicColors.gold + '40',
    shadowColor: MagicColors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  sparkles: {
    fontSize: 20,
    marginBottom: 8,
  },
  successIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: MagicColors.gold,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: MagicColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: MagicColors.darkElevated,
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: MagicColors.emerald,
  },
  statLabel: {
    fontSize: 12,
    color: MagicColors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: MagicColors.border,
    marginHorizontal: 12,
  },
  funFactBox: {
    flexDirection: 'row',
    backgroundColor: MagicColors.gold + '10',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    width: '100%',
  },
  funFactIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  funFactText: {
    flex: 1,
    fontSize: 13,
    color: MagicColors.goldDark,
    lineHeight: 18,
  },
});
