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
      Alert.alert('Spell Incomplete', 'We need your magical email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert(
        'Weak Incantation',
        'Your password incantation must be at least 6 characters long.'
      );
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password, wizardName.trim());
    setLoading(false);

    if (error) {
      Alert.alert('Enrollment Failed', error);
    } else {
      Alert.alert(
        'Welcome, Apprentice! 🧙',
        'Your wizard enrollment is complete. Check your email to verify your account, then enter the Sanctum!'
      );
    }
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appIcon}>{'🐻'}</Text>
          <Text style={styles.appName}>Hexbear</Text>
          <Text style={styles.subtitle}>Join the Order of EcoMages</Text>
          <Text style={styles.description}>
            Enroll as an apprentice wizard and begin your quest to save the
            planet with magical eco-spells!
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{'🧙'}  Wizard Name</Text>
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
            <Text style={styles.inputLabel}>{'📧'}  Email</Text>
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
            <Text style={styles.inputLabel}>{'🔐'}  Password Incantation</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters..."
              placeholderTextColor={MagicColors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Text style={styles.inputHint}>
              Your incantation must be at least 6 characters to be powerful
              enough.
            </Text>
          </View>

          <MagicButton
            title="Join the Order"
            icon="✨"
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
    backgroundColor: MagicColors.darkBg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  appIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: MagicColors.gold,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: MagicColors.emerald,
    marginTop: 8,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 10,
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
    backgroundColor: MagicColors.darkSurface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: MagicColors.textPrimary,
    borderWidth: 1,
    borderColor: MagicColors.border,
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
