import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { MagicColors } from '@/constants/theme';
import { MagicButton } from '@/components/MagicButton';
import { useAuth } from '@/contexts/AuthContext';
import { LottieAnimation } from '@/components/LottieAnimation';

export default function SignUpScreen() {
  const [wizardName, setWizardName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!wizardName.trim()) {
      Alert.alert('Spell Incomplete', 'Every wizard needs a name!');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Spell Incomplete', 'We need your email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert(
        'Weak Incantation',
        'Your password must be at least 6 characters long.'
      );
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password, wizardName.trim());
    setLoading(false);

    if (error) {
      Alert.alert('Enrollment Failed', error);
    }
    // No email verification alert -- user is signed in automatically
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.header}>
          <View style={styles.animationContainer}>
            <LottieAnimation
              source={require('@/assets/animations/magician.json')}
              loop={true}
              autoPlay={true}
              style={styles.lottieAnimation}
            />
          </View>
          <Text style={styles.appName}>Hexbear</Text>
          <Text style={styles.subtitle}>Join the Order of EcoMages</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Wizard Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Choose your wizard name..."
              placeholderTextColor={MagicColors.textMuted}
              value={wizardName}
              onChangeText={setWizardName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              placeholderTextColor={MagicColors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters..."
              placeholderTextColor={MagicColors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Text style={styles.inputHint}>
              Must be at least 6 characters.
            </Text>
          </View>

          <MagicButton
            title="Join the Order"
            onPress={handleSignUp}
            loading={loading}
            size="large"
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already an EcoMage? </Text>
          <Link href="/(auth)/login" style={styles.footerLink}>
            Enter the Sanctum
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 50,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  appName: {
    fontSize: 52,
    fontWeight: '800',
    color: MagicColors.gold,
    letterSpacing: 2,
    marginTop: 16,
    fontFamily: Platform.OS === 'ios' ? 'Baskerville-Bold' : 'serif',
  },
  subtitle: {
    fontSize: 19,
    color: '#7ED957',
    marginTop: 6,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Baskerville' : 'serif',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: MagicColors.textPrimary,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: MagicColors.textPrimary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputHint: {
    fontSize: 12,
    color: MagicColors.textMuted,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: MagicColors.textSecondary,
    fontSize: 15,
  },
  footerLink: {
    color: MagicColors.gold,
    fontSize: 15,
    fontWeight: '700',
  },
});
