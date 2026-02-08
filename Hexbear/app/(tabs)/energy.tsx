import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { MagicColors, Fonts, FontWeights, FontSizes } from '@/constants/theme';
import { MagicButton } from '@/components/MagicButton';
import { SuccessModal } from '@/components/SuccessModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  ENERGY_SAVING_ACTIONS,
  EnergySavingAction,
  calculateCO2,
  calculateEnergyPoints,
  getEnergyMessage,
  AVG_MONTHLY_KWH,
} from '@/constants/energy-data';
import { Ionicons } from '@expo/vector-icons';
import { ENERGY_TIPS, getRandomItem } from '@/constants/eco-facts';

type SpellStage = 'intro' | 'camera' | 'analyzing' | 'result';

// Helper function to map emoji icons to Ionicons names
function getActionIcon(emoji: string): keyof typeof Ionicons.glyphMap {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    '💡': 'bulb',
    '❄️': 'snow',
    '🔌': 'power',
    '🌡️': 'thermometer',
    '💻': 'desktop',
    '🚿': 'water',
  };
  return iconMap[emoji] || 'flash';
}

interface EnergyReading {
  kWh: number;
  co2: number;
  points: number;
  date: string;
}

export default function EnergyScreen() {
  const randomTip = useMemo(() => getRandomItem(ENERGY_TIPS), []);
  const [monthlyKWh, setMonthlyKWh] = useState('');
  const [readings, setReadings] = useState<EnergyReading[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastResult, setLastResult] = useState<{
    points: number;
    co2: number;
    message: string;
  } | null>(null);
  const { logAction } = useAuth();

  const submitMonthlyReading = async () => {
    const kWh = parseFloat(monthlyKWh);
    if (isNaN(kWh) || kWh <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid kWh value.');
      return;
    }

    const co2 = calculateCO2(kWh);
    const prevReading = readings.length > 0 ? readings[readings.length - 1] : null;
    const points = prevReading
      ? calculateEnergyPoints(kWh, prevReading.kWh)
      : 0;
    const message = getEnergyMessage(kWh, prevReading?.kWh || null);

    const newReading: EnergyReading = {
      kWh,
      co2,
      points,
      date: new Date().toLocaleDateString(),
    };
    setReadings([...readings, newReading]);

    if (points > 0) {
      await logAction(
        'energy',
        {
          kWh,
          co2,
          previous_kWh: prevReading?.kWh || null,
        },
        points
      );
    }

    setLastResult({ points, co2, message });
    setShowSuccess(true);
    setMonthlyKWh('');
  };

  const logQuickAction = async (action: EnergySavingAction) => {
    await logAction(
      'energy',
      {
        action_id: action.id,
        action_name: action.name,
        co2_saved: action.co2SavedKg,
      },
      action.points
    );

    setLastResult({
      points: action.points,
      co2: action.co2SavedKg,
      message: `${action.name} logged! Keep up the great work.`,
    });
    setShowSuccess(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
                <View style={styles.spellIconContainer}>
                  <Ionicons name="flash" size={56} color={MagicColors.textLight} />
                </View>
          <Text style={styles.spellTitle}>WattSaver Charm</Text>
          <Text style={styles.spellSubtitle}>
            Energy Conservation Spell
          </Text>
          <Text style={styles.spellDescription}>
            Track your energy usage and log conservation actions to earn GHG
            points. Every watt saved protects our community!
          </Text>
        </View>

        {/* Monthly kWh Input */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="speedometer" size={20} color={MagicColors.textPrimary} />
            <Text style={styles.cardTitle}>
              Monthly Energy Reading
            </Text>
          </View>
          <Text style={styles.cardDescription}>
            Enter your monthly electricity consumption from your energy bill.
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.kWhInput}
              placeholder="e.g. 300"
              placeholderTextColor={MagicColors.textMuted}
              value={monthlyKWh}
              onChangeText={setMonthlyKWh}
              keyboardType="numeric"
            />
            <Text style={styles.kWhUnit}>kWh</Text>
          </View>

          <Text style={styles.avgNote}>
            US avg: ~{AVG_MONTHLY_KWH} kWh/month
          </Text>

          <MagicButton
            title="Cast Energy Spell"
            iconName="flash"
            onPress={submitMonthlyReading}
            variant="secondary"
            size="large"
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Energy History Bar Chart */}
        {readings.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="bar-chart" size={20} color={MagicColors.textPrimary} />
              <Text style={styles.cardTitle}>
                Energy History
              </Text>
            </View>
            <View style={styles.chartContainer}>
              {readings.slice(-6).map((reading, index) => {
                const maxKWh = Math.max(...readings.map((r) => r.kWh));
                const barHeight = (reading.kWh / maxKWh) * 120;
                return (
                  <View key={index} style={styles.barColumn}>
                    <Text style={styles.barValue}>{reading.kWh}</Text>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor:
                            index === readings.slice(-6).length - 1
                              ? MagicColors.energyYellow
                              : MagicColors.energyYellow + '60',
                        },
                      ]}
                    />
                    <Text style={styles.barLabel}>{reading.date}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Quick Energy Actions */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="sparkles" size={24} color={MagicColors.textPrimary} />
            <Text style={styles.sectionTitle}>
              Quick Energy Spells
            </Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Log daily conservation actions for instant points
          </Text>
        </View>

        {ENERGY_SAVING_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionCard}
            onPress={() => logQuickAction(action)}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name={getActionIcon(action.icon)} size={28} color={MagicColors.energyYellow} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionName}>{action.name}</Text>
              <Text style={styles.actionDesc}>{action.description}</Text>
            </View>
            <View style={styles.actionPoints}>
              <Text style={styles.actionPointsValue}>+{action.points}</Text>
              <Text style={styles.actionPointsLabel}>pts</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Energy Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsTitleRow}>
            <Ionicons name="bulb" size={20} color={MagicColors.purple} />
            <Text style={styles.tipsTitle}>
              Wizard Tip
            </Text>
          </View>
          <Text style={styles.tipsText}>
            {randomTip}
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccess}
        title="Energy Spell Cast!"
        message={lastResult?.message || 'Great energy conservation!'}
        pointsAwarded={lastResult?.points || 0}
        co2Saved={`${lastResult?.co2.toFixed(2) || '0'} kg`}
        onClose={() => setShowSuccess(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MagicColors.parchment,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  spellIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: MagicColors.cardPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 0,
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.25)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  spellTitle: {
    fontSize: FontSizes.pageTitle,
    fontWeight: FontWeights.extrabold,
    color: MagicColors.textPrimary,
    fontFamily: Fonts.heading,
  },
  spellSubtitle: {
    fontSize: 14,
    color: MagicColors.energyYellow,
    fontWeight: FontWeights.semibold,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: Fonts.body,
  },
  spellDescription: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontFamily: Fonts.body,
  },

  // Card
  card: {
    backgroundColor: MagicColors.offWhiteSolid,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: MagicColors.borderAmber,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: FontSizes.cardTitle,
    fontWeight: FontWeights.bold,
    color: MagicColors.textPrimary,
    fontFamily: Fonts.heading,
  },
  cardDescription: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
    fontFamily: Fonts.body,
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  kWhInput: {
    flex: 1,
    backgroundColor: MagicColors.parchment,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 20,
    fontWeight: FontWeights.bold,
    color: MagicColors.textPrimary,
    borderWidth: 2,
    borderColor: MagicColors.borderLight,
    textAlign: 'center',
    fontFamily: Fonts.mono,
  },
  kWhUnit: {
    fontSize: 18,
    fontWeight: FontWeights.bold,
    color: MagicColors.textSecondary,
    fontFamily: Fonts.body,
  },
  avgNote: {
    fontSize: 12,
    color: MagicColors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: Fonts.body,
  },

  // Chart
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 12,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontSize: 11,
    color: MagicColors.textSecondary,
    marginBottom: 4,
    fontFamily: Fonts.mono,
  },
  bar: {
    width: 32,
    borderRadius: 6,
    minHeight: 8,
    borderWidth: 1,
    borderColor: MagicColors.borderAmber,
  },
  barLabel: {
    fontSize: 9,
    color: MagicColors.textMuted,
    marginTop: 4,
    fontFamily: Fonts.body,
  },

  // Section
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: FontSizes.sectionHeader,
    fontWeight: FontWeights.bold,
    color: MagicColors.textPrimary,
    fontFamily: Fonts.heading,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    marginTop: 2,
    fontFamily: Fonts.body,
  },

  // Action Cards
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MagicColors.offWhiteSolid,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: MagicColors.borderLight,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 1,
      },
    }),
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: MagicColors.energyYellow + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionName: {
    fontSize: 15,
    fontWeight: FontWeights.semibold,
    color: MagicColors.textPrimary,
    fontFamily: Fonts.body,
  },
  actionDesc: {
    fontSize: 12,
    color: MagicColors.textSecondary,
    marginTop: 2,
    fontFamily: Fonts.body,
  },
  actionPoints: {
    alignItems: 'center',
    backgroundColor: MagicColors.energyYellow + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MagicColors.borderAmber,
  },
  actionPointsValue: {
    fontSize: 15,
    fontWeight: FontWeights.extrabold,
    color: MagicColors.goldDark,
    fontFamily: Fonts.mono,
  },
  actionPointsLabel: {
    fontSize: 10,
    color: MagicColors.goldDark,
    fontFamily: Fonts.body,
  },

  // Tips
  tipsCard: {
    backgroundColor: MagicColors.purple + '10',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: MagicColors.borderPurple,
  },
  tipsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: FontWeights.bold,
    color: MagicColors.purple,
    fontFamily: Fonts.heading,
  },
  tipsText: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    lineHeight: 19,
    fontFamily: Fonts.body,
  },
});
