import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MagicColors, Fonts, FontWeights, FontSizes } from '@/constants/theme';
import { MagicButton } from '@/components/MagicButton';
import { SuccessModal } from '@/components/SuccessModal';
import { useAuth } from '@/contexts/AuthContext';
import { GOOGLE_VISION_API_KEY } from '@/lib/supabase';
import {
  identifyMaterial,
  RecyclingMaterial,
} from '@/constants/recycling-data';
import { Ionicons } from '@expo/vector-icons';

type SpellStage = 'intro' | 'camera' | 'analyzing' | 'result';

export default function RecycleScreen() {
  const [stage, setStage] = useState<SpellStage>('intro');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [material, setMaterial] = useState<RecyclingMaterial | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { logAction } = useAuth();

  const startScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera Permission Required',
          'The Recyclify Reveal spell needs camera access to identify items.'
        );
        return;
      }
    }
    setStage('camera');
    setPhotoUri(null);
    setPhotoBase64(null);
    setMaterial(null);
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });

      if (photo) {
        setPhotoUri(photo.uri);
        setPhotoBase64(photo.base64 || null);
        setStage('analyzing');
        analyzeImage(photo.base64 || '');
      }
    } catch (err) {
      console.log('Photo capture error:', err);
      Alert.alert('Spell Misfire', 'Failed to capture image. Try again.');
    }
  };

  const analyzeImage = async (base64: string) => {
    setAnalyzing(true);

    try {
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64 },
                features: [
                  { type: 'LABEL_DETECTION', maxResults: 15 },
                  { type: 'TEXT_DETECTION', maxResults: 5 },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (data.responses && data.responses[0]) {
        const result = data.responses[0];
        const labels = (result.labelAnnotations || []).map(
          (l: { description: string }) => l.description
        );
        const textAnnotations = (result.textAnnotations || []).map(
          (t: { description: string }) => t.description
        );

        console.log('Vision API labels:', labels);
        console.log('Vision API text:', textAnnotations);

        const identified = identifyMaterial(labels, textAnnotations);
        setMaterial(identified);
      } else {
        setMaterial(null);
      }
    } catch (err) {
      console.log('Vision API error:', err);
      Alert.alert(
        'Analysis Failed',
        'The vision spell encountered an issue. Please try again.'
      );
    }

    setAnalyzing(false);
    setStage('result');
  };

  const confirmRecycle = async () => {
    if (!material) return;

    await logAction(
      'recycle',
      {
        material_name: material.name,
        material_type: material.type,
        co2_saved: material.co2SavedKg,
      },
      material.points
    );

    setShowSuccess(true);
  };

  const resetSpell = () => {
    setStage('intro');
    setPhotoUri(null);
    setPhotoBase64(null);
    setMaterial(null);
    setShowSuccess(false);
  };

  // Camera permission not yet determined
  if (stage === 'camera' && !permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <View style={styles.permissionIconContainer}>
            <Ionicons name="camera" size={56} color={MagicColors.textSecondary} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            Grant camera permission to cast the Recyclify Reveal spell.
          </Text>
          <MagicButton
            title="Grant Permission"
            iconName="checkmark-circle"
            onPress={requestPermission}
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {stage === 'camera' ? (
        // Camera View
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          >
            {/* Magical overlay */}
            <View style={styles.cameraOverlay}>
              <View style={styles.scanHeader}>
                <View style={styles.scanTitleRow}>
                  <Ionicons name="leaf" size={24} color="#fff" />
                  <Text style={styles.scanTitle}>Recyclify Reveal</Text>
                </View>
                <Text style={styles.scanSubtitle}>
                  Center the item or its recycling symbol
                </Text>
              </View>

              {/* Targeting reticle */}
              <View style={styles.reticle}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>

              <View style={styles.cameraActions}>
                <MagicButton
                  title="Cancel"
                  variant="outline"
                  size="small"
                  onPress={() => setStage('intro')}
                />
                <MagicButton
                  title="Cast Spell"
                  iconName="sparkles"
                  size="large"
                  onPress={takePhoto}
                />
                <View style={{ width: 80 }} />
              </View>
            </View>
          </CameraView>
        </View>
      ) : (
        // Non-camera content
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {stage === 'intro' && (
            <>
              {/* Spell Header */}
              <View style={styles.spellHeader}>
                <View style={styles.spellIconContainer}>
                  <Ionicons name="leaf" size={56} color={MagicColors.textLight} />
                </View>
                <Text style={styles.spellTitle}>Recyclify Reveal</Text>
                <Text style={styles.spellSubtitle}>
                  Recycling Identification Spell
                </Text>
                <Text style={styles.spellDescription}>
                  Point your camera at any item to magically discover if it
                  is recyclable. Earn GHG points for every item you recycle!
                </Text>
              </View>

              {/* How it works */}
              <View style={styles.stepsContainer}>
                <Text style={styles.stepsTitle}>How to Cast</Text>

                <View style={styles.step}>
                  <View style={[styles.stepNumber, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                    <Text style={[styles.stepNumberText, { color: MagicColors.textLight }]}>1</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Scan the Item</Text>
                    <Text style={styles.stepDesc}>
                      Point your camera at a recyclable item or its recycling
                      symbol.
                    </Text>
                  </View>
                </View>

                <View style={styles.step}>
                  <View style={[styles.stepNumber, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                    <Text style={[styles.stepNumberText, { color: MagicColors.textLight }]}>2</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Discover Its Fate</Text>
                    <Text style={styles.stepDesc}>
                      Our AI magic identifies the material and tells you
                      how to properly recycle it.
                    </Text>
                  </View>
                </View>

                <View style={styles.step}>
                  <View style={[styles.stepNumber, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                    <Text style={[styles.stepNumberText, { color: MagicColors.textLight }]}>3</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Cast & Earn</Text>
                    <Text style={styles.stepDesc}>
                      Confirm you recycled the item and earn GHG points for
                      saving the planet!
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.castButtonContainer}>
                <MagicButton
                  title="Begin Spell"
                  iconName="camera"
                  onPress={startScan}
                  size="large"
                  variant="emerald"
                  style={{ width: '100%' }}
                />
              </View>
            </>
          )}

          {stage === 'analyzing' && (
            <View style={styles.analyzingContainer}>
              {photoUri && (
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
              )}
              <ActivityIndicator
                size="large"
                color={MagicColors.recycleGreen}
                style={{ marginTop: 24 }}
              />
              <View style={styles.analyzingTextRow}>
                <Ionicons name="sparkles" size={20} color={MagicColors.recycleGreen} />
                <Text style={styles.analyzingText}>
                  Casting Recyclify Reveal...
                </Text>
              </View>
              <Text style={styles.analyzingSubtext}>
                Analyzing the magical essence of this item
              </Text>
            </View>
          )}

          {stage === 'result' && (
            <View style={styles.resultContainer}>
              {photoUri && (
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
              )}

              {material ? (
                <>
                  <View
                    style={[
                      styles.resultBadge,
                      material.recyclable
                        ? styles.resultRecyclable
                        : styles.resultNotRecyclable,
                    ]}
                  >
                    <Ionicons 
                      name={material.recyclable ? "checkmark-circle" : "close-circle"} 
                      size={24} 
                      color={material.recyclable ? MagicColors.successGreen : MagicColors.crimson}
                      style={styles.resultBadgeIcon}
                    />
                    <Text style={styles.resultBadgeText}>
                      {material.recyclable ? 'Recyclable!' : 'Not Recyclable'}
                    </Text>
                  </View>

                  <Text style={styles.materialName}>{material.name}</Text>
                  <Text style={styles.materialInstructions}>
                    {material.instructions}
                  </Text>

                  {material.recyclable && (
                    <View style={styles.impactBox}>
                      <View style={styles.impactTitleRow}>
                        <Ionicons name="leaf" size={20} color={MagicColors.emeraldDeep} />
                        <Text style={styles.impactTitle}>
                          Environmental Impact
                        </Text>
                      </View>
                      <Text style={styles.impactText}>
                        Recycling this item saves ~{material.co2SavedKg} kg CO₂
                        {'\n'}You will earn{' '}
                        <Text style={{ color: MagicColors.gold, fontWeight: FontWeights.bold }}>
                          +{material.points} GHG points
                        </Text>
                      </Text>
                    </View>
                  )}

                  <View style={styles.funFactBox}>
                    <Ionicons name="bulb" size={18} color={MagicColors.goldDark} style={{ marginRight: 8 }} />
                    <Text style={styles.funFactText}>
                      {material.funFact}
                    </Text>
                  </View>

                  <View style={styles.resultActions}>
                    {material.recyclable && (
                      <MagicButton
                        title="Confirm Recycled!"
                        iconName="checkmark-circle"
                        onPress={confirmRecycle}
                        size="large"
                        variant="emerald"
                        style={{ flex: 1, marginRight: 8 }}
                      />
                    )}
                    <MagicButton
                      title="Scan Again"
                      variant="outline"
                      iconName="refresh"
                      onPress={resetSpell}
                      size="large"
                      style={{ flex: material.recyclable ? 0.6 : 1 }}
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.noResultBox}>
                    <Ionicons name="search" size={48} color={MagicColors.textMuted} style={{ marginBottom: 12 }} />
                    <Text style={styles.noResultTitle}>
                      Item Not Recognized
                    </Text>
                    <Text style={styles.noResultText}>
                      The spell could not identify this item. Try getting
                      closer to the recycling symbol or try a different angle.
                    </Text>
                  </View>
                  <MagicButton
                    title="Try Again"
                    iconName="refresh"
                    onPress={resetSpell}
                    size="large"
                    style={{ marginTop: 20 }}
                  />
                </>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccess}
        title="Spell Cast Successfully!"
        message={
          material
            ? `You recycled ${material.name}! The planet thanks you, wizard.`
            : 'Great recycling effort!'
        }
        pointsAwarded={material?.points || 0}
        co2Saved={`${material?.co2SavedKg || 0} kg`}
        funFact={material?.funFact}
        onClose={resetSpell}
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
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  // Spell Header
  spellHeader: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 20,
  },
  spellIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: MagicColors.cardGreen,
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
    color: MagicColors.recycleGreen,
    fontWeight: FontWeights.semibold,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: Fonts.body,
  },
  spellDescription: {
    fontSize: 15,
    color: MagicColors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 10,
    fontFamily: Fonts.body,
  },

  // Steps
  stepsContainer: {
    backgroundColor: MagicColors.cardGreen,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
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
  stepsTitle: {
    fontSize: FontSizes.cardTitle,
    fontWeight: FontWeights.bold,
    color: MagicColors.textPrimary,
    marginBottom: 16,
    fontFamily: Fonts.heading,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.mono,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: FontWeights.semibold,
    color: MagicColors.textPrimary,
    fontFamily: Fonts.body,
  },
  stepDesc: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
    fontFamily: Fonts.body,
  },

  // Cast button
  castButtonContainer: {
    paddingHorizontal: 4,
  },

  // Camera
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 20,
  },
  scanHeader: {
    alignItems: 'center',
    paddingTop: 50,
  },
  scanTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanTitle: {
    fontSize: 22,
    fontWeight: FontWeights.bold,
    color: '#fff',
    fontFamily: Fonts.heading,
  },
  scanSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontFamily: Fonts.body,
  },
  reticle: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: MagicColors.gold,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  cameraActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 30,
  },

  // Permission
  permissionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: MagicColors.textSecondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: FontWeights.bold,
    color: MagicColors.textPrimary,
    marginBottom: 8,
    fontFamily: Fonts.heading,
  },
  permissionText: {
    fontSize: 15,
    color: MagicColors.textSecondary,
    textAlign: 'center',
    fontFamily: Fonts.body,
  },

  // Analyzing
  analyzingContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    backgroundColor: MagicColors.offWhiteSolid,
    borderWidth: 2,
    borderColor: MagicColors.borderLight,
  },
  analyzingTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  analyzingText: {
    fontSize: 20,
    fontWeight: FontWeights.bold,
    color: MagicColors.recycleGreen,
    fontFamily: Fonts.heading,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    marginTop: 4,
    fontFamily: Fonts.body,
  },

  // Result
  resultContainer: {
    paddingTop: 10,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 12,
    borderWidth: 2,
  },
  resultRecyclable: {
    backgroundColor: MagicColors.successGreen + '15',
    borderColor: MagicColors.borderEmerald,
  },
  resultNotRecyclable: {
    backgroundColor: MagicColors.crimson + '15',
    borderColor: MagicColors.crimson,
  },
  resultBadgeIcon: {
    marginRight: 8,
  },
  resultBadgeText: {
    fontSize: 18,
    fontWeight: FontWeights.bold,
    color: MagicColors.textPrimary,
    fontFamily: Fonts.heading,
  },
  materialName: {
    fontSize: 22,
    fontWeight: FontWeights.bold,
    color: MagicColors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Fonts.heading,
  },
  materialInstructions: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 10,
    fontFamily: Fonts.body,
  },
  impactBox: {
    backgroundColor: MagicColors.emeraldDeep + '10',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: MagicColors.borderEmerald,
  },
  impactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  impactTitle: {
    fontSize: 15,
    fontWeight: FontWeights.bold,
    color: MagicColors.emeraldDeep,
    fontFamily: Fonts.heading,
  },
  impactText: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    lineHeight: 22,
    fontFamily: Fonts.body,
  },
  funFactBox: {
    flexDirection: 'row',
    backgroundColor: MagicColors.gold + '10',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: MagicColors.borderAmber,
    alignItems: 'center',
  },
  funFactText: {
    flex: 1,
    fontSize: 13,
    color: MagicColors.textPrimary,
    lineHeight: 18,
    fontFamily: Fonts.body,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 8,
  },

  // No result
  noResultBox: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: MagicColors.offWhiteSolid,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: MagicColors.borderLight,
  },
  noResultTitle: {
    fontSize: 20,
    fontWeight: FontWeights.bold,
    color: MagicColors.textPrimary,
    marginBottom: 8,
    fontFamily: Fonts.heading,
  },
  noResultText: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: Fonts.body,
  },
});
