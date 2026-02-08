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
import { GOOGLE_VISION_API_KEY, supabase } from '@/lib/supabase';
import {
  identifyMaterial,
  RecyclingMaterial,
} from '@/constants/recycling-data';
import { Ionicons } from '@expo/vector-icons';

type SpellStage = 'intro' | 'camera' | 'analyzing' | 'result' | 'proof' | 'verifying' | 'proof_failed' | 'uploading';

// ─── Recycling-bin verification keywords ───────────────────────────────
// Positive labels that strongly suggest a recycling bin (not a regular waste bin)
const RECYCLE_BIN_POSITIVE_LABELS: Record<string, number> = {
  'recycling bin': 10,
  'recycling': 6,
  'recycle': 6,
  'recyclable': 5,
  'recycling container': 10,
  'blue bin': 8,
  'green bin': 5,
  'waste sorting': 7,
  'separate collection': 7,
  'commingled recycling': 9,
  'recycling station': 9,
  'recycling center': 9,
  'recycling depot': 9,
  'bottle bank': 7,
  'can recycling': 8,
  'paper recycling': 8,
  'plastic recycling': 8,
  'glass recycling': 8,
  'waste container': 3,
  'waste bin': 2,
  'bin': 1,
  'container': 1,
  'bucket': 1,
  'blue': 2,
  'green': 1,
};

// Text found on recycling bins (case-insensitive matching)
const RECYCLE_BIN_TEXT_KEYWORDS = [
  'recycle', 'recyclables', 'recyclable', 'recycling',
  'cans', 'bottles', 'paper', 'plastic', 'glass', 'aluminum',
  'cardboard', 'mixed recycling', 'commingled', 'cans & bottles',
  'bottles & cans', 'single stream', 'containers only',
  '♻', // recycling symbol unicode
];

// Negative labels — if ONLY these appear, it's a regular trash bin
const TRASH_BIN_NEGATIVE_LABELS = [
  'trash', 'garbage', 'garbage bin', 'trash can', 'trash bin',
  'landfill', 'general waste', 'non-recyclable', 'rubbish',
  'refuse', 'dumpster',
];

/** Minimum score threshold to consider the proof photo valid */
const PROOF_SCORE_THRESHOLD = 5;

export default function RecycleScreen() {
  const [stage, setStage] = useState<SpellStage>('intro');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [proofPhotoUri, setProofPhotoUri] = useState<string | null>(null);
  const [proofPhotoBase64, setProofPhotoBase64] = useState<string | null>(null);
  const [material, setMaterial] = useState<RecyclingMaterial | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { logAction, user } = useAuth();

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
                  { type: 'LABEL_DETECTION', maxResults: 20 },
                  { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                  { type: 'TEXT_DETECTION', maxResults: 5 },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      // Check for API-level errors (invalid key, quota exceeded, etc.)
      if (data.error) {
        console.log('Vision API error response:', data.error);
        Alert.alert(
          'Analysis Failed',
          `Vision API error: ${data.error.message || 'Unknown error'}. Check your API key and billing.`
        );
        setAnalyzing(false);
        setStage('result');
        return;
      }

      if (data.responses && data.responses[0]) {
        const result = data.responses[0];

        // Check for per-request errors
        if (result.error) {
          console.log('Vision API request error:', result.error);
          Alert.alert(
            'Analysis Failed',
            `Vision API: ${result.error.message || 'Could not analyze image.'}`
          );
          setAnalyzing(false);
          setStage('result');
          return;
        }

        // Collect labels from both labelAnnotations and localizedObjectAnnotations
        const labels = (result.labelAnnotations || []).map(
          (l: { description: string }) => l.description
        );
        const objectLabels = (result.localizedObjectAnnotations || []).map(
          (o: { name: string }) => o.name
        );
        const allLabels = [...labels, ...objectLabels];

        const textAnnotations = (result.textAnnotations || []).map(
          (t: { description: string }) => t.description
        );

        console.log('Vision API labels:', labels);
        console.log('Vision API objects:', objectLabels);
        console.log('Vision API text:', textAnnotations);

        const identified = identifyMaterial(allLabels, textAnnotations);
        setMaterial(identified);
      } else {
        setMaterial(null);
      }
    } catch (err) {
      console.log('Vision API error:', err);
      Alert.alert(
        'Analysis Failed',
        'The vision spell encountered a network issue. Please check your connection and try again.'
      );
    }

    setAnalyzing(false);
    setStage('result');
  };

  const confirmRecycle = () => {
    if (!material) return;
    // Transition to proof camera so user can photograph item in recycling bin
    setStage('proof');
  };

  const takeProofPhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });

      if (photo) {
        setProofPhotoUri(photo.uri);
        setProofPhotoBase64(photo.base64 || null);
        setStage('verifying');
        verifyRecyclingBin(photo.base64 || '');
      }
    } catch (err) {
      console.log('Proof photo capture error:', err);
      Alert.alert('Spell Misfire', 'Failed to capture proof photo. Try again.');
    }
  };

  /**
   * Analyze the proof photo using Vision API to verify it shows a recycling bin,
   * not a regular trash/waste bin. Uses label detection, text detection, and
   * logo detection to look for recycling-specific indicators.
   */
  const verifyRecyclingBin = async (base64: string) => {
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
                  { type: 'LABEL_DETECTION', maxResults: 25 },
                  { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                  { type: 'TEXT_DETECTION', maxResults: 10 },
                  { type: 'LOGO_DETECTION', maxResults: 5 },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        console.log('Proof verification API error:', data.error);
        // If the API fails, allow the user through with a warning
        Alert.alert(
          'Verification Unavailable',
          'Could not verify the recycling bin photo. Proceeding anyway.'
        );
        setStage('uploading');
        uploadAndComplete(base64);
        return;
      }

      if (data.responses && data.responses[0]) {
        const result = data.responses[0];

        if (result.error) {
          console.log('Proof verification request error:', result.error);
          setStage('uploading');
          uploadAndComplete(base64);
          return;
        }

        // Gather all detected information
        const labels = (result.labelAnnotations || []).map(
          (l: { description: string; score: number }) => ({
            text: l.description.toLowerCase(),
            confidence: l.score,
          })
        );
        const objectLabels = (result.localizedObjectAnnotations || []).map(
          (o: { name: string; score: number }) => ({
            text: o.name.toLowerCase(),
            confidence: o.score,
          })
        );
        const textAnnotations = (result.textAnnotations || []).map(
          (t: { description: string }) => t.description.toLowerCase()
        );
        const logoAnnotations = (result.logoAnnotations || []).map(
          (l: { description: string }) => l.description.toLowerCase()
        );

        const allDetected = [...labels, ...objectLabels];
        const allText = textAnnotations.join(' ');

        console.log('Proof - Labels:', labels.map(l => l.text));
        console.log('Proof - Objects:', objectLabels.map(o => o.text));
        console.log('Proof - Text:', textAnnotations);
        console.log('Proof - Logos:', logoAnnotations);

        // ── Score calculation ──
        let score = 0;

        // 1) Check labels against positive recycling-bin keywords
        for (const item of allDetected) {
          for (const [keyword, weight] of Object.entries(RECYCLE_BIN_POSITIVE_LABELS)) {
            if (item.text.includes(keyword)) {
              score += weight * item.confidence;
            }
          }
        }

        // 2) Check detected text for recycling keywords
        for (const keyword of RECYCLE_BIN_TEXT_KEYWORDS) {
          if (allText.includes(keyword)) {
            score += 6; // text on the bin itself is strong evidence
          }
        }

        // 3) Check logos for recycling symbol
        for (const logo of logoAnnotations) {
          if (
            logo.includes('recycl') ||
            logo.includes('♻') ||
            logo.includes('recycle') ||
            logo.includes('green dot')
          ) {
            score += 8;
          }
        }

        // 4) Penalty if trash-only labels detected
        let hasTrashLabel = false;
        let hasRecycleLabel = false;
        for (const item of allDetected) {
          for (const trashWord of TRASH_BIN_NEGATIVE_LABELS) {
            if (item.text.includes(trashWord)) {
              hasTrashLabel = true;
            }
          }
          // Check if any recycling-specific label exists alongside
          if (
            item.text.includes('recycl') ||
            item.text.includes('recycle') ||
            item.text.includes('recyclable')
          ) {
            hasRecycleLabel = true;
          }
        }

        // If trash labels found but no recycling labels, apply a penalty
        if (hasTrashLabel && !hasRecycleLabel) {
          score -= 10;
        }

        console.log(`Proof verification score: ${score} (threshold: ${PROOF_SCORE_THRESHOLD})`);

        if (score >= PROOF_SCORE_THRESHOLD) {
          // Verified! Proceed to upload
          setStage('uploading');
          uploadAndComplete(base64);
        } else {
          // Failed verification
          setStage('proof_failed');
        }
      } else {
        // No response — let through with warning
        setStage('uploading');
        uploadAndComplete(base64);
      }
    } catch (err) {
      console.log('Proof verification network error:', err);
      // On network failure, allow through
      Alert.alert(
        'Verification Unavailable',
        'Network issue during verification. Proceeding anyway.'
      );
      setStage('uploading');
      uploadAndComplete(base64);
    }
  };

  const uploadAndComplete = async (proofBase64: string) => {
    if (!material || !user) return;

    let scanImagePath: string | null = null;
    let proofImagePath: string | null = null;

    try {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}_${Math.random().toString(36).substring(2, 10)}`;

      // Upload the scan photo
      if (photoBase64) {
        const scanFileName = `${user.id}/scan_${timestamp}_${uniqueId}.jpg`;
        const scanBlob = base64ToBlob(photoBase64, 'image/jpeg');

        const { error: scanError } = await supabase.storage
          .from('photos')
          .upload(scanFileName, scanBlob, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (scanError) {
          console.log('Scan photo upload error:', scanError);
        } else {
          scanImagePath = scanFileName;
        }
      }

      // Upload the proof photo
      if (proofBase64) {
        const proofFileName = `${user.id}/proof_${timestamp}_${uniqueId}.jpg`;
        const proofBlob = base64ToBlob(proofBase64, 'image/jpeg');

        const { error: proofError } = await supabase.storage
          .from('photos')
          .upload(proofFileName, proofBlob, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (proofError) {
          console.log('Proof photo upload error:', proofError);
        } else {
          proofImagePath = proofFileName;
        }
      }
    } catch (err) {
      console.log('Photo upload failed (storage may not be configured):', err);
    }

    // Log the action with image paths (points are awarded even if upload fails)
    await logAction(
      'recycle',
      {
        material_name: material.name,
        material_type: material.type,
        co2_saved: material.co2SavedKg,
        scan_image: scanImagePath,
        proof_image: proofImagePath,
      },
      material.points,
      proofImagePath || scanImagePath || undefined
    );

    setShowSuccess(true);
  };

  /** Convert a base64 string to a Blob for Supabase Storage upload */
  const base64ToBlob = (base64: string, contentType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  };

  const resetSpell = () => {
    setStage('intro');
    setPhotoUri(null);
    setPhotoBase64(null);
    setProofPhotoUri(null);
    setProofPhotoBase64(null);
    setMaterial(null);
    setShowSuccess(false);
  };

  const isCamera = stage === 'camera' || stage === 'proof';

  // Camera permission not yet determined
  if (isCamera && !permission?.granted) {
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
      {isCamera ? (
        // Camera View (scan or proof)
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
                  <Ionicons
                    name={stage === 'proof' ? 'checkmark-circle' : 'leaf'}
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.scanTitle}>
                    {stage === 'proof' ? 'Proof of Recycling' : 'Recyclify Reveal'}
                  </Text>
                </View>
                <Text style={styles.scanSubtitle}>
                  {stage === 'proof'
                    ? 'Photograph the item in the recycling bin'
                    : 'Center the item or its recycling symbol'}
                </Text>
                {stage === 'proof' && (
                  <View style={styles.proofBadge}>
                    <Ionicons name="camera" size={14} color={MagicColors.recycleGreen} />
                    <Text style={styles.proofBadgeText}>
                      Show your recycled {material?.name || 'item'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Targeting reticle */}
              <View style={styles.reticle}>
                <View style={[styles.corner, styles.cornerTL, stage === 'proof' && styles.cornerProofColor]} />
                <View style={[styles.corner, styles.cornerTR, stage === 'proof' && styles.cornerProofColor]} />
                <View style={[styles.corner, styles.cornerBL, stage === 'proof' && styles.cornerProofColor]} />
                <View style={[styles.corner, styles.cornerBR, stage === 'proof' && styles.cornerProofColor]} />
              </View>

              <View style={styles.cameraActions}>
                <MagicButton
                  title={stage === 'proof' ? 'Skip' : 'Cancel'}
                  variant="outline"
                  size="small"
                  onPress={() => {
                    if (stage === 'proof') {
                      // Skip proof — go back to result screen
                      setStage('result');
                    } else {
                      setStage('intro');
                    }
                  }}
                />
                <MagicButton
                  title={stage === 'proof' ? 'Take Proof Photo' : 'Cast Spell'}
                  iconName={stage === 'proof' ? 'camera' : 'sparkles'}
                  size="large"
                  onPress={stage === 'proof' ? takeProofPhoto : takePhoto}
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

          {stage === 'verifying' && (
            <View style={styles.analyzingContainer}>
              {proofPhotoUri && (
                <Image source={{ uri: proofPhotoUri }} style={styles.previewImage} />
              )}
              <ActivityIndicator
                size="large"
                color={MagicColors.recycleGreen}
                style={{ marginTop: 24 }}
              />
              <View style={styles.analyzingTextRow}>
                <Ionicons name="shield-checkmark" size={20} color={MagicColors.recycleGreen} />
                <Text style={styles.analyzingText}>
                  Verifying Recycling Bin...
                </Text>
              </View>
              <Text style={styles.analyzingSubtext}>
                Checking that this is a proper recycling bin
              </Text>
            </View>
          )}

          {stage === 'proof_failed' && (
            <View style={styles.resultContainer}>
              {proofPhotoUri && (
                <Image source={{ uri: proofPhotoUri }} style={styles.previewImage} />
              )}

              <View style={[styles.resultBadge, styles.resultNotRecyclable]}>
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={MagicColors.crimson}
                  style={styles.resultBadgeIcon}
                />
                <Text style={styles.resultBadgeText}>
                  Not a Recycling Bin
                </Text>
              </View>

              <View style={styles.proofFailedBox}>
                <Ionicons name="warning" size={32} color={MagicColors.goldDark} style={{ marginBottom: 8 }} />
                <Text style={styles.proofFailedTitle}>
                  Verification Failed
                </Text>
                <Text style={styles.proofFailedText}>
                  We couldn't confirm this is a recycling bin. Please make sure:{'\n\n'}
                  • The recycling bin or its recycling symbol is visible{'\n'}
                  • Any text like "Recycle" or "Recyclables" is in the photo{'\n'}
                  • It's not a regular trash or garbage bin{'\n\n'}
                  Try again with a clearer photo of the recycling bin.
                </Text>
              </View>

              <View style={styles.resultActions}>
                <MagicButton
                  title="Retake Proof Photo"
                  iconName="camera"
                  onPress={() => setStage('proof')}
                  size="large"
                  variant="emerald"
                  style={{ width: '100%' }}
                />
                <MagicButton
                  title="Scan a Different Item"
                  variant="outline"
                  iconName="refresh"
                  onPress={resetSpell}
                  size="large"
                  style={{ width: '100%' }}
                />
              </View>
            </View>
          )}

          {stage === 'uploading' && (
            <View style={styles.analyzingContainer}>
              {/* Show both photos side by side */}
              <View style={styles.proofPhotosRow}>
                {photoUri && (
                  <View style={styles.proofPhotoWrapper}>
                    <Text style={styles.proofPhotoLabel}>Scan</Text>
                    <Image source={{ uri: photoUri }} style={styles.proofPhotoSmall} />
                  </View>
                )}
                {proofPhotoUri && (
                  <View style={styles.proofPhotoWrapper}>
                    <Text style={styles.proofPhotoLabel}>Proof</Text>
                    <Image source={{ uri: proofPhotoUri }} style={styles.proofPhotoSmall} />
                  </View>
                )}
              </View>
              <ActivityIndicator
                size="large"
                color={MagicColors.recycleGreen}
                style={{ marginTop: 24 }}
              />
              <View style={styles.analyzingTextRow}>
                <Ionicons name="cloud-upload" size={20} color={MagicColors.recycleGreen} />
                <Text style={styles.analyzingText}>
                  Completing Spell...
                </Text>
              </View>
              <Text style={styles.analyzingSubtext}>
                Uploading proof and awarding your GHG points
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
                        style={{ width: '100%' }}
                      />
                    )}
                    <MagicButton
                      title="Scan Again"
                      variant="outline"
                      iconName="refresh"
                      onPress={resetSpell}
                      size="large"
                      style={{ width: '100%' }}
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
    flexDirection: 'column',
    gap: 10,
  },

  // Proof camera
  proofBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  proofBadgeText: {
    fontSize: 13,
    color: '#fff',
    fontFamily: Fonts.body,
    fontWeight: FontWeights.semibold,
  },
  cornerProofColor: {
    borderColor: MagicColors.recycleGreen,
  },

  // Uploading / proof photos
  proofPhotosRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 4,
  },
  proofPhotoWrapper: {
    alignItems: 'center',
  },
  proofPhotoLabel: {
    fontSize: 12,
    fontWeight: FontWeights.semibold,
    color: MagicColors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: Fonts.body,
  },
  proofPhotoSmall: {
    width: 150,
    height: 150,
    borderRadius: 16,
    backgroundColor: MagicColors.offWhiteSolid,
    borderWidth: 2,
    borderColor: MagicColors.borderLight,
  },

  // Proof failed
  proofFailedBox: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
    padding: 20,
    backgroundColor: MagicColors.crimson + '08',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: MagicColors.crimson + '40',
  },
  proofFailedTitle: {
    fontSize: 20,
    fontWeight: FontWeights.bold,
    color: MagicColors.textPrimary,
    marginBottom: 10,
    fontFamily: Fonts.heading,
  },
  proofFailedText: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    lineHeight: 22,
    fontFamily: Fonts.body,
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
