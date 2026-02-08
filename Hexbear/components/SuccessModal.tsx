import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { MagicColors, Fonts, FontWeights, FontSizes } from '@/constants/theme';
import { MagicButton } from './MagicButton';
import { Ionicons } from '@expo/vector-icons';
import { LottieAnimation } from './LottieAnimation';

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
          {/* Sparkle decoration - using unicode sparkles */}
          <Animated.Text
            style={[
              styles.sparkles,
              { opacity: sparkleAnim },
            ]}
          >
            {'✦ ✦ ✦'}
          </Animated.Text>

          {/* Lottie Animation - Magic Wand */}
          <View style={styles.animationContainer}>
            <LottieAnimation
              source={require('@/assets/animations/magic-wand.json')}
              loop={true}
              autoPlay={true}
              style={styles.lottieAnimation}
            />
          </View>

          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={64} color={MagicColors.successGreen} />
          </View>
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
              <Ionicons name="bulb" size={20} color={MagicColors.goldDark} style={styles.funFactIcon} />
              <Text style={styles.funFactText}>{funFact}</Text>
            </View>
          )}

          <MagicButton
            title="Continue Casting"
            iconName="sparkles"
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: MagicColors.cream,
    borderRadius: 28,
    padding: 28,
    width: width - 48,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MagicColors.borderAmber,
    ...Platform.select({
      web: {
        boxShadow: '0px 0px 30px rgba(255, 215, 0, 0.3)',
      },
      default: {
        shadowColor: MagicColors.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 10,
      },
    }),
  },
  sparkles: {
    fontSize: 20,
    marginBottom: 8,
    color: MagicColors.goldDark,
  },
  animationContainer: {
    width: 150,
    height: 150,
    marginBottom: -20,
    marginTop: -20,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  successIconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: FontWeights.extrabold,
    color: MagicColors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Fonts.heading,
  },
  message: {
    fontSize: 15,
    color: MagicColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    fontFamily: Fonts.body,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: MagicColors.offWhiteSolid,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 2,
    borderColor: MagicColors.borderLight,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: FontWeights.extrabold,
    color: MagicColors.emeraldDeep,
    fontFamily: Fonts.mono,
  },
  statLabel: {
    fontSize: 12,
    color: MagicColors.textSecondary,
    marginTop: 4,
    fontFamily: Fonts.body,
  },
  statDivider: {
    width: 2,
    backgroundColor: MagicColors.borderLight,
    marginHorizontal: 12,
  },
  funFactBox: {
    flexDirection: 'row',
    backgroundColor: MagicColors.gold + '15',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: MagicColors.borderAmber,
    alignItems: 'center',
  },
  funFactIcon: {
    marginRight: 8,
  },
  funFactText: {
    flex: 1,
    fontSize: 13,
    color: MagicColors.textPrimary,
    lineHeight: 18,
    fontFamily: Fonts.body,
  },
});
