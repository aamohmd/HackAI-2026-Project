import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { Link, useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import { UserPlus, WhatsappLogo, CheckCircle } from 'phosphor-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function RegisterScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  const auth = useContext(AuthContext);
  const router = useRouter();

  if (!auth) return null;

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }

    setError(null);
    setIsSendingOtp(true);
    try {
      await auth.sendOtp(phoneNumber);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRegister = async () => {
    if (!phoneNumber || !otp || !password) {
      setError('All fields are required');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await auth.register(phoneNumber, password, otp);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Verify your code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-parchment-100"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <StyledView className="flex-1 px-8 pt-16 pb-10 justify-between">
          <StyledView>
            <StyledView className="items-center mb-10">
              <StyledView className="w-16 h-1 bg-wax mb-8 rounded-full" />
              <StyledText className="text-3xl font-bold text-midnight uppercase tracking-[4] font-serif text-center">
                New Dossier
              </StyledText>
              <StyledText className="text-midnight/40 italic mt-2 font-serif text-center">
                Establish your legal identity
              </StyledText>
            </StyledView>

            <StyledView className="space-y-6">
              <StyledView>
                <StyledText className="text-[10px] font-bold text-midnight/40 uppercase tracking-[2] mb-2 ml-1 font-sans">
                  Phone Number
                </StyledText>
                <StyledView className="flex-row items-center">
                  <StyledTextInput
                    placeholder="06..."
                    placeholderTextColor="#1E293B40"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    editable={!otpSent}
                    className={`flex-1 bg-white/50 border-2 ${otpSent ? 'border-wax/20' : 'border-midnight/10'} p-4 rounded-lg text-midnight font-serif text-lg`}
                  />
                  {!otpSent && (
                    <StyledTouchableOpacity
                      onPress={handleSendOtp}
                      disabled={isSendingOtp}
                      className="ml-2 bg-wax p-4 rounded-lg items-center justify-center"
                    >
                      {isSendingOtp ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <WhatsappLogo size={24} color="white" weight="fill" />
                      )}
                    </StyledTouchableOpacity>
                  )}
                </StyledView>
              </StyledView>

              {otpSent && (
                <>
                  <StyledView className="mt-4">
                    <StyledText className="text-[10px] font-bold text-midnight/40 uppercase tracking-[2] mb-2 ml-1 font-sans">
                      Verification Code (OTP)
                    </StyledText>
                    <StyledTextInput
                      placeholder="1234"
                      placeholderTextColor="#1E293B40"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      className="bg-white/50 border-2 border-wax p-4 rounded-lg text-midnight font-serif text-lg tracking-[4] text-center"
                    />
                    <StyledText className="text-[10px] text-wax font-bold uppercase tracking-[-0.5] mt-2 text-center">
                      Code sent via WhatsApp
                    </StyledText>
                  </StyledView>

                  <StyledView className="mt-4">
                    <StyledText className="text-[10px] font-bold text-midnight/40 uppercase tracking-[2] mb-2 ml-1 font-sans">
                      Dossier Password
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
                </>
              )}

              {error && (
                <StyledText className="text-wax text-xs mt-6 font-sans font-bold uppercase tracking-[-0.5] text-center">
                  {error}
                </StyledText>
              )}
            </StyledView>
          </StyledView>

          <StyledView className="mt-12">
            {otpSent ? (
              <StyledTouchableOpacity
                onPress={handleRegister}
                disabled={isSubmitting}
                activeOpacity={0.8}
                className="bg-midnight p-5 rounded-lg flex-row items-center justify-center shadow-md"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <CheckCircle size={20} color="white" weight="bold" className="mr-2" />
                    <StyledText className="text-white font-bold uppercase tracking-[4] ml-2 font-sans">
                      Finalize Registration
                    </StyledText>
                  </>
                )}
              </StyledTouchableOpacity>
            ) : (
              <StyledView className="bg-midnight/5 p-5 rounded-lg border-2 border-dashed border-midnight/10">
                <StyledText className="text-midnight/30 text-center font-sans uppercase tracking-wider text-xs">
                  Awaiting phone verification...
                </StyledText>
              </StyledView>
            )}

            <StyledView className="flex-row justify-center mt-8">
              <StyledText className="text-midnight/50 font-serif">Already registered? </StyledText>
              <Link href="/(auth)/login" asChild>
                <StyledTouchableOpacity>
                  <StyledText className="text-wax font-bold uppercase tracking-[2] text-xs font-sans">
                    Identify Self
                  </StyledText>
                </StyledTouchableOpacity>
              </Link>
            </StyledView>
          </StyledView>
        </StyledView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
