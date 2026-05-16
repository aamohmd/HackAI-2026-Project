import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { Link, useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import { Gavel, Fingerprint } from 'phosphor-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const auth = useContext(AuthContext);
  const router = useRouter();

  if (!auth) return null;

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      setError('Both fields are required');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await auth.login(phoneNumber, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F4E9' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <StyledView className="flex-1 px-6 pt-8 pb-8 justify-between">
          <StyledView>
            <StyledView className="items-center mb-12">
              <StyledView className="w-20 h-20 rounded-full bg-wax items-center justify-center shadow-lg mb-6">
                <Gavel size={40} color="white" weight="fill" />
              </StyledView>
              <StyledText className="text-3xl font-bold text-midnight uppercase tracking-[4] font-serif text-center">
                Mizan
              </StyledText>
              <StyledText className="text-midnight/40 italic mt-2 font-serif text-center">
                Access your dossiers
              </StyledText>
            </StyledView>

            <StyledView className="space-y-6">
              <StyledView>
                <StyledText className="text-[10px] font-bold text-midnight/40 uppercase tracking-[2] mb-2 ml-1 font-sans">
                  Phone Number
                </StyledText>
                <StyledTextInput
                  placeholder="06..."
                  placeholderTextColor="#1E293B40"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  className="bg-white/50 border-2 border-midnight/10 p-4 rounded-lg text-midnight font-serif text-lg"
                />
              </StyledView>

              <StyledView className="mt-4">
                <StyledText className="text-[10px] font-bold text-midnight/40 uppercase tracking-[2] mb-2 ml-1 font-sans">
                  Password
                </StyledText>
                <StyledTextInput
                  placeholder="••••••••"
                  placeholderTextColor="#1E293B40"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className="bg-white/50 border-2 border-midnight/10 p-4 rounded-lg text-midnight font-serif text-lg"
                />
              </StyledView>

              {error && (
                <StyledText className="text-wax text-xs mt-4 font-sans font-bold uppercase tracking-[-0.5] text-center">
                  {error}
                </StyledText>
              )}

              <StyledView className="flex-row justify-between mt-4 px-1">
                <StyledTouchableOpacity>
                  <StyledText className="text-midnight/40 text-[10px] font-bold uppercase tracking-[1] font-sans">
                    Forgot Password?
                  </StyledText>
                </StyledTouchableOpacity>
                <StyledTouchableOpacity>
                  <StyledText className="text-midnight/40 text-[10px] font-bold uppercase tracking-[1] font-sans">
                    System Help
                  </StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            </StyledView>
          </StyledView>


          <StyledView className="mt-12">
            <StyledTouchableOpacity
              onPress={handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.8}
              className="bg-midnight p-5 rounded-lg flex-row items-center justify-center shadow-md"
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Fingerprint size={20} color="white" weight="bold" className="mr-2" />
                  <StyledText className="text-white font-bold uppercase tracking-[4] ml-2 font-sans">
                    Identify Self
                  </StyledText>
                </>
              )}
            </StyledTouchableOpacity>

            <StyledView className="flex-row justify-center mt-8">
              <StyledText className="text-midnight/50 font-serif">New claimant? </StyledText>
              <Link href="/(auth)/register" asChild>
                <StyledTouchableOpacity>
                  <StyledText className="text-wax font-bold uppercase tracking-[2] text-xs font-sans">
                    Register Here
                  </StyledText>
                </StyledTouchableOpacity>
              </Link>
            </StyledView>
          </StyledView>
        </StyledView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
