import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MagicColors } from '@/constants/theme';
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

interface EnergyReading {
  kWh: number;
  co2: number;
  points: number;
  date: string;
}

export default function EnergyScreen() {
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
          <Text style={styles.spellIcon}>{'⚡'}</Text>
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
          <Text style={styles.cardTitle}>
            {'🔮'}  Monthly Energy Reading
          </Text>
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
            icon="⚡"
            onPress={submitMonthlyReading}
            variant="secondary"
            size="large"
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Energy History Bar Chart */}
        {readings.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {'📊'}  Energy History
            </Text>
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
          <Text style={styles.sectionTitle}>
            {'✨'}  Quick Energy Spells
          </Text>
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
            <Text style={styles.actionIcon}>{action.icon}</Text>
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
          <Text style={styles.tipsTitle}>
            {'🧙'}  Wizard Tip
          </Text>
          <Text style={styles.tipsText}>
            Switching to LED bulbs can save up to 75% of lighting energy.
            That is a powerful spell for your electricity bill and the
            planet!
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
    backgroundColor: MagicColors.darkBg,
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
  spellIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  spellTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: MagicColors.textPrimary,
  },
  spellSubtitle: {
    fontSize: 14,
    color: MagicColors.energyYellow,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  spellDescription: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  // Card
  card: {
    backgroundColor: MagicColors.darkCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: MagicColors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MagicColors.textPrimary,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  kWhInput: {
    flex: 1,
    backgroundColor: MagicColors.darkSurface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 20,
    fontWeight: '700',
    color: MagicColors.textPrimary,
    borderWidth: 1,
    borderColor: MagicColors.border,
    textAlign: 'center',
  },
  kWhUnit: {
    fontSize: 18,
    fontWeight: '700',
    color: MagicColors.textSecondary,
  },
  avgNote: {
    fontSize: 12,
    color: MagicColors.textMuted,
    textAlign: 'center',
    marginTop: 8,
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
  },
  bar: {
    width: 32,
    borderRadius: 6,
    minHeight: 8,
  },
  barLabel: {
    fontSize: 9,
    color: MagicColors.textMuted,
    marginTop: 4,
  },

  // Section
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MagicColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    marginTop: 2,
  },

  // Action Cards
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MagicColors.darkCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: MagicColors.border,
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionName: {
    fontSize: 15,
    fontWeight: '600',
    color: MagicColors.textPrimary,
  },
  actionDesc: {
    fontSize: 12,
    color: MagicColors.textSecondary,
    marginTop: 2,
  },
  actionPoints: {
    alignItems: 'center',
    backgroundColor: MagicColors.energyYellow + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  actionPointsValue: {
    fontSize: 15,
    fontWeight: '800',
    color: MagicColors.energyYellow,
  },
  actionPointsLabel: {
    fontSize: 10,
    color: MagicColors.energyYellow,
  },

  // Tips
  tipsCard: {
    backgroundColor: MagicColors.mysticDark + '20',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: MagicColors.mysticDark + '30',
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: MagicColors.mysticLight,
    marginBottom: 6,
  },
  tipsText: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    lineHeight: 19,
  },
});
