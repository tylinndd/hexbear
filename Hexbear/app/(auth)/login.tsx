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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Spell Incomplete', 'Please enter both email and password incantation.');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Access Denied', error);
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
          <Text style={styles.subtitle}>Enter the Sanctum</Text>
          <Text style={styles.description}>
            Welcome back, wizard. Cast your credentials to resume your quest.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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
              placeholder="Enter your secret spell..."
              placeholderTextColor={MagicColors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <MagicButton
            title="Enter the Sanctum"
            icon="🏰"
            onPress={handleLogin}
            loading={loading}
            size="large"
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>New to the Order? </Text>
          <Link href="/(auth)/signup" style={styles.footerLink}>
            Join the EcoMages
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
    marginBottom: 40,
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
